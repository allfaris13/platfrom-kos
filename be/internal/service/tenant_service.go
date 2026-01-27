package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
)

type TenantService interface {
	GetAllTenants() ([]models.Penyewa, error)
}

type tenantService struct {
	repo repository.PenyewaRepository
}

func NewTenantService(repo repository.PenyewaRepository) TenantService {
	return &tenantService{repo}
}

func (s *tenantService) GetAllTenants() ([]models.Penyewa, error) {
	return s.repo.FindAll()
}
