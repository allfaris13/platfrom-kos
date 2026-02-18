package service

import (
	"koskosan-be/internal/models"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockReviewRepository implements repository.ReviewRepository interface
type MockReviewRepository struct {
	mock.Mock
}

func (m *MockReviewRepository) Create(review *models.Review) error {
	args := m.Called(review)
	return args.Error(0)
}

func (m *MockReviewRepository) FindByKamarID(kamarID uint) ([]models.Review, error) {
	args := m.Called(kamarID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Review), args.Error(1)
}

func (m *MockReviewRepository) FindAll() ([]models.Review, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Review), args.Error(1)
}

func (m *MockReviewRepository) Delete(id uint) error {
	args := m.Called(id)
	return args.Error(0)
}

// Test CreateReview - Success
func TestReviewService_CreateReview_Success(t *testing.T) {
	mockReviewRepo := new(MockReviewRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)

	service := NewReviewService(mockReviewRepo, mockBookingRepo, mockPenyewaRepo)

	// Mock data
	penyewa := &models.Penyewa{
		ID:     1,
		UserID: 1,
	}

	bookings := []models.Pemesanan{
		{
			ID:              1,
			PenyewaID:       1,
			KamarID:         1,
			StatusPemesanan: "Confirmed",
		},
	}

	review := &models.Review{
		KamarID: 1,
		UserID:  1,
		Rating:  5,
		Comment: "Excellent room!",
	}

	mockPenyewaRepo.On("FindByUserID", uint(1)).Return(penyewa, nil)
	mockBookingRepo.On("FindByPenyewaID", uint(1)).Return(bookings, nil)
	mockReviewRepo.On("Create", mock.MatchedBy(func(r *models.Review) bool {
		return r.KamarID == 1 && r.UserID == 1 && r.Rating == 5
	})).Return(nil)

	err := service.CreateReview(review, 1) // userID = 1

	assert.NoError(t, err)
	mockPenyewaRepo.AssertExpectations(t)
	mockBookingRepo.AssertExpectations(t)
	mockReviewRepo.AssertExpectations(t)
}

// Test CreateReview - No Confirmed Booking
func TestReviewService_CreateReview_NoConfirmedBooking(t *testing.T) {
	mockReviewRepo := new(MockReviewRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)

	service := NewReviewService(mockReviewRepo, mockBookingRepo, mockPenyewaRepo)

	penyewa := &models.Penyewa{
		ID:     1,
		UserID: 1,
	}

	// No confirmed bookings for this room
	bookings := []models.Pemesanan{
		{
			ID:              1,
			PenyewaID:       1,
			KamarID:         2, // Different room
			StatusPemesanan: "Confirmed", 
		},
		{
			ID:              2,
			PenyewaID:       1,
			KamarID:         1, // Same room
			StatusPemesanan: "Pending", // Not confirmed
		},
	}

	review := &models.Review{
		KamarID: 1,
		UserID:  1,
		Rating:  5,
		Comment: "Great!",
	}

	mockPenyewaRepo.On("FindByUserID", uint(1)).Return(penyewa, nil)
	mockBookingRepo.On("FindByPenyewaID", uint(1)).Return(bookings, nil)

	err := service.CreateReview(review, 1)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "must have a confirmed booking")
	mockBookingRepo.AssertExpectations(t)
	mockReviewRepo.AssertNotCalled(t, "Create")
}

// Test GetReviewsByKamarID - Success
func TestReviewService_GetReviewsByKamarID_Success(t *testing.T) {
	mockReviewRepo := new(MockReviewRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)

	service := NewReviewService(mockReviewRepo, mockBookingRepo, mockPenyewaRepo)

	expectedReviews := []models.Review{
		{
			ID:      1,
			KamarID: 1,
			UserID:  1,
			Rating:  5,
			Comment: "Excellent!",
		},
	}

	mockReviewRepo.On("FindByKamarID", uint(1)).Return(expectedReviews, nil)

	reviews, err := service.GetReviewsByKamarID(1)

	assert.NoError(t, err)
	assert.Equal(t, 1, len(reviews))
	assert.Equal(t, expectedReviews, reviews)
	mockReviewRepo.AssertExpectations(t)
}

// Test GetAllReviews - Success
func TestReviewService_GetAllReviews_Success(t *testing.T) {
	mockReviewRepo := new(MockReviewRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)

	service := NewReviewService(mockReviewRepo, mockBookingRepo, mockPenyewaRepo)

	expectedReviews := []models.Review{
		{ID: 1, KamarID: 1, Rating: 5},
	}

	mockReviewRepo.On("FindAll").Return(expectedReviews, nil)

	reviews, err := service.GetAllReviews()

	assert.NoError(t, err)
	assert.Equal(t, 1, len(reviews))
	mockReviewRepo.AssertExpectations(t)
}
