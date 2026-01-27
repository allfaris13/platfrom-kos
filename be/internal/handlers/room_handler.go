package handlers

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type KamarHandler struct {
	service service.KamarService
}

func NewKamarHandler(s service.KamarService) *KamarHandler {
	return &KamarHandler{s}
}

func (h *KamarHandler) GetKamars(c *gin.Context) {
	kamars, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if kamars == nil {
		kamars = []models.Kamar{}
	}
	c.JSON(http.StatusOK, kamars)
}

func (h *KamarHandler) GetKamarByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	kamar, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kamar not found"})
		return
	}
	c.JSON(http.StatusOK, kamar)
}

func (h *KamarHandler) CreateKamar(c *gin.Context) {
	// Parse multipart form
	// We need to manually parse fields since it's multipart
	nomorKamar := c.PostForm("nomor_kamar")
	tipeKamar := c.PostForm("tipe_kamar")
	fasilitas := c.PostForm("fasilitas")
	status := c.PostForm("status")
	description := c.PostForm("description")

	harga, _ := strconv.ParseFloat(c.PostForm("harga_per_bulan"), 64)
	capacity, _ := strconv.Atoi(c.PostForm("capacity"))
	floor, _ := strconv.Atoi(c.PostForm("floor"))

	// File upload
	var imageURL string
	file, err := c.FormFile("image")
	if err == nil {
		// If file is provided, validate and save
		if utils.IsImageFile(file) {
			filename, err := utils.SaveFile(file, "uploads/rooms")
			if err == nil {
				imageURL = "/uploads/rooms/" + filename
			}
		}
	} else {
		// Optional default image if none provided
		imageURL = "https://via.placeholder.com/400"
	}

	kamar := models.Kamar{
		NomorKamar:    nomorKamar,
		TipeKamar:     tipeKamar,
		Fasilitas:     fasilitas,
		HargaPerBulan: harga,
		Status:        status,
		Capacity:      capacity,
		Floor:         floor,
		Description:   description,
		ImageURL:      imageURL,
	}

	if err := h.service.Create(&kamar); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, kamar)
}

func (h *KamarHandler) UpdateKamar(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	kamar, err := h.service.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kamar not found"})
		return
	}

	// Update fields if provided in multipart form
	if v := c.PostForm("nomor_kamar"); v != "" {
		kamar.NomorKamar = v
	}
	if v := c.PostForm("tipe_kamar"); v != "" {
		kamar.TipeKamar = v
	}
	if v := c.PostForm("fasilitas"); v != "" {
		kamar.Fasilitas = v
	}
	if v := c.PostForm("status"); v != "" {
		kamar.Status = v
	}
	if v := c.PostForm("description"); v != "" {
		kamar.Description = v
	}
	if v := c.PostForm("harga_per_bulan"); v != "" {
		kamar.HargaPerBulan, _ = strconv.ParseFloat(v, 64)
	}
	if v := c.PostForm("capacity"); v != "" {
		kamar.Capacity, _ = strconv.Atoi(v)
	}
	if v := c.PostForm("floor"); v != "" {
		kamar.Floor, _ = strconv.Atoi(v)
	}

	// File upload
	file, err := c.FormFile("image")
	if err == nil {
		if utils.IsImageFile(file) {
			filename, err := utils.SaveFile(file, "uploads/rooms")
			if err == nil {
				kamar.ImageURL = "/uploads/rooms/" + filename
			}
		}
	}

	if err := h.service.Update(kamar); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, kamar)
}

func (h *KamarHandler) DeleteKamar(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "kamar deleted successfully"})
}
