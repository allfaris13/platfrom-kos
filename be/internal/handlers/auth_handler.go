package handlers

import (
	"koskosan-be/internal/config"
	"koskosan-be/internal/service"
	"koskosan-be/internal/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service service.AuthService
	cfg     *config.Config
}

func NewAuthHandler(s service.AuthService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		service: s,
		cfg:     cfg,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Sanitize input
	input.Username = utils.SanitizeString(input.Username)
	input.Password = utils.SanitizeString(input.Password)

	_, user, err := h.service.Login(input.Username, input.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Generate token pair for secure authentication
	accessToken, refreshToken, err := utils.GenerateTokenPair(int(user.ID), user.Username, user.Role, h.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
		return
	}

	// Set secure HttpOnly cookies (XSS protection)
	utils.SetAuthCookies(c, accessToken, refreshToken, h.cfg.IsProduction)

	c.JSON(http.StatusOK, gin.H{
		"user": user,
		// Token NOT returned in response for security
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Address  string `json:"address"`
		Birthdate string `json:"birthdate"` // "YYYY-MM-DD"
		NIK       string `json:"nik"`
	}

	if err := c.ShouldBindJSON(&input); err  != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Sanitize and validate input
	input.Username = utils.SanitizeString(input.Username)
	input.Password = utils.SanitizeString(input.Password)
	input.Email = utils.SanitizeString(input.Email)
	input.Phone = utils.SanitizeString(input.Phone)
	input.Address = utils.SanitizeString(input.Address)
	input.Birthdate = utils.SanitizeString(input.Birthdate)
	input.NIK = utils.SanitizeString(input.NIK)

	// Validate username
	if validationErr := utils.ValidateUsername(input.Username); validationErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Message})
		return
	}

	// Validate password strength
	if validationErr := utils.ValidatePassword(input.Password); validationErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Message})
		return
	}

	// Parse birthdate
	
	user, err := h.service.Register(input.Username, input.Password, "guest", input.Email, input.Phone, input.Address, input.Birthdate, input.NIK)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user":    user,
	})
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var input struct {
		IDToken  string `json:"id_token" binding:"required"` // Google ID token to verify
		Username string `json:"username"`                     // Display name (optional, for new users)
		Picture  string `json:"picture"`                      // Profile picture (optional)
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format. id_token is required"})
		return
	}

	// Sanitize inputs
	input.IDToken = utils.SanitizeString(input.IDToken)
	input.Username = utils.SanitizeString(input.Username)
	input.Picture = utils.SanitizeString(input.Picture)

	// Pass ID token to service for verification
	_, user, err := h.service.GoogleLogin(input.IDToken, input.Username, input.Picture)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Google authentication failed. Invalid token."})
		return
	}

	// Generate token pair
	accessToken, refreshToken, err := utils.GenerateTokenPair(int(user.ID), user.Username, user.Role, h.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate tokens"})
		return
	}

	// Set secure HttpOnly cookies
	utils.SetAuthCookies(c, accessToken, refreshToken, h.cfg.IsProduction)

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var input struct {
		Email string `json:"email" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// SECURITY FIX: Always return generic success message to prevent user enumeration
	// Service will handle email sending if user exists, but won't reveal existence
	_ = h.service.ForgotPassword(input.Email)

	// Always return success to prevent email enumeration attacks
	c.JSON(http.StatusOK, gin.H{"message": "If the email is registered, a password reset link will be sent"})
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var input struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if validationErr := utils.ValidatePassword(input.NewPassword); validationErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": validationErr.Message})
		return
	}

	if err := h.service.ResetPassword(input.Token, input.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password has been reset successfully"})
}

// RefreshToken refreshes the access token using refresh token
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	// Get refresh token from cookie
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No refresh token found"})
		return
	}

	// Validate refresh token
	claims, err := utils.ValidateRefreshToken(refreshToken, h.cfg.JWTSecret)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	// Generate new access token
	newAccessToken, err := utils.GenerateToken(claims.UserID, claims.Username, claims.Role, "access", h.cfg.JWTSecret, utils.AccessTokenExpiry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new access token"})
		return
	}

	// Set new access token cookie
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"access_token",
		newAccessToken,
		int(utils.AccessTokenExpiry.Seconds()),
		"/",
		"",
		h.cfg.IsProduction,
		true,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed successfully"})
}

// Logout clears authentication cookies
func (h *AuthHandler) Logout(c *gin.Context) {
	// Clear all auth cookies
	utils.ClearAuthCookies(c)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
