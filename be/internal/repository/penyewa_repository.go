package repository

import (
	"koskosan-be/internal/models"

	"gorm.io/gorm"
)

type PenyewaRepository interface {
	FindByUserID(userID uint) (*models.Penyewa, error)
	FindAll() ([]models.Penyewa, error)
	Create(penyewa *models.Penyewa) error
	Update(penyewa *models.Penyewa) error
}

type penyewaRepository struct {
	db *gorm.DB
}

func NewPenyewaRepository(db *gorm.DB) PenyewaRepository {
	return &penyewaRepository{db}
}

func (r *penyewaRepository) FindByUserID(userID uint) (*models.Penyewa, error) {
	var penyewa models.Penyewa
	err := r.db.Where("user_id = ?", userID).First(&penyewa).Error
	return &penyewa, err
}

func (r *penyewaRepository) FindAll() ([]models.Penyewa, error) {
	var penyewas []models.Penyewa
	err := r.db.Preload("User").Find(&penyewas).Error
	return penyewas, err
}

func (r *penyewaRepository) Create(penyewa *models.Penyewa) error {
	return r.db.Create(penyewa).Error
}

func (r *penyewaRepository) Update(penyewa *models.Penyewa) error {
	return r.db.Save(penyewa).Error
}
