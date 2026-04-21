package handlers

import (
	"koskosan-be/internal/service"
	"log"
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

	// Send message in a goroutine to prevent the client from waiting and Cloudflare timeouts (524)
	go func() {
		if err := h.contactService.SendContactMessage(req.Name, req.Email, req.Message); err != nil {
			log.Printf("Contact Form Error: Failed to send message from %s (%s): %v", req.Name, req.Email, err)
		}
	}()
	
	c.JSON(http.StatusOK, gin.H{"message": "Pesan Anda telah diterima dan akan segera kami proses."})
}
