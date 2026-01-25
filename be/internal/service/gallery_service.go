package service

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/repository"
)

type GalleryService interface {
	CreateGallery(gallery *models.Gallery) error
	GetAllGalleries() ([]models.Gallery, error)
	DeleteGallery(id uint) error
}

type galleryService struct {
	repo repository.GalleryRepository
}

func NewGalleryService(repo repository.GalleryRepository) GalleryService {
	return &galleryService{repo}
}

func (s *galleryService) CreateGallery(gallery *models.Gallery) error {
	return s.repo.Create(gallery)
}

func (s *galleryService) GetAllGalleries() ([]models.Gallery, error) {
	return s.repo.FindAll()
}

func (s *galleryService) DeleteGallery(id uint) error {
	return s.repo.Delete(id)
}
