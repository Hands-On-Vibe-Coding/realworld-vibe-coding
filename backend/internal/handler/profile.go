package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"realworld-backend/internal/model"
	"realworld-backend/internal/service"
)

type ProfileHandler struct {
	profileService *service.ProfileService
}

func NewProfileHandler(profileService *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{
		profileService: profileService,
	}
}

// GetProfile handles GET /api/profiles/{username}
func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	// Extract username from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/profiles/")
	parts := strings.Split(path, "/")
	if len(parts) < 1 || parts[0] == "" {
		http.Error(w, `{"error": "Username is required"}`, http.StatusBadRequest)
		return
	}
	username := parts[0]
	
	// Get current user ID if authenticated (optional for profile viewing)
	var currentUserID *int
	if userID, ok := r.Context().Value("userID").(int); ok {
		currentUserID = &userID
	}

	profile, err := h.profileService.GetProfile(username, currentUserID)
	if err != nil {
		if err.Error() == "failed to get profile: profile not found" {
			http.Error(w, `{"error": "Profile not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Failed to get profile"}`, http.StatusInternalServerError)
		return
	}

	response := model.ProfileResponse{
		Profile: struct {
			Username  string  `json:"username"`
			Bio       *string `json:"bio"`
			Image     *string `json:"image"`
			Following bool    `json:"following"`
		}{
			Username:  profile.Username,
			Bio:       profile.Bio,
			Image:     profile.Image,
			Following: profile.Following,
		},
	}
	
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`, http.StatusInternalServerError)
		return
	}
}

// FollowUser handles POST /api/profiles/{username}/follow
func (h *ProfileHandler) FollowUser(w http.ResponseWriter, r *http.Request) {
	// Extract username from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/profiles/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[0] == "" {
		http.Error(w, `{"error": "Username is required"}`, http.StatusBadRequest)
		return
	}
	username := parts[0]
	
	// Get current user ID from context (authentication required)
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, `{"error": "Authentication required"}`, http.StatusUnauthorized)
		return
	}

	profile, err := h.profileService.FollowUser(userID, username)
	if err != nil {
		if err.Error() == "failed to follow user: user not found" {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		if err.Error() == "failed to follow user: cannot follow yourself" {
			http.Error(w, `{"error": "Cannot follow yourself"}`, http.StatusBadRequest)
			return
		}
		http.Error(w, `{"error": "Failed to follow user"}`, http.StatusInternalServerError)
		return
	}

	response := model.ProfileResponse{
		Profile: struct {
			Username  string  `json:"username"`
			Bio       *string `json:"bio"`
			Image     *string `json:"image"`
			Following bool    `json:"following"`
		}{
			Username:  profile.Username,
			Bio:       profile.Bio,
			Image:     profile.Image,
			Following: profile.Following,
		},
	}
	
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`, http.StatusInternalServerError)
		return
	}
}

// UnfollowUser handles DELETE /api/profiles/{username}/follow
func (h *ProfileHandler) UnfollowUser(w http.ResponseWriter, r *http.Request) {
	// Extract username from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/profiles/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[0] == "" {
		http.Error(w, `{"error": "Username is required"}`, http.StatusBadRequest)
		return
	}
	username := parts[0]
	
	// Get current user ID from context (authentication required)
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, `{"error": "Authentication required"}`, http.StatusUnauthorized)
		return
	}

	profile, err := h.profileService.UnfollowUser(userID, username)
	if err != nil {
		if err.Error() == "failed to unfollow user: user not found" {
			http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
			return
		}
		if err.Error() == "failed to unfollow user: not following this user" {
			http.Error(w, `{"error": "Not following this user"}`, http.StatusBadRequest)
			return
		}
		http.Error(w, `{"error": "Failed to unfollow user"}`, http.StatusInternalServerError)
		return
	}

	response := model.ProfileResponse{
		Profile: struct {
			Username  string  `json:"username"`
			Bio       *string `json:"bio"`
			Image     *string `json:"image"`
			Following bool    `json:"following"`
		}{
			Username:  profile.Username,
			Bio:       profile.Bio,
			Image:     profile.Image,
			Following: profile.Following,
		},
	}
	
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`, http.StatusInternalServerError)
		return
	}
}