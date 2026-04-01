package handlers

import (
	"koskosan-be/internal/models"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TenantHandler struct {
	service service.TenantService
}

func NewTenantHandler(s service.TenantService) *TenantHandler {
	return &TenantHandler{s}
}

func (h *TenantHandler) GetAllTenants(c *gin.Context) {
	pagination := utils.GeneratePaginationFromRequest(c)
	search := c.Query("search")
	role := c.Query("role")

	tenants, totalRows, err := h.service.GetTenantsPaginated(&pagination, search, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if tenants == nil {
		tenants = []models.Penyewa{}
	}

	pagination.TotalRows = totalRows
	pagination.TotalPages = int((totalRows + int64(pagination.Limit) - 1) / int64(pagination.Limit))

	response := utils.PaginatedResponse{
		Data: tenants,
		Meta: pagination,
	}

	c.JSON(http.StatusOK, response)
}

func (h *TenantHandler) DeactivateTenant(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid tenant ID"})
		return
	}

	if err := h.service.DeactivateTenant(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status pengguna berhasil diubah menjadi Non Active"})
}
