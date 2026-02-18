package handlers

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	service    service.ProfileService
	cloudinary *utils.CloudinaryService
}

func NewProfileHandler(s service.ProfileService, cld *utils.CloudinaryService) *ProfileHandler {
	return &ProfileHandler{s, cld}
}

func (h *ProfileHandler) GetProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var userID uint
	switch v := userIDRaw.(type) {
	case float64:
		userID = uint(v)
	case int:
		userID = uint(v)
	case uint:
		userID = v
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id type"})
		return
	}

	user, penyewa, err := h.service.GetProfile(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	isGoogleUser := strings.HasPrefix(user.Password, "google-auth-placeholder-")

	c.JSON(http.StatusOK, gin.H{
		"user":           user,
		"penyewa":        penyewa,
		"is_google_user": isGoogleUser,
	})
}

func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var userID uint
	switch v := userIDRaw.(type) {
	case float64:
		userID = uint(v)
	case int:
		userID = uint(v)
	case uint:
		userID = v
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id type"})
		return
	}

	var input models.Penyewa
	contentType := c.GetHeader("Content-Type")

	if strings.Contains(contentType, "multipart/form-data") {
		_, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "failed to parse form"})
			return
		}

		input.NamaLengkap = c.PostForm("nama_lengkap")
		input.NIK = c.PostForm("nik")
		input.NomorHP = c.PostForm("nomor_hp")
		input.AlamatAsal = c.PostForm("alamat_asal")
		input.JenisKelamin = c.PostForm("jenis_kelamin")

		// Handle file upload
		file, err := c.FormFile("foto_profil")
		if err == nil {
			if utils.IsImageFile(file) {
				if h.cloudinary != nil {
					src, err := file.Open()
					if err == nil {
						defer src.Close()
						url, err := h.cloudinary.UploadImage(src, "koskosan/profiles")
						if err == nil {
							input.FotoProfil = url
						} else {
							utils.GlobalLogger.Error("Failed to upload to Cloudinary: %v", err)
							c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload profile photo to cloud: %v", err)})
							return
						}
					} else {
						c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open profile photo"})
						return
					}
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloud storage not configured"})
					return
				}
			}
		}
	} else {
		// Handle JSON
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	}

	penyewa, err := h.service.UpdateProfile(userID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "profile updated successfully",
		"penyewa": penyewa,
	})
}

func (h *ProfileHandler) ChangePassword(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "not authenticated"})
		return
	}

	var userID uint
	switch v := userIDRaw.(type) {
	case float64:
		userID = uint(v)
	case int:
		userID = uint(v)
	case uint:
		userID = v
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user id type"})
		return
	}

	var input struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.ChangePassword(userID, input.OldPassword, input.NewPassword); err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "current password is incorrect" {
			status = http.StatusBadRequest
		}
		c.JSON(status, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "password changed successfully"})
}
