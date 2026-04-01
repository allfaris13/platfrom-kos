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

type KamarHandler struct {
	service service.KamarService
}

func NewKamarHandler(s service.KamarService) *KamarHandler {
	return &KamarHandler{service: s}
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
	nomorKamar := c.PostForm("nomor_kamar")
	tipeKamar := c.PostForm("tipe_kamar")
	fasilitas := c.PostForm("fasilitas")
	status := c.PostForm("status")
	description := c.PostForm("description")

	harga, _ := strconv.ParseFloat(c.PostForm("harga_per_bulan"), 64)
	capacity, _ := strconv.Atoi(c.PostForm("capacity"))
	floor, _ := strconv.Atoi(c.PostForm("floor"))
	size := c.PostForm("size")
	bedrooms, _ := strconv.Atoi(c.PostForm("bedrooms"))
	bathrooms, _ := strconv.Atoi(c.PostForm("bathrooms"))

	// Cloudinary check removed

	// Parse multipart form to get multiple files
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal memproses form data: " + err.Error()})
		return
	}

	imageFiles := form.File["images"]
	if len(imageFiles) < 3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Minimal 3 foto kamar diperlukan untuk kamar baru"})
		return
	}

	// Upload all images locally
	var uploadedURLs []string
	for _, fileHeader := range imageFiles {
		if !utils.IsImageFile(fileHeader) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Semua file harus berupa gambar"})
			return
		}

		url, err := utils.UploadToCloudinary(fileHeader, "rooms")
		if err != nil {
			utils.GlobalLogger.Error("Failed to upload image: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload image: %v", err)})
			return
		}
		uploadedURLs = append(uploadedURLs, url)
	}

	// First image is the main image_url
	mainImageURL := uploadedURLs[0]

	kamar := models.Kamar{
		NomorKamar:    nomorKamar,
		TipeKamar:     tipeKamar,
		Fasilitas:     fasilitas,
		HargaPerBulan: harga,
		Status:        status,
		Capacity:      capacity,
		Floor:         floor,
		Size:          size,
		Bedrooms:      bedrooms,
		Bathrooms:     bathrooms,
		Description:   description,
		ImageURL:      mainImageURL,
	}

	if err := h.service.Create(&kamar); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Save all images to kamar_images table
	for _, url := range uploadedURLs {
		img := models.KamarImage{
			KamarID:  kamar.ID,
			ImageURL: url,
		}
		if err := h.service.AddImage(&img); err != nil {
			utils.GlobalLogger.Error("Failed to save kamar image: %v", err)
		}
	}

	// Reload with images
	kamarWithImages, _ := h.service.GetByID(kamar.ID)
	if kamarWithImages != nil {
		c.JSON(http.StatusCreated, kamarWithImages)
	} else {
		c.JSON(http.StatusCreated, kamar)
	}
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
	if v := c.PostForm("size"); v != "" {
		kamar.Size = v
	}
	if v := c.PostForm("bedrooms"); v != "" {
		kamar.Bedrooms, _ = strconv.Atoi(v)
	}
	if v := c.PostForm("bathrooms"); v != "" {
		kamar.Bathrooms, _ = strconv.Atoi(v)
	}

	// Check for new multi-image upload
	form, err := c.MultipartForm()
	if err == nil && form != nil {
		imageFiles := form.File["images"]
		if len(imageFiles) > 0 {
			if len(imageFiles) < 3 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Jika mengunggah foto baru, minimal harus ada 3 foto kamar"})
				return
			}

			var uploadedURLs []string
			for _, fileHeader := range imageFiles {
				if !utils.IsImageFile(fileHeader) {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Semua file harus berupa gambar"})
					return
				}
				url, err := utils.UploadToCloudinary(fileHeader, "rooms")
				if err != nil {
					utils.GlobalLogger.Error("Failed to upload image: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload image: %v", err)})
					return
				}
				uploadedURLs = append(uploadedURLs, url)
			}

			// Delete old images
			_ = h.service.DeleteImagesByKamarID(uint(id))

			// Update main image
			kamar.ImageURL = uploadedURLs[0]

			// Save new images
			for _, url := range uploadedURLs {
				img := models.KamarImage{
					KamarID:  uint(id),
					ImageURL: url,
				}
				_ = h.service.AddImage(&img)
			}
		}
	}

	if err := h.service.Update(kamar); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Reload with images
	kamarWithImages, _ := h.service.GetByID(uint(id))
	if kamarWithImages != nil {
		c.JSON(http.StatusOK, kamarWithImages)
	} else {
		c.JSON(http.StatusOK, kamar)
	}
}

func (h *KamarHandler) DeleteKamar(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 32)

	// Delete associated images first
	_ = h.service.DeleteImagesByKamarID(uint(id))

	if err := h.service.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "kamar deleted successfully"})
}
