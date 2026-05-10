package service

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"time"

	"gorm.io/gorm/clause"
	"gorm.io/gorm"
)

type PaymentService interface {
	GetAllPayments() ([]models.Pembayaran, error)
	ConfirmPayment(paymentID uint) error
	RejectPayment(paymentID uint) error
	CreatePaymentSession(pemesananID uint, paymentType string, userID uint) (*models.Pembayaran, error)
	ConfirmCashPayment(paymentID uint) error
	GetPaymentReminders(userID uint) ([]models.PaymentReminder, error)
	CreatePaymentReminder(pembayaranID uint, jumlahBayar float64, daysUntilDue int) error
	UploadPaymentProof(paymentID uint, buktiTransfer string, userID uint) error
}

type paymentService struct {
	repo        repository.PaymentRepository
	bookingRepo repository.BookingRepository
	kamarRepo   repository.KamarRepository
	penyewaRepo repository.PenyewaRepository
	db          *gorm.DB
	emailSender utils.EmailSender
	waSender    utils.WhatsAppSender
}

func NewPaymentService(repo repository.PaymentRepository, bookingRepo repository.BookingRepository, kamarRepo repository.KamarRepository, penyewaRepo repository.PenyewaRepository, db *gorm.DB, emailSender utils.EmailSender, waSender utils.WhatsAppSender) PaymentService {
	return &paymentService{repo, bookingRepo, kamarRepo, penyewaRepo, db, emailSender, waSender}
}

func (s *paymentService) GetAllPayments() ([]models.Pembayaran, error) {
	return s.repo.FindAll()
}

func (s *paymentService) ConfirmPayment(paymentID uint) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)
		txBookingRepo := s.bookingRepo.WithTx(tx)
		txKamarRepo := s.kamarRepo.WithTx(tx)

		payment, err := txRepo.FindByID(paymentID)
		if err != nil {
			return err
		}

		// FIX #19: Idempotency check - prevent duplicate confirmation
		if payment.StatusPembayaran == "Confirmed" {
			return fmt.Errorf("pembayaran sudah dikonfirmasi sebelumnya pada %s", payment.ConfirmedAt.Format("02 January 2006 15:04"))
		}

		payment.StatusPembayaran = "Confirmed"
		payment.ConfirmedAt = time.Now() // FIX #1: Track exact confirmation time
		payment.TanggalBayar = time.Now() // Set payment date to now if not set

		if err := txRepo.Update(payment); err != nil {
			return err
		}

		// Update the reminder status to Paid
		if err := tx.Model(&models.PaymentReminder{}).Where("pembayaran_id = ?", payment.ID).Update("status_reminder", "Paid").Error; err != nil {
			return err
		}

		// Also update booking status if needed
		booking, err := txBookingRepo.FindByID(payment.PemesananID)
		if err == nil {
			// FIX #3: Pessimistic lock for extend payment with race condition protection
			if payment.TipePembayaran == "extend" {
				// Re-fetch booking with lock to prevent race condition
				var lockedBooking models.Pemesanan
				if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&lockedBooking, booking.ID).Error; err == nil {
					booking = &lockedBooking
					kamar, kamarErr := txKamarRepo.FindByID(booking.KamarID)
					if kamarErr == nil && kamar.HargaPerBulan > 0 {
						months := int(payment.JumlahBayar / kamar.HargaPerBulan)
						if months > 0 {
							// FIX #11: Update both duration AND extend end date
							booking.DurasiSewa += months
							// Recalculate TanggalKeluar based on new total duration
							booking.TanggalKeluar = booking.TanggalMulai.AddDate(0, booking.DurasiSewa, 0)
						}
					}
				}
			}

			// FIX #10: Check if it's a DP payment without full payment
			if payment.TipePembayaran == "dp" && payment.StatusPembayaran == "Confirmed" {
				// We can check if there are any other Confirmed non-dp payments for this booking
				// Simplest way: For DP, just set status to Partially Paid to block move-in
				booking.StatusPemesanan = "Partially Paid"
			} else {
				booking.StatusPemesanan = "Confirmed"
			}

			// Ensure TanggalKeluar is calculated if for some reason it's zero
			if booking.TanggalKeluar.IsZero() {
				booking.TanggalKeluar = booking.TanggalMulai.AddDate(0, booking.DurasiSewa, 0)
			}

			if err := txBookingRepo.Update(booking); err != nil {
				return err
			}

			// FIX #1: Atomic room status update - use pessimistic lock
			// Only mark Room as "Penuh" if booking is truly Confirmed or securing it with DP
			var lockedKamar models.Kamar
			if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&lockedKamar, booking.KamarID).Error; err == nil {
				lockedKamar.Status = "Penuh"
				if err := txKamarRepo.Update(&lockedKamar); err != nil {
					return err
				}
			}

			// Update penyewa role from guest to tenant on first confirmed payment
			if s.penyewaRepo != nil {
				var penyewa models.Penyewa
				if err := tx.Where("id = ?", booking.PenyewaID).First(&penyewa).Error; err == nil {
					if penyewa.Role == "guest" {
						// Check if this is the first confirmed payment
						var confirmedPaymentCount int64
						tx.Table("pembayaran").
							Joins("JOIN pemesanan ON pemesanan.id = pembayaran.pemesanan_id").
							Where("pemesanan.penyewa_id = ? AND pembayaran.status_pembayaran = ?", booking.PenyewaID, "Confirmed").
							Count(&confirmedPaymentCount)

						if confirmedPaymentCount <= 1 { // This is the first confirmed payment
							if err := tx.Model(&penyewa).Update("role", "tenant").Error; err != nil {
								return err
							}
						}
					}
				}
			}
		}

		// Send Notifications
		go s.sendSuccessNotifications(payment.ID)

		return nil
	})
}

func (s *paymentService) RejectPayment(paymentID uint) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)

		payment, err := txRepo.FindByID(paymentID)
		if err != nil {
			return err
		}

		payment.StatusPembayaran = "Rejected"
		if err := txRepo.Update(payment); err != nil {
			return err
		}

		// Also update the reminder status to Rejected so frontend reflects it
		return tx.Model(&models.PaymentReminder{}).
			Where("pembayaran_id = ?", payment.ID).
			Update("status_reminder", "Rejected").Error
	})
}

// CreatePaymentSession now only creates a Pending Manual payment
func (s *paymentService) CreatePaymentSession(pemesananID uint, paymentType string, userID uint) (*models.Pembayaran, error) {
	booking, err := s.bookingRepo.FindByID(pemesananID)
	if err != nil {
		return nil, err
	}

	// SECURITY FIX: Verify ownership
	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("user profile not found")
	}

	if booking.PenyewaID != penyewa.ID {
		return nil, fmt.Errorf("unauthorized: you can only pay for your own bookings")
	}

	kamar, err := s.kamarRepo.FindByID(booking.KamarID)
	if err != nil {
		return nil, err
	}

	// Hitung total amount
	totalAmount := float64(booking.DurasiSewa) * kamar.HargaPerBulan
	var dpAmount float64
	var finalAmount float64

	if paymentType == "dp" {
		// DP = 30% dari total
		dpAmount = totalAmount * 0.3
		finalAmount = dpAmount
	} else {
		// Full payment
		finalAmount = totalAmount
		dpAmount = 0
	}

	// Save payment record
	payment := models.Pembayaran{
		PemesananID:      pemesananID,
		JumlahBayar:      finalAmount,
		StatusPembayaran: "Pending",
		MetodePembayaran: "manual", // Forced to manual
		TipePembayaran:   paymentType,
		JumlahDP:         dpAmount,
		IdempotencyKey:   fmt.Sprintf("PAY-S%d-%d", pemesananID, time.Now().UnixNano()),
	}

	// Set jatuh tempo untuk pembayaran cicilan
	if paymentType == "dp" {
		// Cicilan berikutnya 1 bulan setelah move in
		payment.TanggalJatuhTempo = booking.TanggalMulai.AddDate(0, 1, 0)
	}

	if err := s.repo.Create(&payment); err != nil {
		return nil, err
	}

	// Create payment reminder untuk dp
	if paymentType == "dp" {
		s.CreatePaymentReminder(payment.ID, totalAmount-dpAmount, 30) // Assuming 30 days later
	}

	return &payment, nil
}

// UploadPaymentProof allows user to upload receipt with ownership check
func (s *paymentService) UploadPaymentProof(paymentID uint, buktiTransfer string, userID uint) error {
	payment, err := s.repo.FindByID(paymentID)
	if err != nil {
		return err
	}

	// SECURITY FIX: Verify ownership
	booking, err := s.bookingRepo.FindByID(payment.PemesananID)
	if err != nil {
		return fmt.Errorf("failed to verify payment ownership: %v", err)
	}

	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return fmt.Errorf("user profile not found")
	}

	if booking.PenyewaID != penyewa.ID {
		return fmt.Errorf("unauthorized: you can only upload proof for your own payments")
	}

	payment.BuktiTransfer = buktiTransfer
	// Reset status to Pending so admin can process the new proof.
	// This handles the re-upload case where payment was previously Rejected.
	payment.StatusPembayaran = "Pending"

	if err := s.repo.Update(payment); err != nil {
		return err
	}

	// Also reset the reminder status to Pending so it shows correctly in My Bills
	if s.db != nil {
		s.db.Model(&models.PaymentReminder{}).
			Where("pembayaran_id = ?", payment.ID).
			Update("status_reminder", "Pending")
	}

	return nil
}

func (s *paymentService) ConfirmCashPayment(paymentID uint) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)

		payment, err := txRepo.FindByID(paymentID)
		if err != nil {
			return err
		}

		// Update status pembayaran menjadi Menunggu Konfirmasi Admin
		payment.StatusPembayaran = "Menunggu Konfirmasi Admin"

		if err := txRepo.Update(payment); err != nil {
			return err
		}

		return nil
	})
}

func (s *paymentService) GetPaymentReminders(userID uint) ([]models.PaymentReminder, error) {
	var reminders []models.PaymentReminder

	// Use subquery to find pembayaran_ids for the specific user
	// This ensures GORM's Preload works perfectly without Joins-related interference
	subQuery := s.db.Table("pembayarans").
		Select("pembayarans.id").
		Joins("JOIN pemesanans ON pemesanans.id = pembayarans.pemesanan_id").
		Joins("JOIN penyewas ON penyewas.id = pemesanans.penyewa_id").
		Where("penyewas.user_id = ?", userID)

	err := s.db.Model(&models.PaymentReminder{}).
		Where("pembayaran_id IN (?)", subQuery).
		Preload("Pembayaran.Pemesanan.Kamar").
		Order("tanggal_reminder ASC").
		Find(&reminders).Error

	return reminders, err
}

func (s *paymentService) CreatePaymentReminder(pembayaranID uint, jumlahBayar float64, daysUntilDue int) error {
	// FIX #5: Deduplicate pending reminders to prevent multiple simultaneous bills
	var count int64
	s.db.Model(&models.PaymentReminder{}).
		Where("pembayaran_id = ? AND status_reminder = ?", pembayaranID, "Pending").
		Count(&count)
	
	if count > 0 {
		return nil // Active reminder already exists, no need to recreate
	}

	// Hitung tanggal jatuh tempo
	dueDate := time.Now().AddDate(0, 0, daysUntilDue)

	reminder := models.PaymentReminder{
		PembayaranID:    pembayaranID,
		JumlahBayar:     jumlahBayar,
		TanggalReminder: dueDate,
		StatusReminder:  "Pending",
		IsSent:          false,
	}

	if err := s.db.Create(&reminder).Error; err != nil {
		return err
	}

	return nil
}

// Helper to send notifications
func (s *paymentService) sendSuccessNotifications(paymentID uint) {
	var payment models.Pembayaran
	if err := s.db.Preload("Pemesanan.Penyewa").Preload("Pemesanan.Kamar").First(&payment, paymentID).Error; err != nil {
		return
	}

	tenant := payment.Pemesanan.Penyewa

	// Email
	if tenant.Email != "" {
		if err := s.emailSender.SendPaymentSuccessEmail(tenant.Email, tenant.NamaLengkap, payment.JumlahBayar, time.Now()); err != nil {
			fmt.Printf("[Warning] FIX #18: Failed to send Email notification for payment %d: %v\n", payment.ID, err)
		}
	}

	// WhatsApp
	if tenant.NomorHP != "" {
		msg := fmt.Sprintf("Terima kasih %s! Pembayaran sebesar Rp %.0f untuk kamar %s telah kami terima.",
			tenant.NamaLengkap, payment.JumlahBayar, payment.Pemesanan.Kamar.NomorKamar)
		if err := s.waSender.SendWhatsApp(tenant.NomorHP, msg); err != nil {
			fmt.Printf("[Warning] FIX #18: Failed to send WA notification for payment %d: %v\n", payment.ID, err)
		}
	}
}
