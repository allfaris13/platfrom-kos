package service

import (
	"errors"
	"koskosan-be/internal/config"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// MockUserRepository implements repository.UserRepository interface
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

// MockPenyewaRepository implements repository.PenyewaRepository interface
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

// MockEmailSender implements utils.EmailSender interface
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

// MockGoogleVerifier implements utils.IDTokenVerifier interface
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

func (m *MockEmailSender) SendPaymentSuccessEmail(toEmail, tenantName string, amount float64, date time.Time) error {
	args := m.Called(toEmail, tenantName, amount, date)
	return args.Error(0)
}

func (m *MockEmailSender) SendPaymentReminderEmail(toEmail, tenantName string, amount float64, dueDate time.Time, paymentLink string) error {
	args := m.Called(toEmail, tenantName, amount, dueDate, paymentLink)
	return args.Error(0)
}

// =============================================================================
// LOGIN TESTS
// =============================================================================

func TestLogin_Success(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	cfg := &config.Config{JWTSecret: "test-secret-key-32-characters-long"}

	password := "TestPassword123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	expectedUser := &models.User{
		Username: "testuser",
		Password: string(hashedPassword),
		Role:     "tenant",
	}
	expectedUser.ID = 1

	mockUserRepo.On("FindByUsername", "testuser").Return(expectedUser, nil)

	authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, nil)

	// Act
	token, user, err := authService.Login("testuser", password)

	// Assert
	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.NotNil(t, user)
	assert.Equal(t, "testuser", user.Username)
	assert.Equal(t, "tenant", user.Role)
	mockUserRepo.AssertExpectations(t)
}

func TestLogin_UserNotFound(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	cfg := &config.Config{JWTSecret: "test-secret-key-32-characters-long"}

	mockUserRepo.On("FindByUsername", "nonexistent").Return(nil, errors.New("user not found"))

	authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, nil)

	// Act
	token, user, err := authService.Login("nonexistent", "password")

	// Assert
	assert.Error(t, err)
	assert.Empty(t, token)
	assert.Nil(t, user)
	assert.Equal(t, "invalid credentials", err.Error())
	mockUserRepo.AssertExpectations(t)
}

func TestLogin_InvalidPassword(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	cfg := &config.Config{JWTSecret: "test-secret-key-32-characters-long"}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("correctPassword"), bcrypt.DefaultCost)
	user := &models.User{
		Username: "testuser",
		Password: string(hashedPassword),
		Role:     "tenant",
	}

	mockUserRepo.On("FindByUsername", "testuser").Return(user, nil)

	authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, nil)

	// Act
	token, returnedUser, err := authService.Login("testuser", "wrongPassword")

	// Assert
	assert.Error(t, err)
	assert.Empty(t, token)
	assert.Nil(t, returnedUser)
	assert.Equal(t, "invalid credentials", err.Error())
	mockUserRepo.AssertExpectations(t)
}

// =============================================================================
// REGISTER TESTS
// =============================================================================

func TestRegister_Success(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	cfg := &config.Config{JWTSecret: "test-secret-key-32-characters-long"}

	mockUserRepo.On("FindByUsername", "newuser").Return(nil, errors.New("not found"))
	mockUserRepo.On("Create", mock.AnythingOfType("*models.User")).Return(nil).Run(func(args mock.Arguments) {
		user := args.Get(0).(*models.User)
		user.ID = 1 // Simulate DB auto-increment
	})
	mockPenyewaRepo.On("Create", mock.AnythingOfType("*models.Penyewa")).Return(nil)

	authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, nil)

	// Act
	user, err := authService.Register("newuser", "password", "tenant", "test@example.com", "08123456789", "Jl. Test", "2000-01-01", "1234567890")

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "newuser", user.Username)
	assert.Equal(t, "tenant", user.Role)
	assert.NotEmpty(t, user.Password)
	assert.NotEqual(t, "ValidPassword123", user.Password) // Should be hashed
	mockUserRepo.AssertExpectations(t)
	mockPenyewaRepo.AssertExpectations(t)
}

func TestRegister_UserAlreadyExists(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	cfg := &config.Config{JWTSecret: "test-secret-key-32-characters-long"}

	existingUser := &models.User{Username: "existinguser"}
	mockUserRepo.On("FindByUsername", "existinguser").Return(existingUser, nil)

	authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, nil)

	// Act
	user, err := authService.Register("existinguser", "ValidPassword123", "tenant", "", "", "", "", "")

	// Assert
	assert.Error(t, err)
	assert.Nil(t, user)
	assert.Equal(t, "user already exists", err.Error())
	mockUserRepo.AssertExpectations(t)
}

func TestRegister_AdminRole(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	cfg := &config.Config{JWTSecret: "test-secret-key-32-characters-long"}

	mockUserRepo.On("FindByUsername", "adminuser").Return(nil, errors.New("not found"))
	mockUserRepo.On("Create", mock.AnythingOfType("*models.User")).Return(nil).Run(func(args mock.Arguments) {
		user := args.Get(0).(*models.User)
		user.ID = 1
	})
	// Penyewa should NOT be created for admin role

	authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, nil)

	// Act
	user, err := authService.Register("adminuser", "AdminPass123", "admin", "", "", "", "", "")

	// Assert
	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "admin", user.Role)
	mockUserRepo.AssertExpectations(t)
	mockPenyewaRepo.AssertNotCalled(t, "Create") // Admin shouldn't create Penyewa
}

// =============================================================================
// GOOGLE LOGIN TESTS
// =============================================================================

func TestGoogleLogin_NewUser(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	mockGoogleVerifier := new(MockGoogleVerifier)
	cfg := &config.Config{
		JWTSecret:      "test-secret-key-32-characters-long",
		GoogleClientID: "test-client-id",
	}

	idToken := "valid-id-token"
	email := "newuser@gmail.com"
	username := "New User"

	claims := &utils.GoogleClaims{
		Email: email,
		Name:  username,
	}

	mockGoogleVerifier.On("Verify", idToken, cfg.GoogleClientID).Return(claims, nil)
	mockUserRepo.On("FindByUsername", email).Return(nil, errors.New("not found"))
	mockUserRepo.On("Create", mock.AnythingOfType("*models.User")).Return(nil).Run(func(args mock.Arguments) {
		user := args.Get(0).(*models.User)
		user.ID = 1
	})
	mockPenyewaRepo.On("Create", mock.AnythingOfType("*models.Penyewa")).Return(nil)

	authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, mockGoogleVerifier)

	// Act
	token, user, err := authService.GoogleLogin(idToken, username, "")

	// Assert
	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.NotNil(t, user)
	assert.Equal(t, email, user.Username)
	assert.Equal(t, "guest", user.Role)
	mockGoogleVerifier.AssertExpectations(t)
	mockUserRepo.AssertExpectations(t)
	mockPenyewaRepo.AssertExpectations(t)
}

func TestGoogleLogin_ExistingUser(t *testing.T) {
	// Arrange
	mockUserRepo := new(MockUserRepository)
	mockPenyewaRepo := new(MockPenyewaRepository)
	mockEmailSender := new(MockEmailSender)
	mockGoogleVerifier := new(MockGoogleVerifier)
	cfg := &config.Config{
		JWTSecret:      "test-secret-key-32-characters-long",
		GoogleClientID: "test-client-id",
	}

	idToken := "valid-id-token"
	email := "existing@gmail.com"
	claims := &utils.GoogleClaims{
		Email: email,
		Name:  "Some Name",
	}

	existingUser := &models.User{
		Username: email,
		Role:     "tenant",
	}
	existingUser.ID = 1

	mockGoogleVerifier.On("Verify", idToken, cfg.GoogleClientID).Return(claims, nil)
	mockUserRepo.On("FindByUsername", email).Return(existingUser, nil)

	authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, mockGoogleVerifier)

	// Act
	token, user, err := authService.GoogleLogin(idToken, "Some Name", "")

	// Assert
	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.NotNil(t, user)
	assert.Equal(t, email, user.Username)
	mockGoogleVerifier.AssertExpectations(t)
	mockUserRepo.AssertExpectations(t)
	mockPenyewaRepo.AssertNotCalled(t, "Create") // Should not create new Penyewa
}

// =============================================================================
// TABLE-DRIVEN TESTS (Go Best Practice)
// =============================================================================

func TestLogin_TableDriven(t *testing.T) {
	tests := []struct {
		name          string
		username      string
		password      string
		setupMock     func(*MockUserRepository)
		expectError   bool
		expectedError string
	}{
		{
			name:     "valid credentials",
			username: "validuser",
			password: "ValidPassword123",
			setupMock: func(m *MockUserRepository) {
				hashedPwd, _ := bcrypt.GenerateFromPassword([]byte("ValidPassword123"), bcrypt.DefaultCost)
				user := &models.User{Username: "validuser", Password: string(hashedPwd), Role: "tenant"}
				m.On("FindByUsername", "validuser").Return(user, nil)
			},
			expectError: false,
		},
		{
			name:     "user not found",
			username: "nonexistent",
			password: "password",
			setupMock: func(m *MockUserRepository) {
				m.On("FindByUsername", "nonexistent").Return(nil, errors.New("not found"))
			},
			expectError:   true,
			expectedError: "invalid credentials",
		},
		{
			name:     "wrong password",
			username: "user",
			password: "wrongpass",
			setupMock: func(m *MockUserRepository) {
				hashedPwd, _ := bcrypt.GenerateFromPassword([]byte("correctpass"), bcrypt.DefaultCost)
				user := &models.User{Username: "user", Password: string(hashedPwd)}
				m.On("FindByUsername", "user").Return(user, nil)
			},
			expectError:   true,
			expectedError: "invalid credentials",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUserRepo := new(MockUserRepository)
			mockPenyewaRepo := new(MockPenyewaRepository)
			mockEmailSender := new(MockEmailSender)
			cfg := &config.Config{JWTSecret: "test-secret-key-32-characters-long"}

			tt.setupMock(mockUserRepo)

			authService := NewAuthService(mockUserRepo, mockPenyewaRepo, cfg, mockEmailSender, nil)
			token, user, err := authService.Login(tt.username, tt.password)

			if tt.expectError {
				assert.Error(t, err)
				assert.Empty(t, token)
				assert.Nil(t, user)
				if tt.expectedError != "" {
					assert.Equal(t, tt.expectedError, err.Error())
				}
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, token)
				assert.NotNil(t, user)
			}

			mockUserRepo.AssertExpectations(t)
		})
	}
}
