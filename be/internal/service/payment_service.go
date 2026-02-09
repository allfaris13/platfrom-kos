package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"time"

	"gorm.io/gorm"
)

type PaymentService interface {
	GetAllPayments() ([]models.Pembayaran, error)
	ConfirmPayment(paymentID uint) error
	CreatePaymentSession(pemesananID uint, paymentType string, paymentMethod string) (string, string, error)
	HandleWebhook(payload map[string]interface{}) error
	ConfirmCashPayment(paymentID uint, buktiTransfer string) error
	GetPaymentReminders() ([]models.PaymentReminder, error)
	CreatePaymentReminder(pembayaranID uint, jumlahBayar float64, daysUntilDue int) error
	VerifyPayment(orderID string) error
}

type paymentService struct {
	repo            repository.PaymentRepository
	bookingRepo     repository.BookingRepository
	kamarRepo       repository.KamarRepository
	midtransService MidtransService
	db              *gorm.DB
}

func NewPaymentService(repo repository.PaymentRepository, bookingRepo repository.BookingRepository, kamarRepo repository.KamarRepository, midtransService MidtransService, db *gorm.DB) PaymentService {
	return &paymentService{repo, bookingRepo, kamarRepo, midtransService, db}
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
		if err := txRepo.Update(payment); err != nil {
			return err
		}

		// Also update booking status if needed
		booking, err := txBookingRepo.FindByID(payment.PemesananID)
		if err == nil {
			booking.StatusPemesanan = "Confirmed"
			if err := txBookingRepo.Update(booking); err != nil {
				return err
			}

			// Update room status to 'Penuh'
			kamar, err := txKamarRepo.FindByID(booking.KamarID)
			if err == nil {
				kamar.Status = "Penuh"
				if err := txKamarRepo.Update(kamar); err != nil {
					return err
				}
			}
		}
		return nil
	})
}

// CreatePaymentSession mendukung multiple payment types dan methods
// paymentType: "full" atau "dp" (down payment)
// paymentMethod: "midtrans" atau "cash"
func (s *paymentService) CreatePaymentSession(pemesananID uint, paymentType string, paymentMethod string) (string, string, error) {
	booking, err := s.bookingRepo.FindByID(pemesananID)
	if err != nil {
		return "", "", err
	}

	kamar, err := s.kamarRepo.FindByID(booking.KamarID)
	if err != nil {
		return "", "", err
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

	var token string
	var redirectURL string

	// Jika cash, tidak perlu create Midtrans transaction
	if paymentMethod == "cash" {
		token = "CASH_PAYMENT"
		redirectURL = ""
	} else {
		// Create Midtrans Transaction untuk midtrans payment
		snapResp, _, err := s.midtransService.CreateTransaction(booking, finalAmount)
		if err != nil {
			return "", "", err
		}
		token = snapResp.Token
		redirectURL = snapResp.RedirectURL
	}

	// Save payment record
	payment := models.Pembayaran{
		PemesananID:      pemesananID,
		JumlahBayar:      finalAmount,
		StatusPembayaran: "Pending",
		MetodePembayaran: paymentMethod,
		TipePembayaran:   paymentType,
		JumlahDP:         dpAmount,
		SnapToken:        token,
	}

	// Set jatuh tempo untuk pembayaran cicilan
	if paymentType == "dp" {
		// Cicilan berikutnya 1 bulan setelah move in
		payment.TanggalJatuhTempo = booking.TanggalMulai.AddDate(0, 1, 0)
	}

	if err := s.repo.Create(&payment); err != nil {
		return "", "", err
	}

	// Create payment reminder untuk dp
	if paymentType == "dp" {
		s.CreatePaymentReminder(payment.ID, totalAmount-dpAmount, 30)
	}

	return token, redirectURL, nil
}

func (s *paymentService) ConfirmCashPayment(paymentID uint, buktiTransfer string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)
		txBookingRepo := s.bookingRepo.WithTx(tx)
		txKamarRepo := s.kamarRepo.WithTx(tx)

		payment, err := txRepo.FindByID(paymentID)
		if err != nil {
			return err
		}

		payment.StatusPembayaran = "Confirmed"
		payment.BuktiTransfer = buktiTransfer
		payment.TanggalBayar = time.Now()

		if err := txRepo.Update(payment); err != nil {
			return err
		}

		// Update booking status
		booking, err := txBookingRepo.FindByID(payment.PemesananID)
		if err == nil {
			booking.StatusPemesanan = "Confirmed"
			if err := txBookingRepo.Update(booking); err != nil {
				return err
			}

			// Update room status
			kamar, err := txKamarRepo.FindByID(booking.KamarID)
			if err == nil {
				kamar.Status = "Penuh"
				if err := txKamarRepo.Update(kamar); err != nil {
					return err
				}
			}
		}

		return nil
	})
}

func (s *paymentService) HandleWebhook(payload map[string]interface{}) error {
	orderID, status, err := s.midtransService.VerifyNotification(payload)
	if err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)
		txBookingRepo := s.bookingRepo.WithTx(tx)
		txKamarRepo := s.kamarRepo.WithTx(tx)

		payment, err := txRepo.FindByOrderID(orderID)
		if err != nil {
			return err
		}

		switch status {
		case "settlement", "capture":
			payment.StatusPembayaran = "Settled"
			if err := txRepo.Update(payment); err != nil {
				return err
			}

			// Update booking status
			booking, err := txBookingRepo.FindByID(payment.PemesananID)
			if err == nil {
				booking.StatusPemesanan = "Confirmed"
				if err := txBookingRepo.Update(booking); err != nil {
					return err
				}

				// Update room status
				kamar, err := txKamarRepo.FindByID(booking.KamarID)
				if err == nil {
					kamar.Status = "Penuh"
					if err := txKamarRepo.Update(kamar); err != nil {
						return err
					}
				}
			}
		case "expire", "cancel", "deny":
			payment.StatusPembayaran = "Failed"
			if err := txRepo.Update(payment); err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *paymentService) GetPaymentReminders() ([]models.PaymentReminder, error) {
	// Note: Implementasi repository method GetPaymentReminders() sesuai kebutuhan
	return []models.PaymentReminder{}, nil
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

func (s *paymentService) VerifyPayment(orderID string) error {
	// 1. Check status real-time ke Midtrans
	statusResp, err := s.midtransService.CheckTransaction(orderID)
	if err != nil {
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)
		txBookingRepo := s.bookingRepo.WithTx(tx)
		txKamarRepo := s.kamarRepo.WithTx(tx)

		// 2. Cari pembayaran di DB
		payment, err := txRepo.FindByOrderID(orderID)
		if err != nil {
			return err
		}

		status := statusResp.TransactionStatus

		// 3. Update status jika settled/capture
		switch status {
		case "settlement", "capture":
			payment.StatusPembayaran = "Settled"
			if err := txRepo.Update(payment); err != nil {
				return err
			}

			// Update booking status
			booking, err := txBookingRepo.FindByID(payment.PemesananID)
			if err == nil {
				booking.StatusPemesanan = "Confirmed"
				if err := txBookingRepo.Update(booking); err != nil {
					return err
				}

				// Update room status
				kamar, err := txKamarRepo.FindByID(booking.KamarID)
				if err == nil {
					kamar.Status = "Penuh"
					if err := txKamarRepo.Update(kamar); err != nil {
						return err
					}
				}
			}
		case "expire", "cancel", "deny":
			payment.StatusPembayaran = "Failed"
			if err := txRepo.Update(payment); err != nil {
				return err
			}
		}

		return nil
	})
}