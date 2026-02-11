package repository

import (
	"koskosan-be/internal/models"

	"gorm.io/gorm"
)

type KamarRepository interface {
	FindAll() ([]models.Kamar, error)
	FindByID(id uint) (*models.Kamar, error)
	Create(kamar *models.Kamar) error
	Update(kamar *models.Kamar) error
	UpdateStatus(id uint, status string) error
	Delete(id uint) error
	WithTx(tx *gorm.DB) KamarRepository
}

type kamarRepository struct {
	db *gorm.DB
}

func NewKamarRepository(db *gorm.DB) KamarRepository {
	return &kamarRepository{db}
}

func (r *kamarRepository) FindAll() ([]models.Kamar, error) {
	var kamars []models.Kamar
	err := r.db.Find(&kamars).Error
	return kamars, err
}

func (r *kamarRepository) FindByID(id uint) (*models.Kamar, error) {
	var kamar models.Kamar
	err := r.db.First(&kamar, id).Error
	return &kamar, err
}

func (r *kamarRepository) Create(kamar *models.Kamar) error {
	return r.db.Create(kamar).Error
}

func (r *kamarRepository) Update(kamar *models.Kamar) error {
	return r.db.Save(kamar).Error
}

func (r *kamarRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&models.Kamar{}).Where("id = ?", id).Update("status", status).Error
}

func (r *kamarRepository) Delete(id uint) error {
	return r.db.Delete(&models.Kamar{}, id).Error
}

func (r *kamarRepository) WithTx(tx *gorm.DB) KamarRepository {
	return &kamarRepository{db: tx}
}
