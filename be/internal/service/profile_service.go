package service

import (
	"errors"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type ProfileService interface {
	GetProfile(userID uint) (*models.User, *models.Penyewa, error)
	UpdateProfile(userID uint, input models.Penyewa) (*models.Penyewa, error)
	ChangePassword(userID uint, oldPassword, newPassword string) error
}

type profileService struct {
	userRepo    repository.UserRepository
	penyewaRepo repository.PenyewaRepository
}

func NewProfileService(userRepo repository.UserRepository, penyewaRepo repository.PenyewaRepository) ProfileService {
	return &profileService{userRepo, penyewaRepo}
}

func (s *profileService) GetProfile(userID uint) (*models.User, *models.Penyewa, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return nil, nil, err
	}

	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return user, nil, nil // Return user even if penyewa record is missing (should not happen if Register is fixed)
	}

	return user, penyewa, nil
}

func (s *profileService) UpdateProfile(userID uint, input models.Penyewa) (*models.Penyewa, error) {
	penyewa, err := s.penyewaRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	// Update fields
	penyewa.NamaLengkap = input.NamaLengkap
	penyewa.NIK = input.NIK
	penyewa.NomorHP = input.NomorHP
	penyewa.AlamatAsal = input.AlamatAsal
	penyewa.JenisKelamin = input.JenisKelamin
	if input.FotoProfil != "" {
		penyewa.FotoProfil = input.FotoProfil
	}

	if err := s.penyewaRepo.Update(penyewa); err != nil {
		return nil, err
	}

	return penyewa, nil
}

func (s *profileService) ChangePassword(userID uint, oldPassword, newPassword string) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		return err
	}

	// Verify old password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	return s.userRepo.Update(user)
}
