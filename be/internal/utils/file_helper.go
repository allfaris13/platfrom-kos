package utils

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/google/uuid"
)

// UploadToCloudinary uploads a multipart file to Cloudinary and returns the secure CDN URL.
// Falls back to local storage if CLOUDINARY_URL is not configured.
// folder is the Cloudinary folder (e.g., "rooms", "profiles", "proofs", "gallery").
func UploadToCloudinary(fileHeader *multipart.FileHeader, folder string) (string, error) {
	cloudinaryURL := os.Getenv("CLOUDINARY_URL")

	// Fallback to local if Cloudinary not configured
	if cloudinaryURL == "" {
		return SaveUploadedFile(fileHeader, folder)
	}

	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %v", err)
	}
	defer src.Close()

	// Read file into buffer
	buf, err := io.ReadAll(src)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %v", err)
	}

	// Initialize Cloudinary
	cld, err := cloudinary.NewFromURL(cloudinaryURL)
	if err != nil {
		return "", fmt.Errorf("failed to init cloudinary: %v", err)
	}
	cld.Config.URL.Secure = true

	// Generate unique public ID
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	publicID := fmt.Sprintf("%s/%s_%s", folder, time.Now().Format("20060102150405"), uuid.New().String()[:8])
	_ = ext // Cloudinary auto-detects format

	ctx := context.Background()
	uploadResult, err := cld.Upload.Upload(ctx, bytes.NewReader(buf), uploader.UploadParams{
		PublicID:     publicID,
		Folder:       folder,
		ResourceType: "image",
		// Auto quality and format for optimal performance
		Transformation: "q_auto,f_auto",
	})
	if err != nil {
		return "", fmt.Errorf("cloudinary upload failed: %v", err)
	}

	return uploadResult.SecureURL, nil
}

// SaveUploadedFile saves a multipart file to the specified local folder path
// and returns the relative URL to access it (e.g., /folder/filename.jpg).
// Use UploadToCloudinary instead for production — this is a local-only fallback.
func SaveUploadedFile(fileHeader *multipart.FileHeader, folder string) (string, error) {
	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %v", err)
	}
	defer src.Close()

	uploadDir := filepath.Join("public", folder)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %v", err)
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if ext == "" {
		ext = ".jpg"
	}

	newFileName := fmt.Sprintf("%s_%s%s", time.Now().Format("20060102150405"), uuid.New().String()[:8], ext)
	dstPath := filepath.Join(uploadDir, newFileName)

	dst, err := os.Create(dstPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %v", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}

	return fmt.Sprintf("/%s/%s", folder, newFileName), nil
}

// DeleteLocalFile removes a file from local disk given its relative URL.
// For Cloudinary URLs, this is a no-op (deletion handled separately if needed).
func DeleteLocalFile(fileURL string) error {
	if fileURL == "" {
		return nil
	}
	// Skip Cloudinary URLs
	if strings.HasPrefix(fileURL, "http://") || strings.HasPrefix(fileURL, "https://") {
		return nil
	}

	relativePath := strings.TrimPrefix(fileURL, "/")
	fullPath := filepath.Join("public", relativePath)

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil
	}

	return os.Remove(fullPath)
}

// IsImageFile validates if an uploaded file is an image by checking its MIME type
func IsImageFile(file *multipart.FileHeader) bool {
	contentType := file.Header.Get("Content-Type")
	return strings.HasPrefix(contentType, "image/")
}
