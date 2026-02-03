package handlers

import (
	"koskosan-be/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ContactHandler struct {
	contactService service.ContactService
}

func NewContactHandler(s service.ContactService) *ContactHandler {
	return &ContactHandler{
		contactService: s,
	}
}

type ContactRequest struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Message string `json:"message" binding:"required"`
}

func (h *ContactHandler) HandleContactForm(c *gin.Context) {
	var req ContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data: " + err.Error()})
		return
	}

	err := h.contactService.SendContactMessage(req.Name, req.Email, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message sent successfully"})
}
