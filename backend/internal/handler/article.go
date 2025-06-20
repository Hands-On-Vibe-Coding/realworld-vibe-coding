package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"realworld-backend/internal/middleware"
	"realworld-backend/internal/model"
	"realworld-backend/internal/service"
)

// ArticleHandler handles article-related HTTP requests
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
// POST /api/articles
func (h *ArticleHandler) CreateArticle(w http.ResponseWriter, r *http.Request) {
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

	var req model.ArticleCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	article, err := h.articleService.CreateArticle(claims.UserID, &req)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	response := model.ArticleResponse{Article: *article}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetArticle handles getting a single article
// GET /api/articles/:slug
func (h *ArticleHandler) GetArticle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Extract slug from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/articles/")
	slug := strings.Split(path, "/")[0]
	
	if slug == "" {
		http.Error(w, `{"error": "Article slug is required"}`, http.StatusBadRequest)
		return
	}

	// Get user ID if authenticated (optional)
	userID := 0
	if claims, ok := middleware.GetUserFromContext(r); ok {
		userID = claims.UserID
	}

	article, err := h.articleService.GetArticleBySlug(slug, userID)
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

// UpdateArticle handles article updates
// PUT /api/articles/:slug
func (h *ArticleHandler) UpdateArticle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
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
	slug := strings.Split(path, "/")[0]
	
	if slug == "" {
		http.Error(w, `{"error": "Article slug is required"}`, http.StatusBadRequest)
		return
	}

	var req model.ArticleUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	article, err := h.articleService.UpdateArticle(slug, claims.UserID, &req)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, `{"error": "Article not found"}`, http.StatusNotFound)
		} else if strings.Contains(err.Error(), "not authorized") {
			http.Error(w, `{"error": "Not authorized"}`, http.StatusForbidden)
		} else {
			http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		}
		return
	}

	response := model.ArticleResponse{Article: *article}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// DeleteArticle handles article deletion
// DELETE /api/articles/:slug
func (h *ArticleHandler) DeleteArticle(w http.ResponseWriter, r *http.Request) {
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
	slug := strings.Split(path, "/")[0]
	
	if slug == "" {
		http.Error(w, `{"error": "Article slug is required"}`, http.StatusBadRequest)
		return
	}

	err := h.articleService.DeleteArticle(slug, claims.UserID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			http.Error(w, `{"error": "Article not found"}`, http.StatusNotFound)
		} else if strings.Contains(err.Error(), "not authorized") {
			http.Error(w, `{"error": "Not authorized"}`, http.StatusForbidden)
		} else {
			http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ListArticles handles getting multiple articles
// GET /api/articles
func (h *ArticleHandler) ListArticles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Parse query parameters
	filter := model.ArticleFilter{
		Tag:       r.URL.Query().Get("tag"),
		Author:    r.URL.Query().Get("author"),
		Favorited: r.URL.Query().Get("favorited"),
		Limit:     20, // Default limit
		Offset:    0,  // Default offset
	}

	// Parse limit
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 && limit <= 100 {
			filter.Limit = limit
		}
	}

	// Parse offset
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			filter.Offset = offset
		}
	}

	// Get user ID if authenticated (optional)
	userID := 0
	if claims, ok := middleware.GetUserFromContext(r); ok {
		userID = claims.UserID
	}

	articles, total, err := h.articleService.ListArticles(filter, userID)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	response := model.ArticlesResponse{
		Articles:      articles,
		ArticlesCount: total,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetFeed handles getting user's article feed
// GET /api/articles/feed
func (h *ArticleHandler) GetFeed(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get user from context
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error": "User not found in context"}`, http.StatusUnauthorized)
		return
	}

	// Parse query parameters
	filter := model.FeedFilter{
		Limit:  20, // Default limit
		Offset: 0,  // Default offset
	}

	// Parse limit
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 && limit <= 100 {
			filter.Limit = limit
		}
	}

	// Parse offset
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			filter.Offset = offset
		}
	}

	articles, total, err := h.articleService.GetFeed(claims.UserID, filter)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	response := model.ArticlesResponse{
		Articles:      articles,
		ArticlesCount: total,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}