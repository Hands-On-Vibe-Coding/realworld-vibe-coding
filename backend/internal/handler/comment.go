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

type CommentHandler struct {
	commentService *service.CommentService
}

func NewCommentHandler(commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{
		commentService: commentService,
	}
}

type CreateCommentRequest struct {
	Comment struct {
		Body string `json:"body"`
	} `json:"comment"`
}

func (h *CommentHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	vars := mux.Vars(r)
	slug := vars["slug"]

	// Get current user ID if authenticated (optional for GET)
	var currentUserID int
	if claims, ok := middleware.GetUserFromContext(r); ok {
		currentUserID = claims.UserID
	}

	comments, err := h.commentService.GetCommentsByArticleSlug(slug, currentUserID)
	if err != nil {
		var statusCode int
		switch err.Error() {
		case "article not found":
			statusCode = http.StatusNotFound
		default:
			statusCode = http.StatusInternalServerError
		}
		http.Error(w, `{"error":"`+err.Error()+`"}`, statusCode)
		return
	}

	response := model.CommentsResponse{
		Comments: comments,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
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
	slug := vars["slug"]

	// Parse request body
	var req CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Comment.Body == "" {
		http.Error(w, `{"error":"Comment body is required"}`, http.StatusBadRequest)
		return
	}

	// Create comment
	comment, err := h.commentService.CreateComment(slug, req.Comment.Body, claims.UserID)
	if err != nil {
		var statusCode int
		switch {
		case err.Error() == "failed to find article: article not found":
			statusCode = http.StatusNotFound
		case err.Error() == "comment body cannot be empty":
			statusCode = http.StatusBadRequest
		default:
			statusCode = http.StatusInternalServerError
		}
		http.Error(w, `{"error":"`+err.Error()+`"}`, statusCode)
		return
	}

	response := model.CommentResponse{
		Comment: comment,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *CommentHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
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
	commentIDStr := vars["id"]

	commentID, err := strconv.Atoi(commentIDStr)
	if err != nil {
		http.Error(w, `{"error":"Invalid comment ID"}`, http.StatusBadRequest)
		return
	}

	// Delete comment
	err = h.commentService.DeleteComment(commentID, claims.UserID)
	if err != nil {
		var statusCode int
		switch {
		case err.Error() == "failed to get comment: comment not found":
			statusCode = http.StatusNotFound
		case err.Error() == "unauthorized: only comment author can delete the comment":
			statusCode = http.StatusForbidden
		default:
			statusCode = http.StatusInternalServerError
		}
		http.Error(w, `{"error":"`+err.Error()+`"}`, statusCode)
		return
	}

	w.WriteHeader(http.StatusOK)
}