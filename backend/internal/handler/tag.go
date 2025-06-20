package handler

import (
	"encoding/json"
	"net/http"

	"realworld-backend/internal/model"
	"realworld-backend/internal/repository"
)

// TagHandler handles tag-related HTTP requests
type TagHandler struct {
	tagRepo *repository.TagRepository
}

// NewTagHandler creates a new tag handler
func NewTagHandler(tagRepo *repository.TagRepository) *TagHandler {
	return &TagHandler{
		tagRepo: tagRepo,
	}
}

// GetTags handles getting all tags
// GET /api/tags
func (h *TagHandler) GetTags(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	tags, err := h.tagRepo.GetAll()
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	// Return empty array if no tags
	if tags == nil {
		tags = []string{}
	}

	response := model.TagsResponse{Tags: tags}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}