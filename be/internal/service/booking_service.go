package service

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"time"

	"gorm.io/gorm"
)

type BookingResponse struct {
	ID              uint                `json:"id"`
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
	ExtendBooking(bookingID uint, months int, userID uint) (*models.Pembayaran, error)
	AutoCancelExpiredBookings() error
}

type bookingService struct {
	repo        repository.BookingRepository
	userRepo    repository.UserRepository
	penyewaRepo repository.PenyewaRepository
	kamarRepo   repository.KamarRepository
	paymentRepo repository.PaymentRepository
	db          *gorm.DB // Added db for transactions
}

func NewBookingService(repo repository.BookingRepository, userRepo repository.UserRepository, penyewaRepo repository.PenyewaRepository, kamarRepo repository.KamarRepository, paymentRepo repository.PaymentRepository, db *gorm.DB) BookingService {
	return &bookingService{repo, userRepo, penyewaRepo, kamarRepo, paymentRepo, db}
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
		for _, p := range payments {
			if p.StatusPembayaran == "Confirmed" {
				totalPaid += p.JumlahBayar
			}
			lastStatus = p.StatusPembayaran
		}

		response = append(response, BookingResponse{
			ID:              b.ID,
			Kamar:           b.Kamar, // Already preloaded
			TanggalMulai:    b.TanggalMulai.Format("2006-01-02"),
			DurasiSewa:      b.DurasiSewa,
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
	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Check for active bookings
	bookings, _ := s.repo.FindByPenyewaID(penyewa.ID)
	for _, b := range bookings {
		// 1. Check for Pending bookings
		if b.StatusPemesanan == "Pending" {
			return nil, fmt.Errorf("anda sudah memiliki pesanan aktif (Pending). Selesaikan pembayaran atau batalkan pesanan sebelumnya")
		}

		// 2. Check for Active Confirmed bookings (Lease period check)
		if b.StatusPemesanan == "Confirmed" {
			// Calculate lease end date: StartDate + Duration (months)
			endDate := b.TanggalMulai.AddDate(0, b.DurasiSewa, 0)
			
			// If today is before end date, lease is still active
			if time.Now().Before(endDate) {
				return nil, fmt.Errorf("masa sewa anda masih aktif hingga %s. Tidak bisa memesan kamar lain", endDate.Format("02 January 2006"))
			}
		}
	}

	tm, err := time.Parse("2006-01-02", tanggalMulai)
	if err != nil {
		return nil, err
	}

	booking := models.Pemesanan{
		PenyewaID:       penyewa.ID,
		KamarID:         kamarID,
		TanggalMulai:    tm,
		DurasiSewa:      durasiSewa,
		StatusPemesanan: "Pending",
	}

	if err := s.repo.Create(&booking); err != nil {
		return nil, err
	}

	// ROLE TRANSITION: If user was a guest, promote to tenant
	if penyewa.Role == "guest" {
		// 1. Update Penyewa record role
		if err := s.penyewaRepo.UpdateRole(penyewa.ID, "tenant"); err != nil {
			fmt.Printf("Warning: Failed to update penyewa role for user %d: %v\n", userID, err)
		}
		
		// 2. Update User record role
		user, err := s.userRepo.FindByID(userID)
		if err == nil {
			user.Role = "tenant"
			if err := s.userRepo.Update(user); err != nil {
				fmt.Printf("Warning: Failed to update user role for user %d: %v\n", userID, err)
			}
		}
	}

	// Re-fetch to get associations if needed, or just return
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
		txUserRepo := s.userRepo.WithTx(tx)
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
			if b.StatusPemesanan == "Confirmed" {
				endDate := b.TanggalMulai.AddDate(0, b.DurasiSewa, 0)
				if time.Now().Before(endDate) {
					return fmt.Errorf("masa sewa anda masih aktif hingga %s. Tidak bisa memesan kamar lain", endDate.Format("02 January 2006"))
				}
			}
		}

		// 1. Create Booking
		newBooking := models.Pemesanan{
			PenyewaID:       penyewa.ID,
			KamarID:         kamarID,
			TanggalMulai:    tm,
			DurasiSewa:      durasiSewa,
			StatusPemesanan: "Pending",
		}

		if err := txRepo.Create(&newBooking); err != nil {
			return err
		}
		booking = &newBooking

		// 2. Setup Payment
		kamar, err := txKamarRepo.FindByID(kamarID)
		if err != nil {
			return err
		}

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
		}

		if paymentType == "dp" {
			payment.TanggalJatuhTempo = tm.AddDate(0, 1, 0)
		}

		if err := txPaymentRepo.Create(&payment); err != nil {
			return err
		}

		// Create reminder for DP if needed
		if paymentType == "dp" {
			reminder := models.PaymentReminder{
				PembayaranID:    payment.ID,
				JumlahBayar:     totalAmount - dpAmount,
				TanggalReminder: time.Now().AddDate(0, 0, 30),
				StatusReminder:  "Pending",
				IsSent:          false,
			}
			if err := txPaymentRepo.CreateReminder(&reminder); err != nil {
				fmt.Printf("Warning: Failed to create reminder for payment %d: %v\n", payment.ID, err)
			}
		}

		// 3. Role Transition
		if penyewa.Role == "guest" {
			if err := txPenyewaRepo.UpdateRole(penyewa.ID, "tenant"); err != nil {
				return err
			}
			user, err := txUserRepo.FindByID(userID)
			if err == nil {
				user.Role = "tenant"
				if err := txUserRepo.Update(user); err != nil {
					return err
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return booking, nil
}

func (s *bookingService) CancelBooking(id uint, userID uint) error {
	booking, err := s.repo.FindByID(id)
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

	// Update status to Cancelled.
	// NOTE: Per business requirement, NO Refund is processed even if DP was paid.
	if err := s.repo.UpdateStatus(id, "Cancelled"); err != nil {
		return err
	}

	// NEW: Update Room Status back to Available (Tersedia)
	// Fetch the booking again with Kamar loaded or just use KamarID if available options
	// Since we have 'booking', we can use booking.KamarID
	if err := s.kamarRepo.UpdateStatus(booking.KamarID, "Tersedia"); err != nil {
		return fmt.Errorf("failed to reset room status: %v", err)
	}

	// NEW: Delete associated pending payment so it disappears from Admin Dashboard
	if err := s.paymentRepo.DeleteByBookingID(id); err != nil {
		// Log error but generally don't fail the whole cancellation if this fails? 
		// Or maybe we should? Let's treat it as important.
		return fmt.Errorf("failed to remove pending payment: %v", err)
	}

	return nil
}

// ExtendBooking creates a new payment for extending the lease
func (s *bookingService) ExtendBooking(bookingID uint, months int, userID uint) (*models.Pembayaran, error) {
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

	if booking.StatusPemesanan != "Confirmed" {
		return nil, fmt.Errorf("hanya booking yang sudah dikonfirmasi yang bisa diperpanjang")
	}

	// Calculate amount
	amount := booking.Kamar.HargaPerBulan * float64(months)

	// Create new payment record
	payment := models.Pembayaran{
		PemesananID:      booking.ID,
		JumlahBayar:      amount,
		TanggalBayar:     time.Now(),
		StatusPembayaran: "Pending",
		MetodePembayaran: "manual",   // Default to manual
		TipePembayaran:   "extend",   // New type for extension
		JumlahDP:         0,
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
		// Cancel booking without refund
		if err := s.repo.UpdateStatus(b.ID, "Cancelled"); err != nil {
			fmt.Printf("Failed to auto-cancel booking %d: %v\n", b.ID, err)
			continue
		}
		
		// Update room to available
		if err := s.kamarRepo.UpdateStatus(b.KamarID, "Tersedia"); err != nil {
             fmt.Printf("Failed to update room status for auto-cancelled booking %d: %v\n", b.ID, err)
        }
	}
	
	if len(expiredBookings) > 0 {
		fmt.Printf("Auto-cancelled %d expired bookings\n", len(expiredBookings))
	}

	return nil
}
