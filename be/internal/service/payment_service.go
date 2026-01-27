package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
)

type PaymentService interface {
	GetAllPayments() ([]models.Pembayaran, error)
	ConfirmPayment(paymentID uint) error
}

type paymentService struct {
	repo        repository.PaymentRepository
	bookingRepo repository.BookingRepository
	kamarRepo   repository.KamarRepository
}

func NewPaymentService(repo repository.PaymentRepository, bookingRepo repository.BookingRepository, kamarRepo repository.KamarRepository) PaymentService {
	return &paymentService{repo, bookingRepo, kamarRepo}
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
