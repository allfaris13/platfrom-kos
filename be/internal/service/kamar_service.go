package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
)

type KamarService interface {
	GetAll() ([]models.Kamar, error)
	GetByID(id uint) (*models.Kamar, error)
	Create(kamar *models.Kamar) error
	Update(kamar *models.Kamar) error
	Delete(id uint) error
}

type kamarService struct {
	repo repository.KamarRepository
}

func NewKamarService(repo repository.KamarRepository) KamarService {
	return &kamarService{repo}
}

func (s *kamarService) GetAll() ([]models.Kamar, error) {
	return s.repo.FindAll()
}

func (s *kamarService) GetByID(id uint) (*models.Kamar, error) {
	return s.repo.FindByID(id)
}

func (s *kamarService) Create(kamar *models.Kamar) error {
	return s.repo.Create(kamar)
}

func (s *kamarService) Update(kamar *models.Kamar) error {
	return s.repo.Update(kamar)
}

func (s *kamarService) Delete(id uint) error {
	return s.repo.Delete(id)
}
