package handlers

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type TenantHandler struct {
	service service.TenantService
}

func NewTenantHandler(s service.TenantService) *TenantHandler {
	return &TenantHandler{s}
}

func (h *TenantHandler) GetAllTenants(c *gin.Context) {
	tenants, err := h.service.GetAllTenants()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if tenants == nil {
		tenants = []models.Penyewa{}
	}
	c.JSON(http.StatusOK, tenants)
}
