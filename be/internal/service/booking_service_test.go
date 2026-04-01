package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

// MockBookingRepository implements repository.BookingRepository
type MockBookingRepository struct {
	mock.Mock
}

// MockKamarRepository for testing
type MockKamarRepository struct {
	mock.Mock
}

func (m *MockKamarRepository) Create(kamar *models.Kamar) error {
	args := m.Called(kamar)
	return args.Error(0)
}

func (m *MockKamarRepository) Update(kamar *models.Kamar) error {
	args := m.Called(kamar)
	return args.Error(0)
}

func (m *MockKamarRepository) FindByID(id uint) (*models.Kamar, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Kamar), args.Error(1)
}

func (m *MockKamarRepository) FindAll() ([]models.Kamar, error) {
	args := m.Called()
	return args.Get(0).([]models.Kamar), args.Error(1)
}

func (m *MockKamarRepository) Delete(id uint) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockKamarRepository) UpdateStatus(id uint, status string) error {
	args := m.Called(id, status)
	return args.Error(0)
}

func (m *MockKamarRepository) WithTx(tx *gorm.DB) repository.KamarRepository {
	args := m.Called(tx)
	if args.Get(0) == nil {
		return nil
	}
	return args.Get(0).(repository.KamarRepository)
}

func (m *MockKamarRepository) AddImage(image *models.KamarImage) error {
	args := m.Called(image)
	return args.Error(0)
}

func (m *MockKamarRepository) DeleteImagesByKamarID(kamarID uint) error {
	args := m.Called(kamarID)
	return args.Error(0)
}

func (m *MockBookingRepository) FindByPenyewaID(penyewaID uint) ([]models.Pemesanan, error) {
	args := m.Called(penyewaID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Pemesanan), args.Error(1)
}

func (m *MockBookingRepository) FindByPenyewaIDWithPayments(penyewaID uint) ([]models.Pemesanan, error) {
	args := m.Called(penyewaID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Pemesanan), args.Error(1)
}

func (m *MockBookingRepository) FindByID(id uint) (*models.Pemesanan, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Pemesanan), args.Error(1)
}

func (m *MockBookingRepository) Create(booking *models.Pemesanan) error {
	args := m.Called(booking)
	return args.Error(0)
}

func (m *MockBookingRepository) Update(booking *models.Pemesanan) error {
	args := m.Called(booking)
	return args.Error(0)
}

func (m *MockBookingRepository) GetPaymentsByBookingID(bookingID uint) ([]models.Pembayaran, error) {
	args := m.Called(bookingID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Pembayaran), args.Error(1)
}

func (m *MockBookingRepository) FindExpiredPendingBookings(expiryTime time.Time) ([]models.Pemesanan, error) {
	args := m.Called(expiryTime)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Pemesanan), args.Error(1)
}

func (m *MockBookingRepository) UpdateStatus(id uint, status string) error {
	args := m.Called(id, status)
	return args.Error(0)
}

func (m *MockBookingRepository) WithTx(tx *gorm.DB) repository.BookingRepository {
	args := m.Called(tx)
	if args.Get(0) == nil {
		return nil
	}
	return args.Get(0).(repository.BookingRepository)
}

// Test CancelBooking - Success
func TestBookingService_CancelBooking_Success(t *testing.T) {
	mockBookingRepo := new(MockBookingRepository)
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPaymentRepo := new(MockPaymentRepository)

	service := NewBookingService(mockBookingRepo, mockUserRepo, mockPenyewaRepo, mockKamarRepo, mockPaymentRepo, nil)

	bookingID := uint(1)
	userID := uint(1)
	
	penyewa := &models.Penyewa{ID: 1, UserID: 1}
	booking := &models.Pemesanan{ID: 1, PenyewaID: 1, KamarID: 101, StatusPemesanan: "Pending"}

	mockBookingRepo.On("FindByID", bookingID).Return(booking, nil)
	mockPenyewaRepo.On("FindByUserID", userID).Return(penyewa, nil)
	mockBookingRepo.On("UpdateStatus", bookingID, "Cancelled").Return(nil)
	mockKamarRepo.On("UpdateStatus", uint(101), "Tersedia").Return(nil)
	mockPaymentRepo.On("DeleteByBookingID", bookingID).Return(nil)

	err := service.CancelBooking(bookingID, userID)

	assert.NoError(t, err)
	mockBookingRepo.AssertExpectations(t)
	mockPenyewaRepo.AssertExpectations(t)
	mockKamarRepo.AssertExpectations(t)
	mockPaymentRepo.AssertExpectations(t)
}

// Test CancelBooking - IDOR Protection
func TestBookingService_CancelBooking_IDOR_Unauthorized(t *testing.T) {
	mockBookingRepo := new(MockBookingRepository)
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPaymentRepo := new(MockPaymentRepository)

	service := NewBookingService(mockBookingRepo, mockUserRepo, mockPenyewaRepo, mockKamarRepo, mockPaymentRepo, nil)

	bookingID := uint(1)
	attackerUserID := uint(2)
	
	attackerPenyewa := &models.Penyewa{ID: 2, UserID: 2}
	// Booking belongs to Penyewa ID 1 (Victim)
	booking := &models.Pemesanan{ID: 1, PenyewaID: 1, KamarID: 101, StatusPemesanan: "Pending"}

	mockBookingRepo.On("FindByID", bookingID).Return(booking, nil)
	mockPenyewaRepo.On("FindByUserID", attackerUserID).Return(attackerPenyewa, nil)

	err := service.CancelBooking(bookingID, attackerUserID)

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "unauthorized")
	
	// Verify critical actions were NOT called
	mockBookingRepo.AssertNotCalled(t, "UpdateStatus", mock.Anything, mock.Anything)
	mockKamarRepo.AssertNotCalled(t, "UpdateStatus", mock.Anything, mock.Anything)
	
	mockBookingRepo.AssertExpectations(t)
	mockPenyewaRepo.AssertExpectations(t)
}
