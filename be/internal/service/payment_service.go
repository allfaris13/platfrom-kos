package service

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"time"

	"gorm.io/gorm"
)

type PaymentService interface {
	GetAllPayments() ([]models.Pembayaran, error)
	ConfirmPayment(paymentID uint) error
	RejectPayment(paymentID uint) error
	CreatePaymentSession(pemesananID uint, paymentType string) (*models.Pembayaran, error)
	ConfirmCashPayment(paymentID uint, buktiTransfer string) error
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

		payment.StatusPembayaran = "Confirmed"
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
			// If this is an extension payment, increase the DurasiSewa based on payment amount and room price
			if payment.TipePembayaran == "extend" {
				kamar, kamarErr := txKamarRepo.FindByID(booking.KamarID)
				if kamarErr == nil && kamar.HargaPerBulan > 0 {
					months := int(payment.JumlahBayar / kamar.HargaPerBulan)
					if months > 0 {
						booking.DurasiSewa += months
					}
				}
			}

			booking.StatusPemesanan = "Confirmed"
			if err := txBookingRepo.Update(booking); err != nil {
				return err
			}

			// 1 kamar = 1 penyewa: langsung tandai Penuh saat ada booking Confirmed
			kamar, err := txKamarRepo.FindByID(booking.KamarID)
			if err == nil {
				kamar.Status = "Penuh"
				if err := txKamarRepo.Update(kamar); err != nil {
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
func (s *paymentService) CreatePaymentSession(pemesananID uint, paymentType string) (*models.Pembayaran, error) {
	booking, err := s.bookingRepo.FindByID(pemesananID)
	if err != nil {
		return nil, err
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

func (s *paymentService) ConfirmCashPayment(paymentID uint, buktiTransfer string) error {
	// Reusing ConfirmPayment logic but allowing to set proof if provided
	return s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)

		payment, err := txRepo.FindByID(paymentID)
		if err != nil {
			return err
		}

		if buktiTransfer != "" {
			payment.BuktiTransfer = buktiTransfer
		}

		if err := txRepo.Update(payment); err != nil {
			return err
		}

		// Use the main confirmation logic
		return s.ConfirmPayment(paymentID)
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
		s.emailSender.SendPaymentSuccessEmail(tenant.Email, tenant.NamaLengkap, payment.JumlahBayar, time.Now())
	}

	// WhatsApp
	if tenant.NomorHP != "" {
		msg := fmt.Sprintf("Terima kasih %s! Pembayaran sebesar Rp %.0f untuk kamar %s telah kami terima.",
			tenant.NamaLengkap, payment.JumlahBayar, payment.Pemesanan.Kamar.NomorKamar)
		s.waSender.SendWhatsApp(tenant.NomorHP, msg)
	}
}
