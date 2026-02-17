package service

import (
	"errors"
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
	GoogleLogin(email, username, picture string) (string, *models.User, error)
	ForgotPassword(email string) error
	ResetPassword(token, newPassword string) error
}

type authService struct {
	repo        repository.UserRepository
	penyewaRepo repository.PenyewaRepository
	config      *config.Config
	emailSender utils.EmailSender
}

func NewAuthService(repo repository.UserRepository, penyewaRepo repository.PenyewaRepository, cfg *config.Config, emailSender utils.EmailSender) AuthService {
	return &authService{repo, penyewaRepo, cfg, emailSender}
}

func (s *authService) Login(username, password string) (string, *models.User, error) {
	user, err := s.repo.FindByUsername(username)
	if err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.New("invalid credentials")
	}

	tokenString, err := utils.GenerateToken(int(user.ID), user.Username, user.Role, s.config.JWTSecret, time.Hour*24)
	if err != nil {
		return "", nil, err
	}

	return tokenString, user, nil
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

	// Create blank Penyewa record for tenants
	if role == "tenant" {
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

func (s *authService) GoogleLogin(email, username, picture string) (string, *models.User, error) {
    // 1. Cari user berdasarkan email (karena kita pakai email sebagai username unik)
    user, err := s.repo.FindByUsername(email)
    
    if err != nil {
        // 2. Jika user tidak ditemukan, buat User baru
        user = &models.User{
            Username: email,
            Password: "google-auth-placeholder-" + time.Now().String(), // Password dummy yang aman
            Role:     "tenant",
        }
        if err := s.repo.Create(user); err != nil {
            return "", nil, err
        }

        // 3. Buat profile Penyewa
        // SESUAIKAN: Cek file internal/models/penyewa.go. 
        // Jika error "unknown field Nama", ganti 'Nama' di bawah dengan 'NamaLengkap'
        penyewa := &models.Penyewa{
            UserID:       user.ID,
            NamaLengkap:  username, // Ubah ke NamaLengkap jika di modelnya begitu
            Role:         "guest", // Google OAuth users start as guest
        }
        s.penyewaRepo.Create(penyewa)
    }

    // 4. Generate JWT Token
    tokenString, err := utils.GenerateToken(int(user.ID), user.Username, user.Role, s.config.JWTSecret, time.Hour*24)
    if err != nil {
        return "", nil, err
    }

    return tokenString, user, nil
}

func (s *authService) ForgotPassword(email string) error {
	// 1. Try to find user by username (assuming username might be email)
	user, err := s.repo.FindByUsername(email)
	if err != nil {
		// 2. If not found, try to find penyewa by email
		penyewa, err := s.penyewaRepo.FindByEmail(email)
		if err != nil {
			// User not found. To prevent enumeration, we could return nil.
			// But for better UX during dev/MVP, we might want to return error.
			// Let's return nil to be secure but log it.
			// Or for now, legitimate error.
			return errors.New("user with this email not found")
		}
		user, err = s.repo.FindByID(penyewa.UserID)
		if err != nil {
			return errors.New("user account not found")
		}
	}

	// 3. Generate Token
	token := github_uuid.New().String()
	expiry := time.Now().Add(1 * time.Hour) // 1 hour expiry

	// 4. Save token to user
	user.ResetToken = token
	user.ResetTokenExpiry = expiry
	if err := s.repo.Update(user); err != nil {
		return err
	}

	// 5. Send Email
	// We need to resolve which email to send to. Use the input email.
	return s.emailSender.SendResetPasswordEmail(email, token)
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
