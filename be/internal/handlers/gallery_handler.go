package handlers

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GalleryHandler struct {
	service    service.GalleryService
	cloudinary *utils.CloudinaryService
}

func NewGalleryHandler(s service.GalleryService, cld *utils.CloudinaryService) *GalleryHandler {
	return &GalleryHandler{s, cld}
}

func (h *GalleryHandler) GetGalleries(c *gin.Context) {
	galleries, err := h.service.GetAllGalleries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if galleries == nil {
		galleries = []models.Gallery{}
	}
	c.JSON(http.StatusOK, galleries)
}

func (h *GalleryHandler) CreateGallery(c *gin.Context) {
	// Multipart form
	title := c.PostForm("title")
	category := c.PostForm("category")

	// File upload
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file is required"})
		return
	}

	if !utils.IsImageFile(file) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type, only images are allowed"})
		return
	}

	var imageURL string
	if h.cloudinary != nil {
		src, err := file.Open()
		if err == nil {
			defer src.Close()
			url, err := h.cloudinary.UploadImage(src, "koskosan/gallery")
			if err == nil {
				imageURL = url
			} else {
				utils.GlobalLogger.Error("Cloudinary upload failed: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload image to cloud: %v", err)})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open image file"})
			return
		}
	} else {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloud storage not configured"})
		return
	}

	gallery := models.Gallery{
		Title:    title,
		Category: category,
		ImageURL: imageURL,
	}

	if err := h.service.CreateGallery(&gallery); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gallery)
}

func (h *GalleryHandler) DeleteGallery(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	if err := h.service.DeleteGallery(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Gallery deleted successfully"})
}
