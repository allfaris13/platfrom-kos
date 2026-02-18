package handlers

import (
	"fmt"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BookingHandler struct {
	service    service.BookingService
	cloudinary *utils.CloudinaryService
}

func NewBookingHandler(s service.BookingService, cld *utils.CloudinaryService) *BookingHandler {
	return &BookingHandler{s, cld}
}

func (h *BookingHandler) GetMyBookings(c *gin.Context) {
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

	bookings, err := h.service.GetUserBookings(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

func (h *BookingHandler) CreateBooking(c *gin.Context) {
	userIDRaw, _ := c.Get("user_id")
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

	var req struct {
		KamarID      uint   `json:"kamar_id" binding:"required"`
		TanggalMulai string `json:"tanggal_mulai" binding:"required"`
		DurasiSewa   int    `json:"durasi_sewa" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	booking, err := h.service.CreateBooking(userID, req.KamarID, req.TanggalMulai, req.DurasiSewa)
	if err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile or Room not found. Please complete your profile first."})
			return
		}
		if err.Error() == "anda sudah memiliki pesanan aktif (Pending). Selesaikan pembayaran atau batalkan pesanan sebelumnya" {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, booking)
}

func (h *BookingHandler) CreateBookingWithProof(c *gin.Context) {
	userIDRaw, _ := c.Get("user_id")
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

	// Parsing multipart form
	kamarIDStr := c.PostForm("kamar_id")
	tanggalMulai := c.PostForm("tanggal_mulai")
	durasiSewaStr := c.PostForm("durasi_sewa")
	paymentType := c.PostForm("payment_type")
	paymentMethod := c.PostForm("payment_method") // Added payment_method

	kamarID, _ := strconv.ParseUint(kamarIDStr, 10, 32)
	durasiSewa, _ := strconv.Atoi(durasiSewaStr)

	var proofURL string
	file, err := c.FormFile("proof")
	
	switch paymentMethod {
	case "transfer":
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Payment proof is required for bank transfer"})
			return
		}

		if !utils.IsImageFile(file) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only images are allowed."})
			return
		}

		if h.cloudinary != nil {
			src, err := file.Open()
			if err == nil {
				defer src.Close()
				url, err := h.cloudinary.UploadImage(src, "koskosan/proofs")
				if err == nil {
					proofURL = url
				} else {
					utils.GlobalLogger.Error("Cloudinary upload failed: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to upload proof to cloud: %v", err)})
					return
				}
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open proof file"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloud storage not configured"})
			return
		}
	case "cash":
		// No proof needed for cash
		proofURL = ""
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment method"})
		return
	}

	booking, err := h.service.CreateBookingWithProof(userID, uint(kamarID), tanggalMulai, durasiSewa, proofURL, paymentType, paymentMethod)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, booking)
}

func (h *BookingHandler) CancelBooking(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

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

	if err := h.service.CancelBooking(uint(id), userID); err != nil {
		if err.Error() == "unauthorized: you can only cancel your own bookings" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking cancelled successfully"})
}

func (h *BookingHandler) ExtendBooking(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid booking ID"})
		return
	}

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

	var req struct {
		Months int `json:"months" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	payment, err := h.service.ExtendBooking(uint(id), req.Months, userID)
	if err != nil {
		if err.Error() == "unauthorized: you can only extend your own bookings" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, payment)
}
