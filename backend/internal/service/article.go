package service

import (
	"fmt"

	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/model"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/repository"
	"github.com/hands-on-vibe-coding/realworld-vibe-coding/backend/internal/utils"
)

// ArticleService handles article business logic
type ArticleService struct {
	articleRepo *repository.ArticleRepository
	userRepo    *repository.UserRepository
	tagService  *TagService
}

// NewArticleService creates a new article service
func NewArticleService(articleRepo *repository.ArticleRepository, userRepo *repository.UserRepository, tagService *TagService) *ArticleService {
	return &ArticleService{
		articleRepo: articleRepo,
		userRepo:    userRepo,
		tagService:  tagService,
	}
}

// CreateArticle creates a new article
func (s *ArticleService) CreateArticle(req model.CreateArticleRequest, authorID int) (*model.ArticleResponse, error) {
	// Validate input
	if req.Article.Title == "" {
		return nil, fmt.Errorf("title is required")
	}
	if req.Article.Description == "" {
		return nil, fmt.Errorf("description is required")
	}
	if req.Article.Body == "" {
		return nil, fmt.Errorf("body is required")
	}

	// Generate unique slug
	slug := utils.GenerateSlug(req.Article.Title)

	// Create article
	article := &model.Article{
		Slug:        slug,
		Title:       req.Article.Title,
		Description: req.Article.Description,
		Body:        req.Article.Body,
		AuthorID:    authorID,
	}

	err := s.articleRepo.Create(article)
	if err != nil {
		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	// Set tags if provided
	if len(req.Article.TagList) > 0 {
		err = s.tagService.CreateTagsForArticle(article.ID, req.Article.TagList)
		if err != nil {
			return nil, fmt.Errorf("failed to create article tags: %w", err)
		}
	}

	// Build response
	return s.buildArticleResponse(article, authorID)
}

// GetArticleBySlug retrieves an article by slug
func (s *ArticleService) GetArticleBySlug(slug string, currentUserID int) (*model.ArticleResponse, error) {
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return nil, err
	}

	return s.buildArticleResponse(article, currentUserID)
}

// UpdateArticle updates an existing article
func (s *ArticleService) UpdateArticle(slug string, req model.UpdateArticleRequest, currentUserID int) (*model.ArticleResponse, error) {
	// Get existing article to check ownership
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return nil, err
	}

	// Check if current user is the author
	if article.AuthorID != currentUserID {
		return nil, fmt.Errorf("unauthorized: you can only update your own articles")
	}

	// Build update map
	updates := make(map[string]interface{})

	if req.Article.Title != nil {
		if *req.Article.Title == "" {
			return nil, fmt.Errorf("title cannot be empty")
		}
		updates["title"] = *req.Article.Title
		// Generate new slug if title changed
		updates["slug"] = utils.GenerateSlug(*req.Article.Title)
	}

	if req.Article.Description != nil {
		if *req.Article.Description == "" {
			return nil, fmt.Errorf("description cannot be empty")
		}
		updates["description"] = *req.Article.Description
	}

	if req.Article.Body != nil {
		if *req.Article.Body == "" {
			return nil, fmt.Errorf("body cannot be empty")
		}
		updates["body"] = *req.Article.Body
	}

	// Update article
	updatedArticle, err := s.articleRepo.Update(slug, updates)
	if err != nil {
		return nil, fmt.Errorf("failed to update article: %w", err)
	}

	// Update tags if provided
	if req.Article.TagList != nil {
		err = s.tagService.UpdateTagsForArticle(updatedArticle.ID, req.Article.TagList)
		if err != nil {
			return nil, fmt.Errorf("failed to update article tags: %w", err)
		}
	}

	// If slug was updated, use the new slug
	finalSlug := slug
	if newSlug, ok := updates["slug"]; ok {
		finalSlug = newSlug.(string)
	}

	return s.GetArticleBySlug(finalSlug, currentUserID)
}

// DeleteArticle deletes an article
func (s *ArticleService) DeleteArticle(slug string, currentUserID int) error {
	// Get existing article to check ownership
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return err
	}

	// Check if current user is the author
	if article.AuthorID != currentUserID {
		return fmt.Errorf("unauthorized: you can only delete your own articles")
	}

	return s.articleRepo.Delete(slug)
}

// ArticleListParams represents parameters for listing articles
type ArticleListParams struct {
	Limit     int
	Offset    int
	Tag       string
	Author    string
	Favorited string
}

// GetArticles retrieves a list of articles with filtering and pagination
func (s *ArticleService) GetArticles(params ArticleListParams, currentUserID int) (*model.ArticlesResponse, error) {
	// Set default limit
	if params.Limit <= 0 {
		params.Limit = 20
	}
	if params.Limit > 100 {
		params.Limit = 100 // Max limit
	}

	// Get articles from repository
	articles, totalCount, err := s.articleRepo.GetArticles(params.Limit, params.Offset, params.Tag, params.Author, params.Favorited)
	if err != nil {
		return nil, fmt.Errorf("failed to get articles: %w", err)
	}

	// Build article responses
	articleResponses := make([]model.ArticleResponse, 0, len(articles))
	for _, article := range articles {
		articleResponse, err := s.buildArticleResponse(&article, currentUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to build article response: %w", err)
		}
		articleResponses = append(articleResponses, *articleResponse)
	}

	return &model.ArticlesResponse{
		Articles:      articleResponses,
		ArticlesCount: totalCount,
	}, nil
}

// GetArticlesFeed retrieves user's personalized feed of articles
func (s *ArticleService) GetArticlesFeed(params ArticleListParams, currentUserID int) (*model.ArticlesResponse, error) {
	// Set default limit
	if params.Limit <= 0 {
		params.Limit = 10
	}
	if params.Limit > 100 {
		params.Limit = 100 // Max limit
	}

	// Get feed articles from repository (articles from followed users)
	articles, totalCount, err := s.articleRepo.GetFeedArticles(params.Limit, params.Offset, currentUserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get feed articles: %w", err)
	}

	// Build article responses
	articleResponses := make([]model.ArticleResponse, 0, len(articles))
	for _, article := range articles {
		articleResponse, err := s.buildArticleResponse(&article, currentUserID)
		if err != nil {
			return nil, fmt.Errorf("failed to build article response: %w", err)
		}
		articleResponses = append(articleResponses, *articleResponse)
	}

	return &model.ArticlesResponse{
		Articles:      articleResponses,
		ArticlesCount: totalCount,
	}, nil
}

// buildArticleResponse builds an article response with author information
func (s *ArticleService) buildArticleResponse(article *model.Article, currentUserID int) (*model.ArticleResponse, error) {
	// Get author information
	author, err := s.userRepo.GetByID(article.AuthorID)
	if err != nil {
		return nil, fmt.Errorf("failed to get author: %w", err)
	}

	// Get article tags
	tags, err := s.tagService.GetTagsForArticle(article.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get article tags: %w", err)
	}

	// TODO: Implement following check
	// For now, set to false
	following := false

	// Check if current user has favorited this article
	favorited := false
	if currentUserID > 0 {
		var err error
		favorited, err = s.articleRepo.IsFavorited(currentUserID, article.ID)
		if err != nil {
			// Log error but don't fail the whole response
			favorited = false
		}
	}

	return &model.ArticleResponse{
		Slug:           article.Slug,
		Title:          article.Title,
		Description:    article.Description,
		Body:           article.Body,
		TagList:        tags,
		CreatedAt:      article.CreatedAt,
		UpdatedAt:      article.UpdatedAt,
		Favorited:      favorited,
		FavoritesCount: article.FavoritesCount,
		Author: model.AuthorProfile{
			Username:  author.Username,
			Bio:       author.Bio,
			Image:     author.Image,
			Following: following,
		},
	}, nil
}

// FavoriteArticle adds an article to user's favorites
func (s *ArticleService) FavoriteArticle(slug string, userID int) (*model.ArticleResponse, error) {
	// Get article by slug
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Check if already favorited
	isFavorited, err := s.articleRepo.IsFavorited(userID, article.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to check favorite status: %w", err)
	}

	if isFavorited {
		return nil, fmt.Errorf("article already favorited")
	}

	// Add to favorites
	err = s.articleRepo.FavoriteArticle(userID, article.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to favorite article: %w", err)
	}

	// Get updated favorites count
	favoritesCount, err := s.articleRepo.GetFavoritesCount(article.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get favorites count: %w", err)
	}
	article.FavoritesCount = favoritesCount

	// Build and return article response
	return s.buildArticleResponse(article, userID)
}

// UnfavoriteArticle removes an article from user's favorites
func (s *ArticleService) UnfavoriteArticle(slug string, userID int) (*model.ArticleResponse, error) {
	// Get article by slug
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return nil, fmt.Errorf("failed to get article: %w", err)
	}

	// Remove from favorites
	err = s.articleRepo.UnfavoriteArticle(userID, article.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to unfavorite article: %w", err)
	}

	// Get updated favorites count
	favoritesCount, err := s.articleRepo.GetFavoritesCount(article.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get favorites count: %w", err)
	}
	article.FavoritesCount = favoritesCount

	// Build and return article response
	return s.buildArticleResponse(article, userID)
}
