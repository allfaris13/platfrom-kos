package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"time"

	"github.com/stretchr/testify/mock"
	"gorm.io/gorm"
)

// MockUserRepository implements repository.UserRepository
type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) Create(user *models.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) Update(user *models.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) FindByUsername(username string) (*models.User, error) {
	args := m.Called(username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) FindByID(id uint) (*models.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) FindByResetToken(token string) (*models.User, error) {
	args := m.Called(token)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) WithTx(tx *gorm.DB) repository.UserRepository {
	args := m.Called(tx)
	if args.Get(0) == nil {
		return nil
	}
	return args.Get(0).(repository.UserRepository)
}

// MockPenyewaRepository implements repository.PenyewaRepository
type MockPenyewaRepository struct {
	mock.Mock
}

func (m *MockPenyewaRepository) FindByUserID(userID uint) (*models.Penyewa, error) {
	args := m.Called(userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Penyewa), args.Error(1)
}

func (m *MockPenyewaRepository) FindAll() ([]models.Penyewa, error) {
	args := m.Called()
	return args.Get(0).([]models.Penyewa), args.Error(1)
}

func (m *MockPenyewaRepository) Create(penyewa *models.Penyewa) error {
	args := m.Called(penyewa)
	return args.Error(0)
}

func (m *MockPenyewaRepository) Update(penyewa *models.Penyewa) error {
	args := m.Called(penyewa)
	return args.Error(0)
}

func (m *MockPenyewaRepository) Delete(id uint) error {
	args := m.Called(id)
	return args.Error(0)
}

func (m *MockPenyewaRepository) FindByEmail(email string) (*models.Penyewa, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Penyewa), args.Error(1)
}

func (m *MockPenyewaRepository) FindByRole(role string) ([]models.Penyewa, error) {
	args := m.Called(role)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Penyewa), args.Error(1)
}

func (m *MockPenyewaRepository) UpdateRole(penyewaID uint, role string) error {
	args := m.Called(penyewaID, role)
	return args.Error(0)
}

func (m *MockPenyewaRepository) FindAllPaginated(pagination *utils.Pagination, search, role string) ([]models.Penyewa, int64, error) {
	args := m.Called(pagination, search, role)
	if args.Get(0) == nil {
		return nil, 0, args.Error(2)
	}
	return args.Get(0).([]models.Penyewa), int64(args.Int(1)), args.Error(2)
}

func (m *MockPenyewaRepository) WithTx(tx *gorm.DB) repository.PenyewaRepository {
	args := m.Called(tx)
	if args.Get(0) == nil {
		return nil
	}
	return args.Get(0).(repository.PenyewaRepository)
}

func (m *MockPenyewaRepository) FindByID(id uint) (*models.Penyewa, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Penyewa), args.Error(1)
}

// MockReviewRepository implements repository.ReviewRepository
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

// MockBookingRepository implements repository.BookingRepository
type MockBookingRepository struct {
	mock.Mock
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

func (m *MockBookingRepository) FindActiveBookingByKamarID(kamarID uint) (*models.Pemesanan, error) {
	args := m.Called(kamarID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Pemesanan), args.Error(1)
}

func (m *MockBookingRepository) WithTx(tx *gorm.DB) repository.BookingRepository {
	args := m.Called(tx)
	if args.Get(0) == nil {
		return nil
	}
	return args.Get(0).(repository.BookingRepository)
}

func (m *MockBookingRepository) FindPendingBookingByKamarID(kamarID uint) (*models.Pemesanan, error) {
	args := m.Called(kamarID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Pemesanan), args.Error(1)
}

// MockKamarRepository implements repository.KamarRepository
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

func (m *MockKamarRepository) FindByIDForUpdate(id uint) (*models.Kamar, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Kamar), args.Error(1)
}

// MockPaymentRepository implements repository.PaymentRepository
type MockPaymentRepository struct {
	mock.Mock
}

func (m *MockPaymentRepository) Create(payment *models.Pembayaran) error {
	args := m.Called(payment)
	return args.Error(0)
}

func (m *MockPaymentRepository) Update(payment *models.Pembayaran) error {
	args := m.Called(payment)
	return args.Error(0)
}

func (m *MockPaymentRepository) FindAll() ([]models.Pembayaran, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.Pembayaran), args.Error(1)
}

func (m *MockPaymentRepository) FindByID(id uint) (*models.Pembayaran, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Pembayaran), args.Error(1)
}

func (m *MockPaymentRepository) FindByBookingID(bookingID uint) (*models.Pembayaran, error) {
	args := m.Called(bookingID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Pembayaran), args.Error(1)
}

func (m *MockPaymentRepository) WithTx(tx *gorm.DB) repository.PaymentRepository {
	return m
}

func (m *MockPaymentRepository) CreateReminder(reminder *models.PaymentReminder) error {
	args := m.Called(reminder)
	return args.Error(0)
}

func (m *MockPaymentRepository) DeleteByBookingID(bookingID uint) error {
	args := m.Called(bookingID)
	return args.Error(0)
}

func (m *MockPaymentRepository) DeleteRemindersByBookingID(bookingID uint) error {
	args := m.Called(bookingID)
	return args.Error(0)
}

func (m *MockPaymentRepository) FindByOrderID(orderID string) (*models.Pembayaran, error) {
	args := m.Called(orderID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.Pembayaran), args.Error(1)
}

func (m *MockPaymentRepository) CancelPendingPaymentsByBookingID(bookingID uint) error {
	args := m.Called(bookingID)
	return args.Error(0)
}

// MockEmailSender implements utils.EmailSender
type MockEmailSender struct {
	mock.Mock
}

func (m *MockEmailSender) SendEmail(to, subject, body string) error {
	args := m.Called(to, subject, body)
	return args.Error(0)
}

func (m *MockEmailSender) SendResetPasswordEmail(to, token string) error {
	args := m.Called(to, token)
	return args.Error(0)
}

func (m *MockEmailSender) SendPaymentSuccessEmail(toEmail, tenantName string, amount float64, date time.Time) error {
	args := m.Called(toEmail, tenantName, amount, date)
	return args.Error(0)
}

func (m *MockEmailSender) SendPaymentReminderEmail(toEmail, tenantName string, amount float64, dueDate time.Time, paymentLink string) error {
	args := m.Called(toEmail, tenantName, amount, dueDate, paymentLink)
	return args.Error(0)
}

// MockWhatsAppSender implements utils.WhatsAppSender
type MockWhatsAppSender struct {
	mock.Mock
}

func (m *MockWhatsAppSender) SendWhatsApp(to, message string) error {
	args := m.Called(to, message)
	return args.Error(0)
}

// MockGoogleVerifier implements utils.IDTokenVerifier
type MockGoogleVerifier struct {
	mock.Mock
}

func (m *MockGoogleVerifier) Verify(tokenString string, clientID string) (*utils.GoogleClaims, error) {
	args := m.Called(tokenString, clientID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*utils.GoogleClaims), args.Error(1)
}
