package handlers

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GalleryHandler struct {
	service service.GalleryService
}

func NewGalleryHandler(s service.GalleryService) *GalleryHandler {
	return &GalleryHandler{s}
}

func (h *GalleryHandler) GetGalleries(c *gin.Context) {
	galleries, err := h.service.GetAllGalleries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
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

	filename, err := utils.SaveFile(file, "uploads/gallery")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	gallery := models.Gallery{
		Title:    title,
		Category: category,
		ImageURL: "/uploads/gallery/" + filename,
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
