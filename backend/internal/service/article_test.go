package service

import (
	"testing"

	"realworld-backend/internal/model"
	"realworld-backend/internal/repository"
	"realworld-backend/internal/testutil"
)

func TestArticleService_CreateArticle(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	// Setup repositories and services
	userRepo := repository.NewUserRepository(db)
	articleRepo := repository.NewArticleRepository(db)
	tagRepo := repository.NewTagRepository(db)
	favoriteRepo := repository.NewFavoriteRepository(db)
	
	articleService := NewArticleService(articleRepo, tagRepo, favoriteRepo, userRepo)

	// Create a test user first
	user := &model.User{
		Email:        "author@example.com",
		Username:     "author",
		PasswordHash: "hashed_password",
	}
	err := userRepo.Create(user)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	tests := []struct {
		name     string
		authorID int
		req      *model.ArticleCreateRequest
		wantErr  bool
		errMsg   string
	}{
		{
			name:     "successful article creation",
			authorID: user.ID,
			req: &model.ArticleCreateRequest{
				Article: struct {
					Title       string   `json:"title"`
					Description string   `json:"description"`
					Body        string   `json:"body"`
					TagList     []string `json:"tagList,omitempty"`
				}{
					Title:       "Test Article",
					Description: "This is a test article",
					Body:        "This is the body of the test article",
					TagList:     []string{"go", "testing"},
				},
			},
			wantErr: false,
		},
		{
			name:     "empty title",
			authorID: user.ID,
			req: &model.ArticleCreateRequest{
				Article: struct {
					Title       string   `json:"title"`
					Description string   `json:"description"`
					Body        string   `json:"body"`
					TagList     []string `json:"tagList,omitempty"`
				}{
					Title:       "",
					Description: "This is a test article",
					Body:        "This is the body of the test article",
					TagList:     []string{"go", "testing"},
				},
			},
			wantErr: true,
			errMsg:  "title is required",
		},
		{
			name:     "empty description",
			authorID: user.ID,
			req: &model.ArticleCreateRequest{
				Article: struct {
					Title       string   `json:"title"`
					Description string   `json:"description"`
					Body        string   `json:"body"`
					TagList     []string `json:"tagList,omitempty"`
				}{
					Title:       "Test Article",
					Description: "",
					Body:        "This is the body of the test article",
					TagList:     []string{"go", "testing"},
				},
			},
			wantErr: true,
			errMsg:  "description is required",
		},
		{
			name:     "empty body",
			authorID: user.ID,
			req: &model.ArticleCreateRequest{
				Article: struct {
					Title       string   `json:"title"`
					Description string   `json:"description"`
					Body        string   `json:"body"`
					TagList     []string `json:"tagList,omitempty"`
				}{
					Title:       "Test Article",
					Description: "This is a test article",
					Body:        "",
					TagList:     []string{"go", "testing"},
				},
			},
			wantErr: true,
			errMsg:  "body is required",
		},
		{
			name:     "invalid author",
			authorID: 999,
			req: &model.ArticleCreateRequest{
				Article: struct {
					Title       string   `json:"title"`
					Description string   `json:"description"`
					Body        string   `json:"body"`
					TagList     []string `json:"tagList,omitempty"`
				}{
					Title:       "Test Article",
					Description: "This is a test article",
					Body:        "This is the body of the test article",
					TagList:     []string{"go", "testing"},
				},
			},
			wantErr: true,
			errMsg:  "failed to populate article fields: failed to get article author: user not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			article, err := articleService.CreateArticle(tt.authorID, tt.req)
			if tt.wantErr {
				if err == nil {
					t.Errorf("ArticleService.CreateArticle() expected error but got nil")
					return
				}
				if err.Error() != tt.errMsg {
					t.Errorf("ArticleService.CreateArticle() error = %v, wantErr %v", err, tt.errMsg)
				}
				return
			}

			if err != nil {
				t.Errorf("ArticleService.CreateArticle() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if article == nil {
				t.Errorf("ArticleService.CreateArticle() returned nil article")
				return
			}

			if article.Title != tt.req.Article.Title {
				t.Errorf("ArticleService.CreateArticle() title = %v, want %v", article.Title, tt.req.Article.Title)
			}

			if article.Description != tt.req.Article.Description {
				t.Errorf("ArticleService.CreateArticle() description = %v, want %v", article.Description, tt.req.Article.Description)
			}

			if article.Body != tt.req.Article.Body {
				t.Errorf("ArticleService.CreateArticle() body = %v, want %v", article.Body, tt.req.Article.Body)
			}

			if article.Slug == "" {
				t.Errorf("ArticleService.CreateArticle() slug is empty")
			}

			if article.AuthorID != tt.authorID {
				t.Errorf("ArticleService.CreateArticle() authorID = %v, want %v", article.AuthorID, tt.authorID)
			}
		})
	}
}

func TestArticleService_GetArticles(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	// Setup repositories and services
	userRepo := repository.NewUserRepository(db)
	articleRepo := repository.NewArticleRepository(db)
	tagRepo := repository.NewTagRepository(db)
	favoriteRepo := repository.NewFavoriteRepository(db)
	
	articleService := NewArticleService(articleRepo, tagRepo, favoriteRepo, userRepo)

	// Create test user
	user := &model.User{
		Email:        "author@example.com",
		Username:     "author",
		PasswordHash: "hashed_password",
	}
	err := userRepo.Create(user)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	// Create test articles
	req1 := &model.ArticleCreateRequest{}
	req1.Article.Title = "Article 1"
	req1.Article.Description = "Description 1"
	req1.Article.Body = "Body 1"
	req1.Article.TagList = []string{"tag1"}
	
	req2 := &model.ArticleCreateRequest{}
	req2.Article.Title = "Article 2"
	req2.Article.Description = "Description 2"
	req2.Article.Body = "Body 2"
	req2.Article.TagList = []string{"tag2"}

	_, err = articleService.CreateArticle(user.ID, req1)
	if err != nil {
		t.Fatalf("Failed to create test article 1: %v", err)
	}
	
	_, err = articleService.CreateArticle(user.ID, req2)
	if err != nil {
		t.Fatalf("Failed to create test article 2: %v", err)
	}

	tests := []struct {
		name          string
		filter        *model.ArticleFilter
		wantCount     int
		wantTotalCount int
		wantErr       bool
	}{
		{
			name: "get all articles",
			filter: &model.ArticleFilter{
				Limit:  10,
				Offset: 0,
			},
			wantCount:     2,
			wantTotalCount: 2,
			wantErr:       false,
		},
		{
			name: "get articles with limit",
			filter: &model.ArticleFilter{
				Limit:  1,
				Offset: 0,
			},
			wantCount:     1,
			wantTotalCount: 2, // Total should still be 2
			wantErr:       false,
		},
		{
			name: "get articles with offset",
			filter: &model.ArticleFilter{
				Limit:  10,
				Offset: 1,
			},
			wantCount:     1,
			wantTotalCount: 2, // Total should still be 2
			wantErr:       false,
		},
		{
			name: "filter by author",
			filter: &model.ArticleFilter{
				Author: "author",
				Limit:  10,
				Offset: 0,
			},
			wantCount:     2,
			wantTotalCount: 2,
			wantErr:       false,
		},
		{
			name: "filter by non-existent author",
			filter: &model.ArticleFilter{
				Author: "nonexistent",
				Limit:  10,
				Offset: 0,
			},
			wantCount:     0,
			wantTotalCount: 0,
			wantErr:       false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			articles, totalCount, err := articleService.ListArticles(*tt.filter, 0) // 0 for no user context
			if tt.wantErr {
				if err == nil {
					t.Errorf("ArticleService.GetArticles() expected error but got nil")
				}
				return
			}

			if err != nil {
				t.Errorf("ArticleService.GetArticles() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if len(articles) != tt.wantCount {
				t.Errorf("ArticleService.ListArticles() count = %v, want %v", len(articles), tt.wantCount)
			}

			if totalCount != tt.wantTotalCount {
				t.Errorf("ArticleService.ListArticles() total count = %v, want %v", totalCount, tt.wantTotalCount)
			}
		})
	}
}

func TestArticleService_GetArticleBySlug(t *testing.T) {
	testutil.SetTestEnv()
	defer testutil.ResetTestEnv()

	db := testutil.TestDB(t)
	defer testutil.CleanupDB(db)

	// Setup repositories and services
	userRepo := repository.NewUserRepository(db)
	articleRepo := repository.NewArticleRepository(db)
	tagRepo := repository.NewTagRepository(db)
	favoriteRepo := repository.NewFavoriteRepository(db)
	
	articleService := NewArticleService(articleRepo, tagRepo, favoriteRepo, userRepo)

	// Create test user
	user := &model.User{
		Email:        "author@example.com",
		Username:     "author",
		PasswordHash: "hashed_password",
	}
	err := userRepo.Create(user)
	if err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	// Create test article
	articleReq := &model.ArticleCreateRequest{}
	articleReq.Article.Title = "Test Article"
	articleReq.Article.Description = "Test Description"
	articleReq.Article.Body = "Test Body"
	articleReq.Article.TagList = []string{"go", "testing"}

	createdArticle, err := articleService.CreateArticle(user.ID, articleReq)
	if err != nil {
		t.Fatalf("Failed to create test article: %v", err)
	}

	tests := []struct {
		name    string
		slug    string
		wantErr bool
		errMsg  string
	}{
		{
			name:    "existing article",
			slug:    createdArticle.Slug,
			wantErr: false,
		},
		{
			name:    "non-existent article",
			slug:    "non-existent-slug",
			wantErr: true,
			errMsg:  "article not found",
		},
		{
			name:    "empty slug",
			slug:    "",
			wantErr: true,
			errMsg:  "article not found",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			article, err := articleService.GetArticleBySlug(tt.slug, 0) // 0 for no user context
			if tt.wantErr {
				if err == nil {
					t.Errorf("ArticleService.GetArticleBySlug() expected error but got nil")
					return
				}
				if err.Error() != tt.errMsg {
					t.Errorf("ArticleService.GetArticleBySlug() error = %v, wantErr %v", err, tt.errMsg)
				}
				return
			}

			if err != nil {
				t.Errorf("ArticleService.GetArticleBySlug() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if article == nil {
				t.Errorf("ArticleService.GetArticleBySlug() returned nil article")
				return
			}

			if article.Slug != tt.slug {
				t.Errorf("ArticleService.GetArticleBySlug() slug = %v, want %v", article.Slug, tt.slug)
			}

			if article.Title != createdArticle.Title {
				t.Errorf("ArticleService.GetArticleBySlug() title = %v, want %v", article.Title, createdArticle.Title)
			}
		})
	}
}