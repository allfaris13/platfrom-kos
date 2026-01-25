package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
)

type ReviewService interface {
	CreateReview(review *models.Review) error
	GetReviewsByKamarID(kamarID uint) ([]models.Review, error)
	GetAllReviews() ([]models.Review, error)
}

type reviewService struct {
	repo repository.ReviewRepository
}

func NewReviewService(repo repository.ReviewRepository) ReviewService {
	return &reviewService{repo}
}

func (s *reviewService) CreateReview(review *models.Review) error {
	return s.repo.Create(review)
}

func (s *reviewService) GetReviewsByKamarID(kamarID uint) ([]models.Review, error) {
	return s.repo.FindByKamarID(kamarID)
}

func (s *reviewService) GetAllReviews() ([]models.Review, error) {
	return s.repo.FindAll()
}
