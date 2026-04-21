package service

import (
	"koskosan-be/internal/models"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Test CancelBooking - Success
func TestBookingService_CancelBooking_Success(t *testing.T) {
	mockBookingRepo := new(MockBookingRepository)
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPaymentRepo := new(MockPaymentRepository)

	mockWASender := new(MockWhatsAppSender)
	service := NewBookingService(mockBookingRepo, mockUserRepo, mockPenyewaRepo, mockKamarRepo, mockPaymentRepo, nil, mockWASender)

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

	mockWASender := new(MockWhatsAppSender)
	service := NewBookingService(mockBookingRepo, mockUserRepo, mockPenyewaRepo, mockKamarRepo, mockPaymentRepo, nil, mockWASender)

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
