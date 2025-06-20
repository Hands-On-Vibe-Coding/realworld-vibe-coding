package handler

import (
	"encoding/json"
	"net/http"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/middleware"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/service"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/utils"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	userService *service.UserService
	jwtSecret   string
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *service.UserService, jwtSecret string) *UserHandler {
	return &UserHandler{
		userService: userService,
		jwtSecret:   jwtSecret,
	}
}

// Register handles user registration
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req model.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// Create user
	user, err := h.userService.CreateUser(req)
	if err != nil {
		// Handle specific validation errors
		var statusCode int
		switch {
		case err.Error() == "email already exists" || err.Error() == "username already exists":
			statusCode = http.StatusConflict
		default:
			statusCode = http.StatusBadRequest
		}
		
		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, h.jwtSecret)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Prepare response
	userResponse := h.userService.ToUserResponse(user, token)
	response := map[string]interface{}{
		"user": userResponse,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Login handles user authentication
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// Validate input
	if req.User.Email == "" || req.User.Password == "" {
		http.Error(w, `{"error":"Email and password are required"}`, http.StatusBadRequest)
		return
	}

	// Authenticate user
	user, err := h.userService.AuthenticateUser(req.User.Email, req.User.Password)
	if err != nil {
		http.Error(w, `{"error":"Invalid email or password"}`, http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, h.jwtSecret)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Prepare response
	userResponse := h.userService.ToUserResponse(user, token)
	response := map[string]interface{}{
		"user": userResponse,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetCurrentUser handles getting current user information
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from JWT middleware context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
		return
	}

	// Get user from database
	user, err := h.userService.GetUserByID(claims.UserID)
	if err != nil {
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	// Generate new token (refresh)
	token, err := utils.GenerateToken(user.ID, user.Email, h.jwtSecret)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Prepare response
	userResponse := h.userService.ToUserResponse(user, token)
	response := map[string]interface{}{
		"user": userResponse,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// UpdateUser handles updating user information
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from JWT middleware context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
		return
	}

	// Parse request body
	var req model.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// Update user
	user, err := h.userService.UpdateUser(claims.UserID, req)
	if err != nil {
		// Handle specific validation errors
		var statusCode int
		switch {
		case err.Error() == "email already exists" || err.Error() == "username already exists":
			statusCode = http.StatusConflict
		case err.Error() == "user not found":
			statusCode = http.StatusNotFound
		default:
			statusCode = http.StatusBadRequest
		}
		
		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Generate new token
	token, err := utils.GenerateToken(user.ID, user.Email, h.jwtSecret)
	if err != nil {
		http.Error(w, `{"error":"Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Prepare response
	userResponse := h.userService.ToUserResponse(user, token)
	response := map[string]interface{}{
		"user": userResponse,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

