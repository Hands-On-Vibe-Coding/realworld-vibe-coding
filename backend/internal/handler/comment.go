package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"realworld-backend/internal/model"
	"realworld-backend/internal/service"
)

type CommentHandler struct {
	commentService *service.CommentService
}

func NewCommentHandler(commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{
		commentService: commentService,
	}
}

// GetComments handles GET /api/articles/{slug}/comments
func (h *CommentHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	// Extract slug from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/articles/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[0] == "" {
		http.Error(w, `{"error": "Article slug is required"}`, http.StatusBadRequest)
		return
	}
	slug := parts[0]
	
	// Get current user ID if authenticated
	var currentUserID *int
	if userID, ok := r.Context().Value("userID").(int); ok {
		currentUserID = &userID
	}

	comments, err := h.commentService.GetCommentsByArticleSlug(slug, currentUserID)
	if err != nil {
		http.Error(w, `{"error": "Failed to get comments"}`, http.StatusInternalServerError)
		return
	}

	response := model.CommentsResponse{Comments: comments}
	
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`, http.StatusInternalServerError)
		return
	}
}

// CreateComment handles POST /api/articles/{slug}/comments
func (h *CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	// Extract slug from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/articles/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[0] == "" {
		http.Error(w, `{"error": "Article slug is required"}`, http.StatusBadRequest)
		return
	}
	slug := parts[0]
	
	// Get current user ID from context (authentication required)
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, `{"error": "Authentication required"}`, http.StatusUnauthorized)
		return
	}

	var req model.CommentCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Comment.Body == "" {
		http.Error(w, `{"error": "Comment body is required"}`, http.StatusBadRequest)
		return
	}

	comment, err := h.commentService.CreateComment(slug, userID, req.Comment.Body)
	if err != nil {
		if err.Error() == "article not found" {
			http.Error(w, `{"error": "Article not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Failed to create comment"}`, http.StatusInternalServerError)
		return
	}

	response := model.CommentResponse{Comment: *comment}
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`, http.StatusInternalServerError)
		return
	}
}

// DeleteComment handles DELETE /api/articles/{slug}/comments/{id}
func (h *CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	// Extract comment ID from URL path
	path := strings.TrimPrefix(r.URL.Path, "/api/articles/")
	parts := strings.Split(path, "/")
	if len(parts) < 3 || parts[0] == "" || parts[2] == "" {
		http.Error(w, `{"error": "Comment ID is required"}`, http.StatusBadRequest)
		return
	}
	commentIDStr := parts[2]
	
	commentID, err := strconv.Atoi(commentIDStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid comment ID"}`, http.StatusBadRequest)
		return
	}
	
	// Get current user ID from context (authentication required)
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		http.Error(w, `{"error": "Authentication required"}`, http.StatusUnauthorized)
		return
	}

	err = h.commentService.DeleteComment(commentID, userID)
	if err != nil {
		if err.Error() == "comment not found or unauthorized" {
			http.Error(w, `{"error": "Comment not found or unauthorized"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Failed to delete comment"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}