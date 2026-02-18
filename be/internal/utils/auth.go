package utils

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// GoogleClaims structure for Google ID Token
type GoogleClaims struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
	Sub     string `json:"sub"`
	jwt.RegisteredClaims
}

// TokenClaims struktur untuk JWT claims
type TokenClaims struct {
	UserID   int    `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	TokenType string `json:"token_type"` // "access" or "refresh"
	jwt.RegisteredClaims
}

// Token expiry durations
const (
	AccessTokenExpiry  = 15 * time.Minute  // Short-lived
	RefreshTokenExpiry = 7 * 24 * time.Hour // 7 days
)

// GetAuthToken mendapatkan token dari cookie (prioritas) atau Authorization header (fallback)
func GetAuthToken(c *gin.Context) (string, error) {
	// 1. Check Cookie first (more secure)
	token, err := c.Cookie("access_token")
	if err == nil && token != "" {
		return token, nil
	}

	// 2. Fallback to Authorization header (for backward compatibility during migration)
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			return parts[1], nil
		}
	}

	return "", errors.New("auth token not found")
}

// GenerateTokenPair generates both access and refresh tokens
func GenerateTokenPair(userID int, username string, role string, jwtSecret string) (accessToken, refreshToken string, err error) {
	// Generate access token (short-lived)
	accessToken, err = GenerateToken(userID, username, role, "access", jwtSecret, AccessTokenExpiry)
	if err != nil {
		return "", "", err
	}

	// Generate refresh token (long-lived)
	refreshToken, err = GenerateToken(userID, username, role, "refresh", jwtSecret, RefreshTokenExpiry)
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

// GenerateToken generate JWT token with type
func GenerateToken(userID int, username string, role string, tokenType string, jwtSecret string, expiresIn time.Duration) (string, error) {
	expiresAt := time.Now().Add(expiresIn)

	claims := &TokenClaims{
		UserID:    userID,
		Username:  username,
		Role:      role,
		TokenType: tokenType,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken validate JWT token
func ValidateToken(token string, jwtSecret string) (*TokenClaims, error) {
	claims := &TokenClaims{}

	parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !parsedToken.Valid {
		return nil, errors.New("invalid token")
	}

	// Check if token expired
	if time.Now().After(claims.ExpiresAt.Time) {
		return nil, errors.New("token expired")
	}

	return claims, nil
}

// ValidateAccessToken validates access token specifically
func ValidateAccessToken(token string, jwtSecret string) (*TokenClaims, error) {
	claims, err := ValidateToken(token, jwtSecret)
	if err != nil {
		return nil, err
	}

	if claims.TokenType != "access" {
		return nil, errors.New("invalid token type: expected access token")
	}

	return claims, nil
}

// ValidateRefreshToken validates refresh token specifically
func ValidateRefreshToken(token string, jwtSecret string) (*TokenClaims, error) {
	claims, err := ValidateToken(token, jwtSecret)
	if err != nil {
		return nil, err
	}

	if claims.TokenType != "refresh" {
		return nil, errors.New("invalid token type: expected refresh token")
	}

	return claims, nil
}

// SetAuthCookies sets both access and refresh token cookies with security flags
func SetAuthCookies(c *gin.Context, accessToken, refreshToken string, isProduction bool) {
	// Set SameSite mode for CSRF protection
	sameSite := http.SameSiteStrictMode
	
	// Access Token Cookie (short-lived, all paths)
	c.SetSameSite(sameSite)
	c.SetCookie(
		"access_token",                      // cookie name
		accessToken,                         // cookie value
		int(AccessTokenExpiry.Seconds()),    // maxAge in seconds (15 min)
		"/",                                // path
		"",                                 // domain (empty = current domain)
		isProduction,                       // secure (HTTPS only in production)
		true,                               // httpOnly - prevents JavaScript access (XSS protection)
	)

	// Refresh Token Cookie (long-lived, limited path)
	c.SetSameSite(sameSite)
	c.SetCookie(
		"refresh_token",                     // cookie name
		refreshToken,                        // cookie value
		int(RefreshTokenExpiry.Seconds()),   // maxAge in seconds (7 days)
		"/api/auth",                        // limited path - only auth endpoints can access
		"",                                 // domain
		isProduction,                       // secure
		true,                               // httpOnly
	)
}

// ClearAuthCookies menghapus semua auth cookies (logout)
func ClearAuthCookies(c *gin.Context) {
	sameSite := http.SameSiteStrictMode
	
	// Clear access token
	c.SetSameSite(sameSite)
	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)

	// Clear refresh token
	c.SetSameSite(sameSite)
	c.SetCookie(
		"refresh_token",
		"",
		-1,
		"/api/auth",
		"",
		false,
		true,
	)
}

// DecodeGoogleToken decodes a Google ID token without verification (TEMPORARY)
func DecodeGoogleToken(tokenString string) (*GoogleClaims, error) {
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token format")
	}

	payload := parts[1]
	// Add padding if needed
	if l := len(payload) % 4; l > 0 {
		payload += strings.Repeat("=", 4-l)
	}

	decoded, err := base64.URLEncoding.DecodeString(payload)
	if err != nil {
		return nil, err
	}

	var claims GoogleClaims
	if err := json.Unmarshal(decoded, &claims); err != nil {
		return nil, err
	}

	return &claims, nil
}
