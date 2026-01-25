package utils

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// SaveFile saves a multipart file to the specified destination directory
// Returns the saved filename or an error
func SaveFile(file *multipart.FileHeader, destDir string) (string, error) {
	// Create destination directory if it doesn't exist
	if err := os.MkdirAll(destDir, os.ModePerm); err != nil {
		return "", err
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), uuid.New().String(), ext)
	dst := filepath.Join(destDir, filename)

	// Source
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Destination
	out, err := os.Create(dst)
	if err != nil {
		return "", err
	}
	defer out.Close()

	// Copy
	if _, err = io.Copy(out, src); err != nil {
		return "", err
	}

	return filename, nil
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
