package repository

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/utils"

	"gorm.io/gorm"
)

type PenyewaRepository interface {
	FindByUserID(userID uint) (*models.Penyewa, error)
	FindByEmail(email string) (*models.Penyewa, error)
	FindAll() ([]models.Penyewa, error)
	FindByRole(role string) ([]models.Penyewa, error)
	Create(penyewa *models.Penyewa) error
	Update(penyewa *models.Penyewa) error
	UpdateRole(penyewaID uint, role string) error
	FindAllPaginated(pagination *utils.Pagination, search, role string) ([]models.Penyewa, int64, error)
	WithTx(tx *gorm.DB) PenyewaRepository
}

type penyewaRepository struct {
	db *gorm.DB
}

func NewPenyewaRepository(db *gorm.DB) PenyewaRepository {
	return &penyewaRepository{db}
}

func (r *penyewaRepository) FindByUserID(userID uint) (*models.Penyewa, error) {
	var penyewa models.Penyewa
	err := r.db.Where("user_id = ?", userID).First(&penyewa).Error
	return &penyewa, err
}

func (r *penyewaRepository) FindByEmail(email string) (*models.Penyewa, error) {
	var penyewa models.Penyewa
	err := r.db.Where("email = ?", email).First(&penyewa).Error
	return &penyewa, err
}

func (r *penyewaRepository) FindAll() ([]models.Penyewa, error) {
	var penyewas []models.Penyewa
	err := r.db.Preload("User").Find(&penyewas).Error
	return penyewas, err
}

func (r *penyewaRepository) Create(penyewa *models.Penyewa) error {
	return r.db.Create(penyewa).Error
}

func (r *penyewaRepository) Update(penyewa *models.Penyewa) error {
	return r.db.Save(penyewa).Error
}

func (r *penyewaRepository) FindByRole(role string) ([]models.Penyewa, error) {
	var penyewas []models.Penyewa
	err := r.db.Where("role = ?", role).Preload("User").Find(&penyewas).Error
	return penyewas, err
}

func (r *penyewaRepository) UpdateRole(penyewaID uint, role string) error {
	return r.db.Model(&models.Penyewa{}).Where("id = ?", penyewaID).Update("role", role).Error
}

func (r *penyewaRepository) FindAllPaginated(pagination *utils.Pagination, search, role string) ([]models.Penyewa, int64, error) {
	var penyewas []models.Penyewa
	var totalRows int64

	query := r.db.Model(&models.Penyewa{}).Preload("User")

	if role != "" {
		query = query.Where("role = ?", role)
	}

	if search != "" {
		searchLike := "%" + search + "%"
		query = query.Where("nama_lengkap ILIKE ? OR email ILIKE ? OR nomor_hp ILIKE ? OR nik ILIKE ?", searchLike, searchLike, searchLike, searchLike)
	}

	query.Count(&totalRows)

	err := query.Scopes(utils.Paginate(models.Penyewa{}, pagination, query)).Find(&penyewas).Error

	return penyewas, totalRows, err
}

func (r *penyewaRepository) WithTx(tx *gorm.DB) PenyewaRepository {
	return &penyewaRepository{db: tx}
}
