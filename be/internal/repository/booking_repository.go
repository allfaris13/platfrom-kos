package repository

import (
	"koskosan-be/internal/models"

	"gorm.io/gorm"
)

type BookingRepository interface {
	FindByPenyewaID(penyewaID uint) ([]models.Pemesanan, error)
	FindByID(id uint) (*models.Pemesanan, error)
	Create(booking *models.Pemesanan) error
	Update(booking *models.Pemesanan) error
	GetPaymentsByBookingID(bookingID uint) ([]models.Pembayaran, error)
}

type bookingRepository struct {
	db *gorm.DB
}

func NewBookingRepository(db *gorm.DB) BookingRepository {
	return &bookingRepository{db}
}

func (r *bookingRepository) FindByPenyewaID(penyewaID uint) ([]models.Pemesanan, error) {
	var bookings []models.Pemesanan
	err := r.db.Preload("Kamar").Where("penyewa_id = ?", penyewaID).Find(&bookings).Error
	return bookings, err
}

func (r *bookingRepository) FindByID(id uint) (*models.Pemesanan, error) {
	var booking models.Pemesanan
	err := r.db.First(&booking, id).Error
	return &booking, err
}

func (r *bookingRepository) Create(booking *models.Pemesanan) error {
	return r.db.Create(booking).Error
}

func (r *bookingRepository) Update(booking *models.Pemesanan) error {
	return r.db.Save(booking).Error
}

func (r *bookingRepository) GetPaymentsByBookingID(bookingID uint) ([]models.Pembayaran, error) {
	var payments []models.Pembayaran
	err := r.db.Where("pemesanan_id = ?", bookingID).Find(&payments).Error
	return payments, err
}
