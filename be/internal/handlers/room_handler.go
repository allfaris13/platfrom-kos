package handlers

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
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
	var kamar models.Kamar
	if err := c.ShouldBindJSON(&kamar); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.Create(&kamar); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, kamar)
}
