package repository

import (
	"koskosan-be/internal/models"

	"gorm.io/gorm"
)

type ReviewRepository interface {
	Create(review *models.Review) error
	FindByKamarID(kamarID uint) ([]models.Review, error)
	FindAll() ([]models.Review, error)
}

type reviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) ReviewRepository {
	return &reviewRepository{db}
}

func (r *reviewRepository) Create(review *models.Review) error {
	return r.db.Create(review).Error
}

func (r *reviewRepository) FindByKamarID(kamarID uint) ([]models.Review, error) {
	var reviews []models.Review
	err := r.db.Preload("User").Where("kamar_id = ?", kamarID).Find(&reviews).Error
	return reviews, err
}

func (r *reviewRepository) FindAll() ([]models.Review, error) {
	var reviews []models.Review
	// Fetch latest 20 reviews for homepage
	err := r.db.Preload("User").Order("created_at desc").Limit(20).Find(&reviews).Error
	return reviews, err
}
