package service

import (
	"errors"
	"koskosan-be/internal/config"
	"koskosan-be/internal/models"
	"koskosan-be/internal/utils"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

// MockUserRepository implements repository.UserRepository interface
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
	mockPenyewaRepo.On("FindByUserID", uint(1)).Return(&models.Penyewa{Role: "tenant"}, nil)

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
	assert.Equal(t, "Username tidak ditemukan", err.Error())
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
	assert.Equal(t, "Password yang Anda masukkan salah", err.Error())
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
	user, err := authService.Register("newuser", "password", "tenant", "test@example.com", "08123456789", "Jl. Test", "2000-01-01", "1234567890", "male")

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
	user, err := authService.Register("existinguser", "ValidPassword123", "tenant", "", "", "", "", "", "")

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
	user, err := authService.Register("adminuser", "AdminPass123", "admin", "", "", "", "", "", "")

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
	mockPenyewaRepo.On("FindByUserID", uint(1)).Return(&models.Penyewa{Role: "guest"}, nil)

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
	mockPenyewaRepo.On("FindByUserID", uint(1)).Return(&models.Penyewa{Role: "tenant"}, nil)

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
		setupMock     func(*MockUserRepository, *MockPenyewaRepository)
		expectError   bool
		expectedError string
	}{
		{
			name:     "valid credentials",
			username: "validuser",
			password: "ValidPassword123",
			setupMock: func(m *MockUserRepository, p *MockPenyewaRepository) {
				hashedPwd, _ := bcrypt.GenerateFromPassword([]byte("ValidPassword123"), bcrypt.DefaultCost)
				user := &models.User{Username: "validuser", Password: string(hashedPwd), Role: "tenant"}
				user.ID = 1
				m.On("FindByUsername", "validuser").Return(user, nil)
				p.On("FindByUserID", uint(1)).Return(&models.Penyewa{Role: "tenant"}, nil)
			},
			expectError: false,
		},
		{
			name:     "user not found",
			username: "nonexistent",
			password: "password",
			setupMock: func(m *MockUserRepository, p *MockPenyewaRepository) {
				m.On("FindByUsername", "nonexistent").Return(nil, errors.New("not found"))
			},
			expectError:   true,
			expectedError: "Username tidak ditemukan",
		},
		{
			name:     "wrong password",
			username: "user",
			password: "wrongpass",
			setupMock: func(m *MockUserRepository, p *MockPenyewaRepository) {
				hashedPwd, _ := bcrypt.GenerateFromPassword([]byte("correctpass"), bcrypt.DefaultCost)
				user := &models.User{Username: "user", Password: string(hashedPwd)}
				m.On("FindByUsername", "user").Return(user, nil)
			},
			expectError:   true,
			expectedError: "Password yang Anda masukkan salah",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockUserRepo := new(MockUserRepository)
			mockPenyewaRepo := new(MockPenyewaRepository)
			mockEmailSender := new(MockEmailSender)
			cfg := &config.Config{JWTSecret: "test-secret-key-32-characters-long"}

			tt.setupMock(mockUserRepo, mockPenyewaRepo)

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
