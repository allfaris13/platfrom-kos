package service

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
)

type ReviewService interface {
	CreateReview(review *models.Review, userID uint) error
	GetReviewsByKamarID(kamarID uint) ([]models.Review, error)
	GetAllReviews() ([]models.Review, error)
}

type reviewService struct {
	repo        repository.ReviewRepository
	bookingRepo repository.BookingRepository
	penyewaRepo repository.PenyewaRepository
}

func NewReviewService(repo repository.ReviewRepository, bookingRepo repository.BookingRepository, penyewaRepo repository.PenyewaRepository) ReviewService {
	return &reviewService{repo, bookingRepo, penyewaRepo}
}

func (s *reviewService) CreateReview(review *models.Review, userID uint) error {
	// SECURITY FIX: Verify user has actually stayed in this room
	// Find penyewa profile
	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return fmt.Errorf("penyewa profile not found")
	}

	// Check if user has any confirmed booking for this room
	bookings, err := s.bookingRepo.FindByPenyewaID(penyewa.ID)
	if err != nil {
		return fmt.Errorf("failed to verify booking history")
	}

	hasStayed := false
	for _, booking := range bookings {
		if booking.KamarID == review.KamarID && booking.StatusPemesanan == "Confirmed" {
			hasStayed = true
			break
		}
	}

	if !hasStayed {
		return fmt.Errorf("unauthorized: you must have a confirmed booking for this room to review it")
	}

	// Set UserID from authenticated user context
	review.UserID = userID

	return s.repo.Create(review)
}

func (s *reviewService) GetReviewsByKamarID(kamarID uint) ([]models.Review, error) {
	return s.repo.FindByKamarID(kamarID)
}

func (s *reviewService) GetAllReviews() ([]models.Review, error) {
	return s.repo.FindAll()
}
