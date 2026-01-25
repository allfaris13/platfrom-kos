package handlers

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	service service.ReviewService
}

func NewReviewHandler(s service.ReviewService) *ReviewHandler {
	return &ReviewHandler{s}
}

func (h *ReviewHandler) GetReviews(c *gin.Context) {
	kamarIDStr := c.Param("id")
	kamarID, err := strconv.ParseUint(kamarIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Kamar ID"})
		return
	}

	reviews, err := h.service.GetReviewsByKamarID(uint(kamarID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reviews)
}

func (h *ReviewHandler) GetAllReviews(c *gin.Context) {
	reviews, err := h.service.GetAllReviews()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reviews)
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	var review models.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Assuming UserID is set from context middleware in a real app,
	// for now we trust the payload or it could be hardcoded if no auth
	// userID, _ := c.Get("user_id")
	// userRole, _ := c.Get("role")

	if err := h.service.CreateReview(&review); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, review)
}
