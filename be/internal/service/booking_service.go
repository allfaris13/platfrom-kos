package service

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"time"
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
}

type bookingService struct {
	repo        repository.BookingRepository
	penyewaRepo repository.PenyewaRepository
}

func NewBookingService(repo repository.BookingRepository, penyewaRepo repository.PenyewaRepository) BookingService {
	return &bookingService{repo, penyewaRepo}
}

func (s *bookingService) GetUserBookings(userID uint) ([]BookingResponse, error) {
	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return []BookingResponse{}, nil // No penyewa record yet
	}

	bookings, err := s.repo.FindByPenyewaID(penyewa.ID)
	if err != nil {
		return nil, err
	}

	var response []BookingResponse
	for _, b := range bookings {
		payments, _ := s.repo.GetPaymentsByBookingID(b.ID)

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
			Kamar:           b.Kamar,
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
		if b.StatusPemesanan == "Pending" || b.StatusPemesanan == "Confirmed" {
			return nil, fmt.Errorf("Anda sudah memiliki pesanan aktif. Setiap penghuni maksimal hanya bisa memesan 1 kamar")
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

	// Re-fetch to get associations if needed, or just return
	return &booking, nil
}
