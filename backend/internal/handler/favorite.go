package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"realworld-backend/internal/middleware"
	"realworld-backend/internal/model"
	"realworld-backend/internal/service"
)

// FavoriteHandler handles favorite-related HTTP requests
type FavoriteHandler struct {
	articleService *service.ArticleService
}

// NewFavoriteHandler creates a new favorite handler
func NewFavoriteHandler(articleService *service.ArticleService) *FavoriteHandler {
	return &FavoriteHandler{
		articleService: articleService,
	}
}

// FavoriteArticle handles adding an article to favorites
// POST /api/articles/:slug/favorite
func (h *FavoriteHandler) FavoriteArticle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error": "User not found in context"}`, http.StatusUnauthorized)
		return
	}

	// Extract slug from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/articles/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[0] == "" {
		http.Error(w, `{"error": "Article slug is required"}`, http.StatusBadRequest)
		return
	}
	slug := parts[0]

	article, err := h.articleService.FavoriteArticle(slug, claims.UserID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, `{"error": "Article not found"}`, http.StatusNotFound)
		} else {
			http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		}
		return
	}

	response := model.ArticleResponse{Article: *article}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// UnfavoriteArticle handles removing an article from favorites
// DELETE /api/articles/:slug/favorite
func (h *FavoriteHandler) UnfavoriteArticle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error": "User not found in context"}`, http.StatusUnauthorized)
		return
	}

	// Extract slug from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/articles/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[0] == "" {
		http.Error(w, `{"error": "Article slug is required"}`, http.StatusBadRequest)
		return
	}
	slug := parts[0]

	article, err := h.articleService.UnfavoriteArticle(slug, claims.UserID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, `{"error": "Article not found"}`, http.StatusNotFound)
		} else {
			http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		}
		return
	}

	response := model.ArticleResponse{Article: *article}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}