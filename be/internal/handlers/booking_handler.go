package handlers

import (
	"koskosan-be/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type BookingHandler struct {
	service service.BookingService
}

func NewBookingHandler(s service.BookingService) *BookingHandler {
	return &BookingHandler{s}
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
	userID := uint(userIDRaw.(float64)) // Assuming middleware works correctly

	var req struct {
		KamarID      uint   `json:"kamar_id" binding:"required"`
		TanggalMulai string `json:"tanggal_mulai" binding:"required"`
		DurasiSewa   int    `json:"durasi_sewa" border:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	booking, err := h.service.CreateBooking(userID, req.KamarID, req.TanggalMulai, req.DurasiSewa)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, booking)
}
