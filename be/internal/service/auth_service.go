package service

import (
	"errors"
	"fmt"
	"koskosan-be/internal/config"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"log"
	"time"

	github_uuid "github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Login(username, password string) (string, *models.User, error)
	Register(username, password, role, email, phone, address, birthdate, nik string) (*models.User, error)
	GoogleLogin(idToken, username, picture string) (string, *models.User, error)
	ForgotPassword(email string) error
	ResetPassword(token, newPassword string) error
}

type authService struct {
	repo           repository.UserRepository
	penyewaRepo    repository.PenyewaRepository
	config         *config.Config
	emailSender    utils.EmailSender
	googleVerifier utils.IDTokenVerifier
}

func NewAuthService(repo repository.UserRepository, penyewaRepo repository.PenyewaRepository, cfg *config.Config, emailSender utils.EmailSender, googleVerifier utils.IDTokenVerifier) AuthService {
	return &authService{repo, penyewaRepo, cfg, emailSender, googleVerifier}
}

func (s *authService) Login(username, password string) (string, *models.User, error) {
	user, err := s.repo.FindByUsername(username)
	if err != nil {
		return "", nil, errors.New("Username tidak ditemukan")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.New("Password yang Anda masukkan salah")
	}

	// Check if penyewa account is non_active
	penyewa, err := s.penyewaRepo.FindByUserID(user.ID)
	if err == nil && penyewa.Role == "non_active" {
		return "", nil, errors.New("akun Anda telah dinonaktifkan, silakan hubungi admin")
	}

	// Generate token pair (access + refresh)
	accessToken, _, err := utils.GenerateTokenPair(int(user.ID), user.Username, user.Role, s.config.JWTSecret)
	if err != nil {
		return "", nil, err
	}

	// For backward compatibility, return access token
	// This will be used to set cookies in handler
	return accessToken, user, nil
}

func (s *authService) Register(username, password, role, email, phone, address, birthdate, nik string) (*models.User, error) {
	// Check if user already exists
	_, err := s.repo.FindByUsername(username)
	if err == nil {
		return nil, errors.New("user already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username: username,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	// Create blank Penyewa record for tenants or guests
	if role == "tenant" || role == "guest" {
		// Parse birthdate
		var tglLahir time.Time
		if birthdate != "" {
			parsedTime, err := time.Parse("2006-01-02", birthdate)
			if err == nil {
				tglLahir = parsedTime
			}
		}

		penyewa := &models.Penyewa{
			UserID:       user.ID,
			Email:        email,
			NomorHP:      phone,
			AlamatAsal:   address,
			TanggalLahir: tglLahir,
			NIK:          nik,
			Role:         "guest", // New users start as guest
		}
		if err := s.penyewaRepo.Create(penyewa); err != nil {
			log.Printf("Failed to create penyewa profile for user %s: %v", username, err)
		}
	}

	return user, nil
}

//auth untuk google login (function nya)

func (s *authService) GoogleLogin(idToken, username, picture string) (string, *models.User, error) {
	// SECURITY FIX: Verify the ID token with Google's servers
	claims, err := s.googleVerifier.Verify(idToken, s.config.GoogleClientID)
	if err != nil {
		return "", nil, fmt.Errorf("invalid google token: %v", err)
	}

	email := claims.Email
	if email == "" {
		return "", nil, fmt.Errorf("email not found in token")
	}

	// Use name/picture from token if not provided
	if username == "" {
		username = claims.Name
	}
	if picture == "" {
		picture = claims.Picture
	}

	// 2. Find or create user based on verified email
	user, err := s.repo.FindByUsername(email)

	if err != nil {
		// 3. If user not found, create new User
		user = &models.User{
			Username: email,
			Password: "google-auth-placeholder-" + time.Now().String(), // Password dummy yang aman
			Role:     "guest",                                          // Google users start as guests until they book
		}
		if err := s.repo.Create(user); err != nil {
			return "", nil, err
		}

		// 4. Create profile Penyewa for Google OAuth users
		penyewa := &models.Penyewa{
			UserID:      user.ID,
			NamaLengkap: username,
			Role:        "guest", // Google OAuth users start as guest
		}
		s.penyewaRepo.Create(penyewa)
	}

	// Check if penyewa account is non_active
	existingPenyewa, pErr := s.penyewaRepo.FindByUserID(user.ID)
	if pErr == nil && existingPenyewa.Role == "non_active" {
		return "", nil, errors.New("akun Anda telah dinonaktifkan, silakan hubungi admin")
	}

	// 5. Generate JWT Token
	accessToken, _, err := utils.GenerateTokenPair(int(user.ID), user.Username, user.Role, s.config.JWTSecret)
	if err != nil {
		return "", nil, err
	}

	return accessToken, user, nil
}

func (s *authService) ForgotPassword(email string) error {
	// 1. Try to find user by username (assuming username might be email)
	user, err := s.repo.FindByUsername(email)
	if err != nil {
		// 2. If not found, try to find penyewa by email
		penyewa, err := s.penyewaRepo.FindByEmail(email)
		if err != nil {
			// SECURITY FIX: Return nil to prevent user enumeration
			// Don't reveal whether email exists or not
			log.Printf("Password reset requested for non-existent email: %s", email)
			return nil
		}
		user, err = s.repo.FindByID(penyewa.UserID)
		if err != nil {
			log.Printf("Password reset: penyewa found but user not found for email: %s", email)
			return nil
		}
	}

	// 3. Generate Token
	token := github_uuid.New().String()
	expiry := time.Now().Add(1 * time.Hour) // 1 hour expiry

	// 4. Save token to user
	user.ResetToken = token
	user.ResetTokenExpiry = expiry
	if err := s.repo.Update(user); err != nil {
		log.Printf("Failed to save reset token for user %s: %v", email, err)
		return nil // Still return nil to prevent enumeration
	}

	// 5. Send Email (errors in email sending shouldn't reveal user existence)
	if err := s.emailSender.SendResetPasswordEmail(email, token); err != nil {
		log.Printf("Failed to send reset email to %s: %v", email, err)
		// Don't return error to prevent enumeration
	}

	return nil
}

func (s *authService) ResetPassword(token, newPassword string) error {
	user, err := s.repo.FindByResetToken(token)
	if err != nil {
		return errors.New("invalid or expired token")
	}

	if time.Now().After(user.ResetTokenExpiry) {
		return errors.New("token expired")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	user.ResetToken = "" // Clear token
	user.ResetTokenExpiry = time.Time{}

	return s.repo.Update(user)
}
