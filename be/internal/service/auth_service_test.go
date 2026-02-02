package service

import (
	"errors"
	"koskosan-be/internal/config"
	"koskosan-be/internal/models"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

// MockUserRepository helps to mock the repository layer
type MockUserRepository struct {
	FindUserFn func(username string) (*models.User, error)
}

// MockPenyewaRepository helps to mock the repository layer
type MockPenyewaRepository struct{}

func (m *MockPenyewaRepository) FindByUserID(userID uint) (*models.Penyewa, error) { return nil, nil }
func (m *MockPenyewaRepository) FindAll() ([]models.Penyewa, error)                { return nil, nil }
func (m *MockPenyewaRepository) Create(penyewa *models.Penyewa) error              { return nil }
func (m *MockPenyewaRepository) Update(penyewa *models.Penyewa) error              { return nil }

func (m *MockUserRepository) Create(user *models.User) error {
	return nil
}

func (m *MockUserRepository) Update(user *models.User) error {
	return nil
}

func (m *MockUserRepository) FindByUsername(username string) (*models.User, error) {
	return m.FindUserFn(username)
}

func (m *MockUserRepository) FindByID(id uint) (*models.User, error) {
	return nil, nil // Not used in current tests
}

func TestLogin_Success(t *testing.T) {
	// Setup
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	mockRepo := &MockUserRepository{
		FindUserFn: func(username string) (*models.User, error) {
			if username == "testuser" {
				return &models.User{
					Username: "testuser",
					Password: string(hashedPassword),
					Role:     "user",
				}, nil
			}
			return nil, errors.New("user not found")
		},
	}

	cfg := &config.Config{JWTSecret: "secret"}
	authService := NewAuthService(mockRepo, &MockPenyewaRepository{}, cfg)

	// Execute
	token, user, err := authService.Login("testuser", password)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}
	if user == nil {
		t.Fatal("Expected user, got nil")
	}
	if token == "" {
		t.Fatal("Expected token, got empty string")
	}
}

func TestLogin_InvalidPassword(t *testing.T) {
	// Setup
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	mockRepo := &MockUserRepository{
		FindUserFn: func(username string) (*models.User, error) {
			return &models.User{
				Username: "testuser",
				Password: string(hashedPassword),
			}, nil
		},
	}

	cfg := &config.Config{JWTSecret: "secret"}
	authService := NewAuthService(mockRepo, &MockPenyewaRepository{}, cfg)

	// Execute
	_, _, err := authService.Login("testuser", "wrongpassword")

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}
}
