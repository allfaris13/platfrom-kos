package repository

import (
	"koskosan-be/internal/models"

	"gorm.io/gorm"
)

type PaymentRepository interface {
	FindAll() ([]models.Pembayaran, error)
	FindByID(id uint) (*models.Pembayaran, error)
	Create(payment *models.Pembayaran) error
	Update(payment *models.Pembayaran) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db}
}

func (r *paymentRepository) FindAll() ([]models.Pembayaran, error) {
	var payments []models.Pembayaran
	err := r.db.Preload("Pemesanan.Penyewa").Preload("Pemesanan.Kamar").Find(&payments).Error
	return payments, err
}

func (r *paymentRepository) FindByID(id uint) (*models.Pembayaran, error) {
	var payment models.Pembayaran
	err := r.db.Preload("Pemesanan.Penyewa").Preload("Pemesanan.Kamar").First(&payment, id).Error
	return &payment, err
}

func (r *paymentRepository) Create(payment *models.Pembayaran) error {
	return r.db.Create(payment).Error
}

func (r *paymentRepository) Update(payment *models.Pembayaran) error {
	return r.db.Save(payment).Error
}
