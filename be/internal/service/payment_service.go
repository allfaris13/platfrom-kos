package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
)

type PaymentService interface {
	GetAllPayments() ([]models.Pembayaran, error)
	ConfirmPayment(paymentID uint) error
	CreatePaymentSession(pemesananID uint) (string, string, error)
	HandleWebhook(payload map[string]interface{}) error
}

type paymentService struct {
	repo            repository.PaymentRepository
	bookingRepo     repository.BookingRepository
	kamarRepo       repository.KamarRepository
	midtransService MidtransService
}

func NewPaymentService(repo repository.PaymentRepository, bookingRepo repository.BookingRepository, kamarRepo repository.KamarRepository, midtransService MidtransService) PaymentService {
	return &paymentService{repo, bookingRepo, kamarRepo, midtransService}
}

func (s *paymentService) GetAllPayments() ([]models.Pembayaran, error) {
	return s.repo.FindAll()
}

func (s *paymentService) ConfirmPayment(paymentID uint) error {
	payment, err := s.repo.FindByID(paymentID)
	if err != nil {
		return err
	}

	payment.StatusPembayaran = "Confirmed"
	if err := s.repo.Update(payment); err != nil {
		return err
	}

	// Also update booking status if needed
	booking, err := s.bookingRepo.FindByID(payment.PemesananID)
	if err == nil {
		booking.StatusPemesanan = "Confirmed"
		s.bookingRepo.Update(booking)

		// Update room status to 'Penuh'
		kamar, err := s.kamarRepo.FindByID(booking.KamarID)
		if err == nil {
			kamar.Status = "Penuh"
			s.kamarRepo.Update(kamar)
		}
	}
	return nil
}

func (s *paymentService) CreatePaymentSession(pemesananID uint) (string, string, error) {
	booking, err := s.bookingRepo.FindByID(pemesananID)
	if err != nil {
		return "", "", err
	}

	// Calculate total amount (durasi * harga)
	kamar, err := s.kamarRepo.FindByID(booking.KamarID)
	if err != nil {
		return "", "", err
	}
	totalAmount := float64(booking.DurasiSewa) * kamar.HargaPerBulan

	// Create Midtrans Transaction
	snapResp, orderID, err := s.midtransService.CreateTransaction(booking, totalAmount)
	if err != nil {
		return "", "", err
	}

	// Save payment record
	payment := models.Pembayaran{
		PemesananID:      pemesananID,
		JumlahBayar:      totalAmount,
		StatusPembayaran: "Pending",
		OrderID:          orderID,
		SnapToken:        snapResp.Token,
	}

	if err := s.repo.Create(&payment); err != nil {
		return "", "", err
	}

	return snapResp.Token, snapResp.RedirectURL, nil
}

func (s *paymentService) HandleWebhook(payload map[string]interface{}) error {
	orderID, status, err := s.midtransService.VerifyNotification(payload)
	if err != nil {
		return err
	}

	payment, err := s.repo.FindByOrderID(orderID)
	if err != nil {
		return err
	}

	if status == "settlement" || status == "capture" {
		payment.StatusPembayaran = "Settled"
		s.repo.Update(payment)
		
		// Update booking status
		booking, err := s.bookingRepo.FindByID(payment.PemesananID)
		if err == nil {
			booking.StatusPemesanan = "Confirmed"
			s.bookingRepo.Update(booking)

			// Update room status
			kamar, err := s.kamarRepo.FindByID(booking.KamarID)
			if err == nil {
				kamar.Status = "Penuh"
				s.kamarRepo.Update(kamar)
			}
		}
	} else if status == "expire" || status == "cancel" || status == "deny" {
		payment.StatusPembayaran = "Failed"
		s.repo.Update(payment)
	}

	return nil
}
