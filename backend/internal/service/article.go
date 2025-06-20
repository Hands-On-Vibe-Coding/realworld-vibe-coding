package service

import (
	"fmt"
	"strings"

	"realworld-backend/internal/model"
	"realworld-backend/internal/repository"
	"realworld-backend/internal/utils"
)

// ArticleService handles article business logic
type ArticleService struct {
	articleRepo  *repository.ArticleRepository
	tagRepo      *repository.TagRepository
	favoriteRepo *repository.FavoriteRepository
	userRepo     *repository.UserRepository
}

// NewArticleService creates a new article service
func NewArticleService(
	articleRepo *repository.ArticleRepository,
	tagRepo *repository.TagRepository,
	favoriteRepo *repository.FavoriteRepository,
	userRepo *repository.UserRepository,
) *ArticleService {
	return &ArticleService{
		articleRepo:  articleRepo,
		tagRepo:      tagRepo,
		favoriteRepo: favoriteRepo,
		userRepo:     userRepo,
	}
}

// CreateArticle creates a new article
func (s *ArticleService) CreateArticle(authorID int, req *model.ArticleCreateRequest) (*model.Article, error) {
	// Validate input
	if err := s.validateCreateRequest(req); err != nil {
		return nil, err
	}

	// Generate unique slug
	slug := utils.GenerateSlug(req.Article.Title)
	
	// Ensure slug is unique
	for {
		exists, err := s.articleRepo.SlugExists(slug)
		if err != nil {
			return nil, fmt.Errorf("failed to check slug existence: %w", err)
		}
		if !exists {
			break
		}
		slug = utils.GenerateSlug(req.Article.Title)
	}

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

	// Add tags if provided
	if len(req.Article.TagList) > 0 {
		err = s.addTagsToArticle(article.ID, req.Article.TagList)
		if err != nil {
			return nil, fmt.Errorf("failed to add tags to article: %w", err)
		}
	}

	// Populate computed fields
	err = s.populateArticleFields(article, 0) // No user context for creation
	if err != nil {
		return nil, fmt.Errorf("failed to populate article fields: %w", err)
	}

	return article, nil
}

// GetArticleBySlug retrieves an article by slug
func (s *ArticleService) GetArticleBySlug(slug string, userID int) (*model.Article, error) {
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return nil, err
	}

	// Populate computed fields
	err = s.populateArticleFields(article, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to populate article fields: %w", err)
	}

	return article, nil
}

// UpdateArticle updates an existing article
func (s *ArticleService) UpdateArticle(slug string, authorID int, req *model.ArticleUpdateRequest) (*model.Article, error) {
	// Get existing article
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return nil, err
	}

	// Check ownership
	if article.AuthorID != authorID {
		return nil, fmt.Errorf("not authorized to update this article")
	}

	// Update fields if provided
	updated := false
	if req.Article.Title != nil {
		article.Title = *req.Article.Title
		// Regenerate slug if title changed
		article.Slug = utils.GenerateSlug(article.Title)
		updated = true
	}
	if req.Article.Description != nil {
		article.Description = *req.Article.Description
		updated = true
	}
	if req.Article.Body != nil {
		article.Body = *req.Article.Body
		updated = true
	}

	if updated {
		err = s.articleRepo.Update(article)
		if err != nil {
			return nil, fmt.Errorf("failed to update article: %w", err)
		}
	}

	// Update tags if provided
	if req.Article.TagList != nil {
		err = s.updateArticleTags(article.ID, req.Article.TagList)
		if err != nil {
			return nil, fmt.Errorf("failed to update article tags: %w", err)
		}
	}

	// Populate computed fields
	err = s.populateArticleFields(article, authorID)
	if err != nil {
		return nil, fmt.Errorf("failed to populate article fields: %w", err)
	}

	return article, nil
}

// DeleteArticle deletes an article
func (s *ArticleService) DeleteArticle(slug string, authorID int) error {
	// Get existing article
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return err
	}

	// Check ownership
	if article.AuthorID != authorID {
		return fmt.Errorf("not authorized to delete this article")
	}

	// Delete article (cascading will handle tags and favorites)
	err = s.articleRepo.Delete(article.ID)
	if err != nil {
		return fmt.Errorf("failed to delete article: %w", err)
	}

	return nil
}

// ListArticles lists articles with filtering and pagination
func (s *ArticleService) ListArticles(filter model.ArticleFilter, userID int) ([]model.Article, int, error) {
	articles, total, err := s.articleRepo.List(filter)
	if err != nil {
		return nil, 0, err
	}

	// Populate computed fields for all articles
	for i := range articles {
		err = s.populateArticleFields(&articles[i], userID)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to populate article fields: %w", err)
		}
	}

	return articles, total, nil
}

// GetFeed gets articles from followed users
func (s *ArticleService) GetFeed(userID int, filter model.FeedFilter) ([]model.Article, int, error) {
	articles, total, err := s.articleRepo.GetFeed(userID, filter)
	if err != nil {
		return nil, 0, err
	}

	// Populate computed fields for all articles
	for i := range articles {
		err = s.populateArticleFields(&articles[i], userID)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to populate article fields: %w", err)
		}
	}

	return articles, total, nil
}

// populateArticleFields populates computed fields like author, tags, favorites
func (s *ArticleService) populateArticleFields(article *model.Article, userID int) error {
	// Get author information
	author, err := s.userRepo.GetByID(article.AuthorID)
	if err != nil {
		return fmt.Errorf("failed to get article author: %w", err)
	}

	article.Author = &model.Profile{
		Username: author.Username,
		Bio:      author.Bio,
		Image:    author.Image,
		Following: false, // TODO: Implement following logic
	}

	// Get tags
	tags, err := s.tagRepo.GetByArticleID(article.ID)
	if err != nil {
		return fmt.Errorf("failed to get article tags: %w", err)
	}
	article.TagList = tags

	// Get favorites count
	favoritesCount, err := s.favoriteRepo.GetFavoritesCount(article.ID)
	if err != nil {
		return fmt.Errorf("failed to get favorites count: %w", err)
	}
	article.FavoritesCount = favoritesCount

	// Check if favorited by current user
	if userID > 0 {
		favorited, err := s.favoriteRepo.IsFavorited(userID, article.ID)
		if err != nil {
			return fmt.Errorf("failed to check if favorited: %w", err)
		}
		article.Favorited = favorited
	}

	return nil
}

// addTagsToArticle adds tags to an article
func (s *ArticleService) addTagsToArticle(articleID int, tagNames []string) error {
	for _, tagName := range tagNames {
		tagName = strings.TrimSpace(tagName)
		if tagName == "" {
			continue
		}

		tag, err := s.tagRepo.GetOrCreate(tagName)
		if err != nil {
			return fmt.Errorf("failed to get or create tag: %w", err)
		}

		err = s.tagRepo.AddToArticle(articleID, tag.ID)
		if err != nil {
			return fmt.Errorf("failed to add tag to article: %w", err)
		}
	}

	return nil
}

// updateArticleTags updates tags for an article
func (s *ArticleService) updateArticleTags(articleID int, tagNames []string) error {
	// Clear existing tags
	err := s.tagRepo.ClearArticleTags(articleID)
	if err != nil {
		return fmt.Errorf("failed to clear article tags: %w", err)
	}

	// Add new tags
	if len(tagNames) > 0 {
		err = s.addTagsToArticle(articleID, tagNames)
		if err != nil {
			return err
		}
	}

	return nil
}

// FavoriteArticle adds an article to user's favorites
func (s *ArticleService) FavoriteArticle(slug string, userID int) (*model.Article, error) {
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return nil, err
	}

	err = s.favoriteRepo.Add(userID, article.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to favorite article: %w", err)
	}

	// Populate updated fields
	err = s.populateArticleFields(article, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to populate article fields: %w", err)
	}

	return article, nil
}

// UnfavoriteArticle removes an article from user's favorites
func (s *ArticleService) UnfavoriteArticle(slug string, userID int) (*model.Article, error) {
	article, err := s.articleRepo.GetBySlug(slug)
	if err != nil {
		return nil, err
	}

	err = s.favoriteRepo.Remove(userID, article.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to unfavorite article: %w", err)
	}

	// Populate updated fields
	err = s.populateArticleFields(article, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to populate article fields: %w", err)
	}

	return article, nil
}

// validateCreateRequest validates article creation request
func (s *ArticleService) validateCreateRequest(req *model.ArticleCreateRequest) error {
	if strings.TrimSpace(req.Article.Title) == "" {
		return fmt.Errorf("title is required")
	}
	if strings.TrimSpace(req.Article.Description) == "" {
		return fmt.Errorf("description is required")
	}
	if strings.TrimSpace(req.Article.Body) == "" {
		return fmt.Errorf("body is required")
	}
	return nil
}