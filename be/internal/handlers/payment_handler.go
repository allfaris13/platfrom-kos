package handlers

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	service    service.PaymentService
	cloudinary *utils.CloudinaryService
}

func NewPaymentHandler(s service.PaymentService, cld *utils.CloudinaryService) *PaymentHandler {
	return &PaymentHandler{s, cld}
}

func (h *PaymentHandler) GetAllPayments(c *gin.Context) {
	payments, err := h.service.GetAllPayments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if payments == nil {
		payments = []models.Pembayaran{}
	}
	c.JSON(http.StatusOK, payments)
}

func (h *PaymentHandler) ConfirmPayment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	if err := h.service.ConfirmPayment(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "payment confirmed successfully"})
}

func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	var req struct {
		PemesananID uint   `json:"pemesanan_id" binding:"required"`
		PaymentType string `json:"payment_type" binding:"required"` // "full" atau "dp"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// Validate payment type
	if req.PaymentType != "full" && req.PaymentType != "dp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment type. Must be 'full' or 'dp'"})
		return
	}

	payment, err := h.service.CreatePaymentSession(req.PemesananID, req.PaymentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment created successfully",
		"payment": payment,
	})
}

func (h *PaymentHandler) UploadPaymentProof(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"}) // Changed error message
		return
	}

	// Get file from form
	file, err := c.FormFile("proof") // Changed form field name
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment proof file is required"}) // Changed error message
		return
	}

	// Validate file (size and type)
	// Assuming utils.IsImageFile checks for image extensions.
	// If we support PDF, we might need a broader check.
	// Assuming image for now as Cloudinary handles images best.
	if !utils.IsImageFile(file) { // Changed validation
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only images are allowed."}) // Changed error message
		return
	}

	var proofURL string
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

	if err := h.service.UploadPaymentProof(uint(id), proofURL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment proof uploaded successfully",
		"url": proofURL,
	})
}

// generateUUID creates a unique identifier for file naming
func generateUUID() string {
	// Simple UUID generation (you could use github.com/google/uuid for production)
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// ConfirmCashPayment untuk mengkonfirmasi pembayaran cash
func (h *PaymentHandler) ConfirmCashPayment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	var req struct {
		BuktiTransfer string `json:"bukti_transfer"` // Deskripsi/bukti transfer
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	if err := h.service.ConfirmCashPayment(uint(id), req.BuktiTransfer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Payment confirmed successfully"})
}

func (h *PaymentHandler) GetReminders(c *gin.Context) {
	userIDLocal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := uint(userIDLocal.(int))

	reminders, err := h.service.GetPaymentReminders(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reminders)
}