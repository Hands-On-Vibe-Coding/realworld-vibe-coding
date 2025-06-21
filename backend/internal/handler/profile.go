package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/middleware"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/service"
)

type ProfileHandler struct {
	profileService *service.ProfileService
}

func NewProfileHandler(profileService *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{
		profileService: profileService,
	}
}

type ProfileResponse struct {
	Profile interface{} `json:"profile"`
}

func (h *ProfileHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	username := vars["username"]

	// Get current user ID if authenticated (optional)
	var currentUserID *int
	if claims, ok := middleware.GetUserFromContext(r); ok {
		currentUserID = &claims.UserID
	}

	profile, err := h.profileService.GetProfile(username, currentUserID)
	if err != nil {
		var statusCode int
		switch err.Error() {
		case "failed to get profile: user not found":
			statusCode = http.StatusNotFound
		default:
			statusCode = http.StatusInternalServerError
		}
		http.Error(w, `{"error":"`+err.Error()+`"}`, statusCode)
		return
	}

	response := ProfileResponse{
		Profile: profile,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ProfileHandler) FollowUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from JWT middleware context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	username := vars["username"]

	profile, err := h.profileService.FollowUser(claims.UserID, username)
	if err != nil {
		var statusCode int
		switch {
		case err.Error() == "user not found: user not found":
			statusCode = http.StatusNotFound
		case err.Error() == "cannot follow yourself":
			statusCode = http.StatusBadRequest
		case err.Error() == "already following this user":
			statusCode = http.StatusConflict
		default:
			statusCode = http.StatusInternalServerError
		}
		http.Error(w, `{"error":"`+err.Error()+`"}`, statusCode)
		return
	}

	response := ProfileResponse{
		Profile: profile,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *ProfileHandler) UnfollowUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from JWT middleware context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	username := vars["username"]

	profile, err := h.profileService.UnfollowUser(claims.UserID, username)
	if err != nil {
		var statusCode int
		switch {
		case err.Error() == "user not found: user not found":
			statusCode = http.StatusNotFound
		case err.Error() == "failed to unfollow user: follow relationship not found":
			statusCode = http.StatusNotFound
		default:
			statusCode = http.StatusInternalServerError
		}
		http.Error(w, `{"error":"`+err.Error()+`"}`, statusCode)
		return
	}

	response := ProfileResponse{
		Profile: profile,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}