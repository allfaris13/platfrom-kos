package utils

import (
	"fmt"
	"regexp"
	"strings"
	"unicode"
)

// ValidationError represents a validation error
type ValidationError struct {
	Field   string
	Message string
}

// ValidateUsername checks if username meets requirements
func ValidateUsername(username string) *ValidationError {
	if len(username) < 3 {
		return &ValidationError{
			Field:   "username",
			Message: "Username must be at least 3 characters long",
		}
	}
	if len(username) > 30 {
		return &ValidationError{
			Field:   "username",
			Message: "Username must not exceed 30 characters",
		}
	}
	
	// Only alphanumeric and underscore allowed
	if matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]+$`, username); !matched {
		return &ValidationError{
			Field:   "username",
			Message: "Username can only contain letters, numbers, and underscores",
		}
	}
	
	return nil
}

// ValidatePassword checks if password meets security requirements
func ValidatePassword(password string) *ValidationError {
	if len(password) < 8 {
		return &ValidationError{
			Field:   "password",
			Message: "Password must be at least 8 characters long",
		}
	}
	
	if len(password) > 128 {
		return &ValidationError{
			Field:   "password",
			Message: "Password must not exceed 128 characters",
		}
	}
	
	// Check for at least one uppercase letter
	hasUpper := false
	hasLower := false
	hasDigit := false
	
	for _, char := range password {
		if unicode.IsUpper(char) {
			hasUpper = true
		}
		if unicode.IsLower(char) {
			hasLower = true
		}
		if unicode.IsDigit(char) {
			hasDigit = true
		}
	}
	
	if !hasUpper {
		return &ValidationError{
			Field:   "password",
			Message: "Password must contain at least one uppercase letter",
		}
	}
	
	if !hasLower {
		return &ValidationError{
			Field:   "password",
			Message: "Password must contain at least one lowercase letter",
		}
	}
	
	if !hasDigit {
		return &ValidationError{
			Field:   "password",
			Message: "Password must contain at least one number",
		}
	}
	
	return nil
}

// ValidateEmail checks if email format is valid
func ValidateEmail(email string) *ValidationError {
	if email == "" {
		return &ValidationError{
			Field:   "email",
			Message: "Email is required",
		}
	}
	
	// Simple email regex (RFC 5322 compliant would be too complex)
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(email) {
		return &ValidationError{
			Field:   "email",
			Message: "Invalid email format",
		}
	}
	
	if len(email) > 254 {
		return &ValidationError{
			Field:   "email",
			Message: "Email must not exceed 254 characters",
		}
	}
	
	return nil
}

// ValidateNIK checks if NIK format is valid (must be exactly 16 digits)
func ValidateNIK(nik string) *ValidationError {
	if nik == "" {
		return &ValidationError{
			Field:   "nik",
			Message: "NIK is required",
		}
	}
	
	// NIK must be exactly 16 digits
	if len(nik) != 16 {
		return &ValidationError{
			Field:   "nik",
			Message: "NIK must be exactly 16 digits",
		}
	}
	
	// Check if all characters are digits
	nikRegex := regexp.MustCompile(`^\d{16}$`)
	if !nikRegex.MatchString(nik) {
		return &ValidationError{
			Field:   "nik",
			Message: "NIK must consist only of digits",
		}
	}
	
	return nil
}

// SanitizeString removes potentially harmful characters
func SanitizeString(input string) string {
	// Remove null bytes
	input = strings.ReplaceAll(input, "\x00", "")
	// Trim whitespace
	input = strings.TrimSpace(input)
	return input
}

// ValidateStringLength checks string length constraints
func ValidateStringLength(value, field string, min, max int) *ValidationError {
	length := len(value)
	if length < min {
		return &ValidationError{
			Field:   field,
			Message: fmt.Sprintf("%s must be at least %d characters long", field, min),
		}
	}
	if length > max {
		return &ValidationError{
			Field:   field,
			Message: fmt.Sprintf("%s must not exceed %d characters", field, max),
		}
	}
	return nil
}
