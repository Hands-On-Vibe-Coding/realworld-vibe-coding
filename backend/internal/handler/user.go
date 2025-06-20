package handler

import (
	"encoding/json"
	"net/http"

	"realworld-backend/internal/middleware"
	"realworld-backend/internal/model"
	"realworld-backend/internal/service"
	"realworld-backend/internal/utils"
)

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	userService *service.UserService
}

// NewUserHandler creates a new user handler
func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// Register handles user registration
// POST /api/users
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req model.UserCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	user, err := h.userService.Register(&req)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Username, user.Email)
	if err != nil {
		http.Error(w, `{"error": "Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Create response
	response := model.UserResponse{
		User: struct {
			Email    string  `json:"email"`
			Token    string  `json:"token"`
			Username string  `json:"username"`
			Bio      *string `json:"bio"`
			Image    *string `json:"image"`
		}{
			Email:    user.Email,
			Token:    token,
			Username: user.Username,
			Bio:      user.Bio,
			Image:    user.Image,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// Login handles user authentication
// POST /api/users/login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req model.UserLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	user, err := h.userService.Login(&req)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Username, user.Email)
	if err != nil {
		http.Error(w, `{"error": "Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Create response
	response := model.UserResponse{
		User: struct {
			Email    string  `json:"email"`
			Token    string  `json:"token"`
			Username string  `json:"username"`
			Bio      *string `json:"bio"`
			Image    *string `json:"image"`
		}{
			Email:    user.Email,
			Token:    token,
			Username: user.Username,
			Bio:      user.Bio,
			Image:    user.Image,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetCurrentUser returns the current authenticated user
// GET /api/user
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from context (set by auth middleware)
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error": "User not found in context"}`, http.StatusUnauthorized)
		return
	}

	user, err := h.userService.GetUserByID(claims.UserID)
	if err != nil {
		http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
		return
	}

	// Generate new token
	token, err := utils.GenerateJWT(user.ID, user.Username, user.Email)
	if err != nil {
		http.Error(w, `{"error": "Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Create response
	response := model.UserResponse{
		User: struct {
			Email    string  `json:"email"`
			Token    string  `json:"token"`
			Username string  `json:"username"`
			Bio      *string `json:"bio"`
			Image    *string `json:"image"`
		}{
			Email:    user.Email,
			Token:    token,
			Username: user.Username,
			Bio:      user.Bio,
			Image:    user.Image,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// UpdateUser updates the current authenticated user
// PUT /api/user
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from context (set by auth middleware)
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error": "User not found in context"}`, http.StatusUnauthorized)
		return
	}

	var req model.UserUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	user, err := h.userService.UpdateUser(claims.UserID, &req)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	// Generate new token with updated info
	token, err := utils.GenerateJWT(user.ID, user.Username, user.Email)
	if err != nil {
		http.Error(w, `{"error": "Failed to generate token"}`, http.StatusInternalServerError)
		return
	}

	// Create response
	response := model.UserResponse{
		User: struct {
			Email    string  `json:"email"`
			Token    string  `json:"token"`
			Username string  `json:"username"`
			Bio      *string `json:"bio"`
			Image    *string `json:"image"`
		}{
			Email:    user.Email,
			Token:    token,
			Username: user.Username,
			Bio:      user.Bio,
			Image:    user.Image,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}