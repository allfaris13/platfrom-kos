package service

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"time"

	"gorm.io/gorm"
)

type BookingResponse struct {
	ID              uint                `json:"id"`
	KamarID         uint                `json:"kamar_id"`
	Kamar           models.Kamar        `json:"kamar"`
	TanggalMulai    string              `json:"tanggal_mulai"`
	DurasiSewa      int                 `json:"durasi_sewa"`
	StatusPemesanan string              `json:"status_pemesanan"`
	TotalBayar      float64             `json:"total_bayar"`
	StatusBayar     string              `json:"status_bayar"`
	Payments        []models.Pembayaran `json:"payments"`
}

type BookingService interface {
	GetUserBookings(userID uint) ([]BookingResponse, error)
	CreateBooking(userID uint, kamarID uint, tanggalMulai string, durasiSewa int) (*models.Pemesanan, error)
	CreateBookingWithProof(userID uint, kamarID uint, tanggalMulai string, durasiSewa int, proofURL string, paymentType string, paymentMethod string) (*models.Pemesanan, error)
	CancelBooking(id uint, userID uint) error
	ExtendBooking(bookingID uint, months int, userID uint, paymentMethod string) (*models.Pembayaran, error)
	AutoCancelExpiredBookings() error
}

type bookingService struct {
	repo        repository.BookingRepository
	userRepo    repository.UserRepository
	penyewaRepo repository.PenyewaRepository
	kamarRepo   repository.KamarRepository
	paymentRepo repository.PaymentRepository
	db          *gorm.DB // Added db for transactions
	waSender    utils.WhatsAppSender
}

func NewBookingService(repo repository.BookingRepository, userRepo repository.UserRepository, penyewaRepo repository.PenyewaRepository, kamarRepo repository.KamarRepository, paymentRepo repository.PaymentRepository, db *gorm.DB, waSender utils.WhatsAppSender) BookingService {
	return &bookingService{repo, userRepo, penyewaRepo, kamarRepo, paymentRepo, db, waSender}
}

func (s *bookingService) GetUserBookings(userID uint) ([]BookingResponse, error) {
	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return []BookingResponse{}, nil // No penyewa record yet
	}
	bookings, err := s.repo.FindByPenyewaIDWithPayments(penyewa.ID)
	if err != nil {
		return nil, err
	}

	var response []BookingResponse
	for _, b := range bookings {
		// PERFORMANCE: Payments are already loaded via Preload - no additional query!
		payments := b.Pembayaran

		var totalPaid float64
		var lastStatus string
		var latestPaymentID uint
		for _, p := range payments {
			if p.StatusPembayaran == "Confirmed" {
				totalPaid += p.JumlahBayar
			}
			// Use the most recent payment's status (highest ID = newest)
			if p.ID > latestPaymentID {
				latestPaymentID = p.ID
				lastStatus = p.StatusPembayaran
			}
		}

		actualDurasi := b.DurasiSewa
		if b.Kamar.HargaPerBulan > 0 {
			paidMonths := int(totalPaid / b.Kamar.HargaPerBulan)
			if paidMonths > actualDurasi {
				actualDurasi = paidMonths
			}
		}

		response = append(response, BookingResponse{
			ID:              b.ID,
			KamarID:         b.KamarID,
			Kamar:           b.Kamar, // Already preloaded
			TanggalMulai:    b.TanggalMulai.Format("2006-01-02"),
			DurasiSewa:      actualDurasi,
			StatusPemesanan: b.StatusPemesanan,
			TotalBayar:      totalPaid,
			StatusBayar:     lastStatus,
			Payments:        payments,
		})
	}

	if response == nil {
		response = []BookingResponse{}
	}
	return response, nil
}

func (s *bookingService) CreateBooking(userID uint, kamarID uint, tanggalMulai string, durasiSewa int) (*models.Pemesanan, error) {
	var booking models.Pemesanan

	err := s.db.Transaction(func(tx *gorm.DB) error {
		penyewa, err := s.penyewaRepo.WithTx(tx).FindByUserID(userID)
		if err != nil {
			return err
		}

		// Check for active bookings
		bookings, _ := s.repo.WithTx(tx).FindByPenyewaID(penyewa.ID)
		for _, b := range bookings {
			if b.StatusPemesanan == "Pending" {
				return fmt.Errorf("anda sudah memiliki pesanan aktif (Pending). Selesaikan pembayaran atau batalkan pesanan sebelumnya")
			}
			if b.StatusPemesanan == "Confirmed" || b.StatusPemesanan == "Partially Paid" {
				if time.Now().Before(b.TanggalKeluar) {
					return fmt.Errorf("masa sewa anda masih aktif hingga %s. Tidak bisa memesan kamar lain", b.TanggalKeluar.Format("02 January 2006"))
				}
			}
		}

		// LOCK ROOM FOR UPDATE to prevent race condition
		kamar, err := s.kamarRepo.WithTx(tx).FindByIDForUpdate(kamarID)
		if err != nil {
			return err
		}

		if kamar.Status != "Tersedia" {
			return fmt.Errorf("kamar %s sudah tidak tersedia (Status: %s)", kamar.NomorKamar, kamar.Status)
		}

		tm, err := time.Parse("2006-01-02", tanggalMulai)
		if err != nil {
			return err
		}

		// Calculate TanggalKeluar explicitly
		tanggalKeluar := tm.AddDate(0, durasiSewa, 0)

		booking = models.Pemesanan{
			PenyewaID:       penyewa.ID,
			KamarID:         kamarID,
			TanggalMulai:    tm,
			TanggalKeluar:   tanggalKeluar,
			DurasiSewa:      durasiSewa,
			StatusPemesanan: "Pending",
		}

		if err := s.repo.WithTx(tx).Create(&booking); err != nil {
			return err
		}

		// Update room status to Terpesan
		kamar.Status = "Terpesan"
		if err := s.kamarRepo.WithTx(tx).Update(kamar); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &booking, nil
}

func (s *bookingService) CreateBookingWithProof(userID uint, kamarID uint, tanggalMulai string, durasiSewa int, proofURL string, paymentType string, paymentMethod string) (*models.Pemesanan, error) {
	tm, err := time.Parse("2006-01-02", tanggalMulai)
	if err != nil {
		return nil, err
	}

	var booking *models.Pemesanan

	err = s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)
		txPenyewaRepo := s.penyewaRepo.WithTx(tx)
		txKamarRepo := s.kamarRepo.WithTx(tx)
		txPaymentRepo := s.paymentRepo.WithTx(tx)

		penyewa, err := txPenyewaRepo.FindByUserID(userID)
		if err != nil {
			return err
		}

		// Check for active bookings
		existingBookings, _ := txRepo.FindByPenyewaID(penyewa.ID)
		for _, b := range existingBookings {
			if b.StatusPemesanan == "Pending" {
				return fmt.Errorf("anda sudah memiliki pesanan aktif (Pending). Selesaikan pembayaran atau batalkan pesanan sebelumnya")
			}
			if b.StatusPemesanan == "Confirmed" || b.StatusPemesanan == "Partially Paid" {
				if time.Now().Before(b.TanggalKeluar) {
					return fmt.Errorf("masa sewa anda masih aktif hingga %s. Tidak bisa memesan kamar lain", b.TanggalKeluar.Format("02 January 2006"))
				}
			}
		}

		// LOCK ROOM FOR UPDATE to prevent race condition
		kamar, err := txKamarRepo.FindByIDForUpdate(kamarID)
		if err != nil {
			return err
		}

		if kamar.Status != "Tersedia" {
			return fmt.Errorf("kamar %s sudah tidak tersedia (Status: %s)", kamar.NomorKamar, kamar.Status)
		}

		tanggalKeluar := tm.AddDate(0, durasiSewa, 0)

		// 1. Create Booking
		newBooking := models.Pemesanan{
			PenyewaID:       penyewa.ID,
			KamarID:         kamarID,
			TanggalMulai:    tm,
			TanggalKeluar:   tanggalKeluar,
			DurasiSewa:      durasiSewa,
			StatusPemesanan: "Pending",
		}

		if err := txRepo.Create(&newBooking); err != nil {
			return err
		}

		// Update room status to Terpesan
		kamar.Status = "Terpesan"
		if err := txKamarRepo.Update(kamar); err != nil {
			return err
		}
		booking = &newBooking

		// 2. Setup Payment
		// kamar already loaded with lock above
		totalAmount := float64(durasiSewa) * kamar.HargaPerBulan
		var dpAmount float64
		var finalAmount float64

		if paymentType == "dp" {
			dpAmount = totalAmount * 0.3
			finalAmount = dpAmount
		} else {
			finalAmount = totalAmount
			dpAmount = 0
		}

		payment := models.Pembayaran{
			PemesananID:      newBooking.ID,
			JumlahBayar:      finalAmount,
			StatusPembayaran: "Pending",
			MetodePembayaran: paymentMethod, // Use the passed method
			TipePembayaran:   paymentType,
			JumlahDP:         dpAmount,
			BuktiTransfer:    proofURL,
			TanggalBayar:     time.Now(),
			IdempotencyKey:   fmt.Sprintf("PAY-B%d-%d", newBooking.ID, time.Now().UnixNano()),
		}

		if paymentType == "dp" {
			payment.TanggalJatuhTempo = tm.AddDate(0, 1, 0)
		}

		if err := txPaymentRepo.Create(&payment); err != nil {
			return err
		}

		// Create reminder for BOTH full and dp payments so it shows up in "My Bills"
		var reminderAmount float64
		if paymentType == "dp" {
			reminderAmount = totalAmount - dpAmount // Sisa bayar setelah DP
		} else {
			reminderAmount = totalAmount // Full amount
		}

		reminderDate := time.Now().AddDate(0, 0, 3) // Due in 3 days
		reminder := models.PaymentReminder{
			PembayaranID:    payment.ID,
			JumlahBayar:     reminderAmount,
			TanggalReminder: reminderDate,
			StatusReminder:  "Pending",
			IsSent:          false,
		}
		if err := txPaymentRepo.CreateReminder(&reminder); err != nil {
			fmt.Printf("Warning: Failed to create reminder for payment %d: %v\n", payment.ID, err)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return booking, nil
}

func (s *bookingService) CancelBooking(id uint, userID uint) error {
	// Fallback for Unit Tests passing nil DB
	if s.db == nil {
		booking, err := s.repo.FindByID(id)
		if err != nil {
			return err
		}
		penyewa, err := s.penyewaRepo.FindByUserID(userID)
		if err != nil {
			return fmt.Errorf("unauthorized")
		}
		if booking.PenyewaID != penyewa.ID {
			return fmt.Errorf("unauthorized")
		}
		s.repo.UpdateStatus(id, "Cancelled")
		s.kamarRepo.UpdateStatus(booking.KamarID, "Tersedia")
		s.paymentRepo.DeleteByBookingID(id)
		return nil
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		txBookingRepo := s.repo.WithTx(tx)
		txKamarRepo := s.kamarRepo.WithTx(tx)

		booking, err := txBookingRepo.FindByID(id)
		if err != nil {
			return err
		}

		// SECURITY FIX: Verify user owns this booking (IDOR protection)
		penyewa, err := s.penyewaRepo.FindByUserID(userID)
		if err != nil {
			return fmt.Errorf("penyewa profile not found")
		}

		if booking.PenyewaID != penyewa.ID {
			return fmt.Errorf("unauthorized: you can only cancel your own bookings")
		}

		if booking.StatusPemesanan == "Cancelled" {
			return fmt.Errorf("booking is already cancelled")
		}

		// Update status to Cancelled
		if err := txBookingRepo.UpdateStatus(id, "Cancelled"); err != nil {
			return err
		}

		// Update Room Status back to Available (Tersedia)
		if err := txKamarRepo.UpdateStatus(booking.KamarID, "Tersedia"); err != nil {
			return fmt.Errorf("failed to reset room status: %v", err)
		}

		// FIX #2, #9: Soft delete payments - mark as Cancelled instead of hard delete
		// This preserves audit trail and prevents orphaned reminders
		if err := tx.Model(&models.Pembayaran{}).
			Where("pemesanan_id = ?", id).
			Update("status_pembayaran", "Cancelled").Error; err != nil {
			return fmt.Errorf("failed to cancel pending payments: %v", err)
		}

		// Also mark associated payment reminders as Cancelled
		if err := tx.Model(&models.PaymentReminder{}).
			Where("pembayaran_id IN (SELECT id FROM pembayarans WHERE pemesanan_id = ?)", id).
			Update("status_reminder", "Cancelled").Error; err != nil {
			return fmt.Errorf("failed to cancel payment reminders: %v", err)
		}

		return nil
	})
}

// ExtendBooking creates a new payment for extending the lease
func (s *bookingService) ExtendBooking(bookingID uint, months int, userID uint, paymentMethod string) (*models.Pembayaran, error) {
	booking, err := s.repo.FindByID(bookingID)
	if err != nil {
		return nil, err
	}

	// SECURITY FIX: Verify user owns this booking (IDOR protection)
	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("penyewa profile not found")
	}

	if booking.PenyewaID != penyewa.ID {
		return nil, fmt.Errorf("unauthorized: you can only extend your own bookings")
	}

	if booking.StatusPemesanan == "Partially Paid" {
		return nil, fmt.Errorf("anda baru membayar DP. Harap lunasi pembayaran awal terlebih dahulu sebelum memperpanjang sewa")
	}

	if booking.StatusPemesanan != "Confirmed" {
		return nil, fmt.Errorf("hanya booking yang sudah dikonfirmasi yang bisa diperpanjang")
	}

	// Check if there's any pending or rejected payment
	if len(booking.Pembayaran) > 0 {
		for _, payment := range booking.Pembayaran {
			if payment.StatusPembayaran == "Pending" || payment.StatusPembayaran == "Rejected" {
				return nil, fmt.Errorf("pengajuan gagal karena anda masih punya pembayaran yang belum terkonfirmasi")
			}
		}
	}

	// Calculate amount
	amount := booking.Kamar.HargaPerBulan * float64(months)

	// Create new payment record
	payment := models.Pembayaran{
		PemesananID:      booking.ID,
		JumlahBayar:      amount,
		TanggalBayar:     time.Now(),
		StatusPembayaran: "Pending",
		MetodePembayaran: paymentMethod, // Selected method (bank_transfer or cash)
		TipePembayaran:   "extend",      // New type for extension
		JumlahDP:         0,
		IdempotencyKey:   fmt.Sprintf("PAY-E%d-%d", booking.ID, time.Now().UnixNano()),
	}

	if err := s.paymentRepo.Create(&payment); err != nil {
		return nil, err
	}

	// Create Payment Reminder so it shows up in "My Bills"
	reminder := models.PaymentReminder{
		PembayaranID:    payment.ID,
		JumlahBayar:     payment.JumlahBayar,
		TanggalReminder: time.Now().AddDate(0, 0, 3), // Due in 3 days
		StatusReminder:  "Pending",
		IsSent:          false,
	}

	if err := s.paymentRepo.CreateReminder(&reminder); err != nil {
		fmt.Printf("Failed to create reminder for payment %d: %v\n", payment.ID, err)
		// Non-critical error, payment still created
	}

	return &payment, nil
}

func (s *bookingService) AutoCancelExpiredBookings() error {
	// 1 week deadline
	deadline := time.Now().AddDate(0, 0, -7)

	expiredBookings, err := s.repo.FindExpiredPendingBookings(deadline)
	if err != nil {
		return err
	}

	for _, b := range expiredBookings {
		err := s.db.Transaction(func(tx *gorm.DB) error {
			// Cancel booking
			if err := s.repo.WithTx(tx).UpdateStatus(b.ID, "Cancelled"); err != nil {
				return err
			}

			// Update room to available
			if err := s.kamarRepo.WithTx(tx).UpdateStatus(b.KamarID, "Tersedia"); err != nil {
				return err
			}

			// Send WA Notification
			if b.Penyewa.NomorHP != "" {
				msg := fmt.Sprintf("Halo %s,\n\nPesanan Anda untuk Kamar %s telah otomatis dibatalkan karena tidak ada pembayaran yang dikonfirmasi dalam waktu 7 hari.\n\nSilakan lakukan pemesanan ulang jika Anda masih berminat.\n\nTerima kasih.", b.Penyewa.NamaLengkap, b.Kamar.NomorKamar)
				go s.waSender.SendWhatsApp(b.Penyewa.NomorHP, msg)
			}

			return nil
		})

		if err != nil {
			fmt.Printf("Failed to auto-cancel booking %d: %v\n", b.ID, err)
		}
	}

	if len(expiredBookings) > 0 {
		fmt.Printf("Auto-cancelled %d expired bookings\n", len(expiredBookings))
	}

	return nil
}
