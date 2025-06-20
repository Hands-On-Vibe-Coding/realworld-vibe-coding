package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/service"
)

// TagHandler handles tag HTTP requests
type TagHandler struct {
	tagService *service.TagService
}

// NewTagHandler creates a new tag handler
func NewTagHandler(tagService *service.TagService) *TagHandler {
	return &TagHandler{
		tagService: tagService,
	}
}

// TagsResponse represents the response for the tags endpoint
type TagsResponse struct {
	Tags []string `json:"tags"`
}

// GetTags handles GET /api/tags - retrieves popular tags
func (h *TagHandler) GetTags(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Parse limit parameter (optional)
	limit := 20 // default
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	// Get popular tags
	tags, err := h.tagService.GetPopularTags(limit)
	if err != nil {
		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Ensure we return an empty array instead of null if no tags
	if tags == nil {
		tags = []string{}
	}

	response := TagsResponse{
		Tags: tags,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// GetAllTags handles a variant endpoint to get all tags (optional)
func (h *TagHandler) GetAllTags(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Get all tags
	tags, err := h.tagService.GetAllTags()
	if err != nil {
		errorResponse := map[string]interface{}{
			"error": err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	// Ensure we return an empty array instead of null if no tags
	if tags == nil {
		tags = []string{}
	}

	response := TagsResponse{
		Tags: tags,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}