package repository

import (
	"koskosan-be/internal/models"

	"gorm.io/gorm"
)

type GalleryRepository interface {
	Create(gallery *models.Gallery) error
	FindAll() ([]models.Gallery, error)
	Delete(id uint) error
}

type galleryRepository struct {
	db *gorm.DB
}

func NewGalleryRepository(db *gorm.DB) GalleryRepository {
	return &galleryRepository{db}
}

func (r *galleryRepository) Create(gallery *models.Gallery) error {
	return r.db.Create(gallery).Error
}

func (r *galleryRepository) FindAll() ([]models.Gallery, error) {
	var galleries []models.Gallery
	err := r.db.Find(&galleries).Error
	return galleries, err
}

func (r *galleryRepository) Delete(id uint) error {
	return r.db.Delete(&models.Gallery{}, id).Error
}
