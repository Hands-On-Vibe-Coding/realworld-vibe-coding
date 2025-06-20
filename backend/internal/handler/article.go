package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/middleware"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/service"
)

// ArticleHandler handles article HTTP requests
type ArticleHandler struct {
	articleService *service.ArticleService
}

// NewArticleHandler creates a new article handler
func NewArticleHandler(articleService *service.ArticleService) *ArticleHandler {
	return &ArticleHandler{
		articleService: articleService,
	}
}

// CreateArticle handles article creation
func (h *ArticleHandler) CreateArticle(w http.ResponseWriter, r *http.Request) {
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

	// Parse request body
	var req model.CreateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// Create article
	article, err := h.articleService.CreateArticle(req, claims.UserID)
	if err != nil {
		var statusCode int
		switch {
		case err.Error() == "title is required" || err.Error() == "description is required" || err.Error() == "body is required":
			statusCode = http.StatusBadRequest
		default:
			statusCode = http.StatusInternalServerError
		}

		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Prepare response
	response := model.ArticleResponseWrapper{
		Article: *article,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetArticle handles article retrieval by slug
func (h *ArticleHandler) GetArticle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get slug from URL
	vars := mux.Vars(r)
	slug := vars["slug"]
	if slug == "" {
		http.Error(w, `{"error":"Slug is required"}`, http.StatusBadRequest)
		return
	}

	// Get current user ID (optional for this endpoint)
	var currentUserID int
	if claims, ok := middleware.GetUserFromContext(r); ok {
		currentUserID = claims.UserID
	}

	// Get article
	article, err := h.articleService.GetArticleBySlug(slug, currentUserID)
	if err != nil {
		var statusCode int
		if err.Error() == "article not found" {
			statusCode = http.StatusNotFound
		} else {
			statusCode = http.StatusInternalServerError
		}

		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Prepare response
	response := model.ArticleResponseWrapper{
		Article: *article,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// UpdateArticle handles article updates
func (h *ArticleHandler) UpdateArticle(w http.ResponseWriter, r *http.Request) {
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

	// Get slug from URL
	vars := mux.Vars(r)
	slug := vars["slug"]
	if slug == "" {
		http.Error(w, `{"error":"Slug is required"}`, http.StatusBadRequest)
		return
	}

	// Parse request body
	var req model.UpdateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// Update article
	article, err := h.articleService.UpdateArticle(slug, req, claims.UserID)
	if err != nil {
		var statusCode int
		switch {
		case err.Error() == "article not found":
			statusCode = http.StatusNotFound
		case err.Error() == "unauthorized: you can only update your own articles":
			statusCode = http.StatusForbidden
		case err.Error() == "title cannot be empty" || err.Error() == "description cannot be empty" || err.Error() == "body cannot be empty":
			statusCode = http.StatusBadRequest
		default:
			statusCode = http.StatusInternalServerError
		}

		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Prepare response
	response := model.ArticleResponseWrapper{
		Article: *article,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// DeleteArticle handles article deletion
func (h *ArticleHandler) DeleteArticle(w http.ResponseWriter, r *http.Request) {
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

	// Get slug from URL
	vars := mux.Vars(r)
	slug := vars["slug"]
	if slug == "" {
		http.Error(w, `{"error":"Slug is required"}`, http.StatusBadRequest)
		return
	}

	// Delete article
	err := h.articleService.DeleteArticle(slug, claims.UserID)
	if err != nil {
		var statusCode int
		switch {
		case err.Error() == "article not found":
			statusCode = http.StatusNotFound
		case err.Error() == "unauthorized: you can only delete your own articles":
			statusCode = http.StatusForbidden
		default:
			statusCode = http.StatusInternalServerError
		}

		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Article deleted successfully"}`))
}

// GetArticles handles global article list retrieval with filtering and pagination
func (h *ArticleHandler) GetArticles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Parse query parameters
	params := service.ArticleListParams{}
	
	// Parse limit
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			params.Limit = limit
		}
	}
	
	// Parse offset
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			params.Offset = offset
		}
	}
	
	// Parse filters
	params.Tag = r.URL.Query().Get("tag")
	params.Author = r.URL.Query().Get("author")
	params.Favorited = r.URL.Query().Get("favorited")

	// Get current user ID (optional for this endpoint)
	var currentUserID int
	if claims, ok := middleware.GetUserFromContext(r); ok {
		currentUserID = claims.UserID
	}

	// Get articles
	response, err := h.articleService.GetArticles(params, currentUserID)
	if err != nil {
		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetArticlesFeed handles user's personalized feed retrieval
func (h *ArticleHandler) GetArticlesFeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Authentication required for feed
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Authentication required"}`, http.StatusUnauthorized)
		return
	}

	// Parse query parameters
	params := service.ArticleListParams{}
	
	// Parse limit
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			params.Limit = limit
		}
	}
	
	// Parse offset
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			params.Offset = offset
		}
	}

	// Get feed articles
	response, err := h.articleService.GetArticlesFeed(params, claims.UserID)
	if err != nil {
		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}