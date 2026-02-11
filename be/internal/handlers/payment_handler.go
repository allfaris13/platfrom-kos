package handlers

import (
	"fmt"
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	service service.PaymentService
}

func NewPaymentHandler(s service.PaymentService) *PaymentHandler {
	return &PaymentHandler{s}
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	// Handle file upload
	file, err := c.FormFile("proof")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Proof file is required"})
		return
	}

	// Generate filename
	filename := fmt.Sprintf("proof_%d_%s", id, file.Filename)
	filepath := "uploads/proofs/" + filename

	// Ensure directory exists
	if err := os.MkdirAll("uploads/proofs", os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
		return
	}

	// Save file
	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Update record with file path (relative for URL access)
	proofURL := "/uploads/proofs/" + filename

	if err := h.service.UploadPaymentProof(uint(id), proofURL); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment proof uploaded successfully",
		"url": proofURL,
	})
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