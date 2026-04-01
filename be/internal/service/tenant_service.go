package service

import (
	"errors"
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
	"koskosan-be/internal/utils"
	"strings"
)

type TenantService interface {
	GetAllTenants() ([]models.Penyewa, error)
	GetTenantsByRole(role string) ([]models.Penyewa, error)
	GetTenantsPaginated(pagination *utils.Pagination, search, role string) ([]models.Penyewa, int64, error)
	ValidateTenant(penyewa *models.Penyewa) error
	DeactivateTenant(id uint) error
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

func (s *tenantService) GetTenantsByRole(role string) ([]models.Penyewa, error) {
	return s.repo.FindByRole(role)
}

func (s *tenantService) GetTenantsPaginated(pagination *utils.Pagination, search, role string) ([]models.Penyewa, int64, error) {
	return s.repo.FindAllPaginated(pagination, search, role)
}

func (s *tenantService) ValidateTenant(penyewa *models.Penyewa) error {
	if len(penyewa.NIK) != 16 {
		return errors.New("NIK must be 16 digits")
	}
	if !strings.HasPrefix(penyewa.NomorHP, "08") && !strings.HasPrefix(penyewa.NomorHP, "62") {
		return errors.New("phone number must start with 08 or 62")
	}
	return nil
}

func (s *tenantService) DeactivateTenant(id uint) error {
	// Fetch penyewa first to check role
	penyewa, err := s.repo.FindByID(id)
	if err != nil {
		return errors.New("user tidak ditemukan")
	}

	// Lindungi akun admin dari di-nonaktifkan
	if penyewa.Role == "admin" {
		return errors.New("akun admin tidak dapat dinonaktifkan")
	}

	return s.repo.UpdateRole(id, "non_active")
}
