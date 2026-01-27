package handlers

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"net/http"
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
