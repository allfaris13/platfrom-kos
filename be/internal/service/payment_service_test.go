package service

import (
	"errors"
	"koskosan-be/internal/models"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Test GetAllPayments - Happy Path
func TestPaymentService_GetAllPayments_Success(t *testing.T) {
	mockRepo := new(MockPaymentRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	mockWASender := new(MockWhatsAppSender)

	service := NewPaymentService(
		mockRepo,
		mockBookingRepo,
		mockKamarRepo,
		mockPenyewaRepo,
		nil, // db not needed for this test
		mockEmailSender,
		mockWASender,
	)

	expectedPayments := []models.Pembayaran{
		{
			ID:               1,
			PemesananID:      1,
			JumlahBayar:      1000000,
			StatusPembayaran: "Pending",
			TanggalBayar:     time.Now(),
		},
		{
			ID:               2,
			PemesananID:      2,
			JumlahBayar:      2000000,
			StatusPembayaran: "Confirmed",
			TanggalBayar:     time.Now(),
		},
	}

	mockRepo.On("FindAll").Return(expectedPayments, nil)

	payments, err := service.GetAllPayments()

	assert.NoError(t, err)
	assert.Equal(t, 2, len(payments))
	assert.Equal(t, expectedPayments, payments)
	mockRepo.AssertExpectations(t)
}

// Test GetAllPayments - Repository Error
func TestPaymentService_GetAllPayments_Error(t *testing.T) {
	mockRepo := new(MockPaymentRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	mockWASender := new(MockWhatsAppSender)

	service := NewPaymentService(
		mockRepo,
		mockBookingRepo,
		mockKamarRepo,
		mockPenyewaRepo,
		nil,
		mockEmailSender,
		mockWASender,
	)

	mockRepo.On("FindAll").Return(nil, errors.New("database error"))

	payments, err := service.GetAllPayments()

	assert.Error(t, err)
	assert.Nil(t, payments)
	assert.Equal(t, "database error", err.Error())
	mockRepo.AssertExpectations(t)
}

// Test GetAllPayments - Empty Result
func TestPaymentService_GetAllPayments_EmptyResult(t *testing.T) {
	mockRepo := new(MockPaymentRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	mockWASender := new(MockWhatsAppSender)

	service := NewPaymentService(
		mockRepo,
		mockBookingRepo,
		mockKamarRepo,
		mockPenyewaRepo,
		nil,
		mockEmailSender,
		mockWASender,
	)

	emptyPayments := []models.Pembayaran{}
	mockRepo.On("FindAll").Return(emptyPayments, nil)

	payments, err := service.GetAllPayments()

	assert.NoError(t, err)
	assert.NotNil(t, payments)
	assert.Equal(t, 0, len(payments))
	mockRepo.AssertExpectations(t)
}

// Test UploadPaymentProof - Success
func TestPaymentService_UploadPaymentProof_Success(t *testing.T) {
	mockRepo := new(MockPaymentRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	mockWASender := new(MockWhatsAppSender)

	service := NewPaymentService(
		mockRepo,
		mockBookingRepo,
		mockKamarRepo,
		mockPenyewaRepo,
		nil,
		mockEmailSender,
		mockWASender,
	)

	payment := &models.Pembayaran{
		ID:               1,
		PemesananID:      1,
		StatusPembayaran: "Pending",
		BuktiTransfer:    "",
	}

	booking := &models.Pemesanan{
		ID:        1,
		PenyewaID: 1,
	}

	penyewa := &models.Penyewa{
		ID:     1,
		UserID: 1,
	}

	buktiPath := "/uploads/proofs/proof_123.jpg"

	mockRepo.On("FindByID", uint(1)).Return(payment, nil)
	mockBookingRepo.On("FindByID", uint(1)).Return(booking, nil)
	mockPenyewaRepo.On("FindByUserID", uint(1)).Return(penyewa, nil)
	mockRepo.On("Update", mock.MatchedBy(func(p *models.Pembayaran) bool {
		return p.ID == 1 && p.BuktiTransfer == buktiPath
	})).Return(nil)

	err := service.UploadPaymentProof(1, buktiPath, 1)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
	mockBookingRepo.AssertExpectations(t)
	mockPenyewaRepo.AssertExpectations(t)
}

// Test UploadPaymentProof - Payment Not Found
func TestPaymentService_UploadPaymentProof_NotFound(t *testing.T) {
	mockRepo := new(MockPaymentRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	mockWASender := new(MockWhatsAppSender)

	service := NewPaymentService(
		mockRepo,
		mockBookingRepo,
		mockKamarRepo,
		mockPenyewaRepo,
		nil,
		mockEmailSender,
		mockWASender,
	)

	mockRepo.On("FindByID", uint(999)).Return(nil, errors.New("record not found"))

	err := service.UploadPaymentProof(999, "/path/to/proof.jpg", 1)

	assert.Error(t, err)
	assert.Equal(t, "record not found", err.Error())
	mockRepo.AssertExpectations(t)
}

// Test UploadPaymentProof - Update Error
func TestPaymentService_UploadPaymentProof_UpdateError(t *testing.T) {
	mockRepo := new(MockPaymentRepository)
	mockBookingRepo := new(MockBookingRepository)
	mockKamarRepo := new(MockKamarRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	mockWASender := new(MockWhatsAppSender)

	service := NewPaymentService(
		mockRepo,
		mockBookingRepo,
		mockKamarRepo,
		mockPenyewaRepo,
		nil,
		mockEmailSender,
		mockWASender,
	)

	payment := &models.Pembayaran{
		ID:               1,
		PemesananID:      1,
		StatusPembayaran: "Pending",
	}

	booking := &models.Pemesanan{
		ID:        1,
		PenyewaID: 1,
	}

	penyewa := &models.Penyewa{
		ID:     1,
		UserID: 1,
	}

	mockRepo.On("FindByID", uint(1)).Return(payment, nil)
	mockBookingRepo.On("FindByID", uint(1)).Return(booking, nil)
	mockPenyewaRepo.On("FindByUserID", uint(1)).Return(penyewa, nil)
	mockRepo.On("Update", mock.Anything).Return(errors.New("database update failed"))

	err := service.UploadPaymentProof(1, "/path/to/proof.jpg", 1)

	assert.Error(t, err)
	assert.Equal(t, "database update failed", err.Error())
	mockRepo.AssertExpectations(t)
	mockBookingRepo.AssertExpectations(t)
	mockPenyewaRepo.AssertExpectations(t)
}


