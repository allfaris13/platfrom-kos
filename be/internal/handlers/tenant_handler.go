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
	// Check if role filter is provided
	role := c.Query("role")
	
	var tenants []models.Penyewa
	var err error
	
	if role != "" {
		// Filter by role if provided
		tenants, err = h.service.GetTenantsByRole(role)
	} else {
		// Get all tenants
		tenants, err = h.service.GetAllTenants()
	}
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if tenants == nil {
		tenants = []models.Penyewa{}
	}
	c.JSON(http.StatusOK, tenants)
}
