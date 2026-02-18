package utils

import (
	"context"
	"mime/multipart"
	"time"

	"path/filepath"
	"strings"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

type CloudinaryService struct {
	cld *cloudinary.Cloudinary
}

func NewCloudinaryService(cloudURL string) (*CloudinaryService, error) {
	cld, err := cloudinary.NewFromURL(cloudURL)
	if err != nil {
		return nil, err
	}
	return &CloudinaryService{cld: cld}, nil
}

func (s *CloudinaryService) UploadImage(file multipart.File, folder string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second) // Increased timeout to 30s
	defer cancel()

	resp, err := s.cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder: folder,
	})
	if err != nil {
		GlobalLogger.Error("Cloudinary.Upload failed: %v", err)
		return "", err
	}

	return resp.SecureURL, nil
}

func (s *CloudinaryService) DeleteImage(publicID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := s.cld.Upload.Destroy(ctx, uploader.DestroyParams{
		PublicID: publicID,
	})
	return err
}

// IsImageFile checks if the uploaded file is an image
func IsImageFile(file *multipart.FileHeader) bool {
	ext := strings.ToLower(filepath.Ext(file.Filename))
	validExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}
	return validExts[ext]
}
