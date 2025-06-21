package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/middleware"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/utils"
)

// AuthHandler handles authentication-related endpoints
type AuthHandler struct {
	jwtSecret string
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(jwtSecret string) *AuthHandler {
	return &AuthHandler{
		jwtSecret: jwtSecret,
	}
}

// TestTokenRequest represents the request body for test token generation
type TestTokenRequest struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
}

// TokenResponse represents the response for token-related endpoints
type TokenResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// User represents a user in responses
type User struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
}

// GenerateTestToken generates a test JWT token (for development/testing purposes)
func (h *AuthHandler) GenerateTestToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req TestTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// Validate input
	if req.UserID <= 0 || req.Email == "" {
		http.Error(w, `{"error":"user_id and email are required"}`, http.StatusBadRequest)
		return
	}

	// Generate token
	token, err := utils.GenerateToken(req.UserID, req.Email, h.jwtSecret)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Failed to generate token: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	// Prepare response
	response := TokenResponse{
		Token: token,
		User: User{
			ID:    req.UserID,
			Email: req.Email,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// ValidateToken validates the provided JWT token
func (h *AuthHandler) ValidateToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from context (set by JWT middleware)
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"No authentication found"}`, http.StatusUnauthorized)
		return
	}

	// Prepare response
	response := map[string]interface{}{
		"valid": true,
		"user": User{
			ID:    claims.UserID,
			Email: claims.Email,
		},
		"expires_at": claims.ExpiresAt.Time,
		"issued_at":  claims.IssuedAt.Time,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// RefreshToken refreshes the JWT token
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get current user from context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"No authentication found"}`, http.StatusUnauthorized)
		return
	}

	// Generate new token
	newToken, err := utils.GenerateToken(claims.UserID, claims.Email, h.jwtSecret)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Failed to refresh token: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	// Prepare response
	response := TokenResponse{
		Token: newToken,
		User: User{
			ID:    claims.UserID,
			Email: claims.Email,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// ProtectedEndpoint is a test endpoint that requires authentication
func (h *AuthHandler) ProtectedEndpoint(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
		return
	}

	response := map[string]interface{}{
		"message": "This is a protected endpoint",
		"user": User{
			ID:    claims.UserID,
			Email: claims.Email,
		},
		"timestamp": claims.IssuedAt.Time,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// ParseUserIDFromPath extracts user ID from URL path
func ParseUserIDFromPath(path string) (int, error) {
	// This is a simple implementation - in a real app you'd use a router
	// For now, we'll assume the ID is at the end of the path
	parts := strings.Split(path, "/")
	if len(parts) == 0 {
		return 0, fmt.Errorf("invalid path")
	}

	idStr := parts[len(parts)-1]
	return strconv.Atoi(idStr)
}
