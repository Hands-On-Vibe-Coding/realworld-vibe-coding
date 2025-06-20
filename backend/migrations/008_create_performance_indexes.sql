-- Performance indexes for article listing queries

-- Index for articles ordering by created_at (most recent first)
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Index for author filtering
CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);

-- Composite index for article_tags junction table
CREATE INDEX IF NOT EXISTS idx_article_tags_article_tag ON article_tags(article_id, tag_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag_article ON article_tags(tag_id, article_id);

-- Index for tags by name
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Index for users by username (for author filtering)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Index for follows table (for feed queries)
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id);

-- Index for favorites table
CREATE INDEX IF NOT EXISTS idx_favorites_user_article ON favorites(user_id, article_id);
CREATE INDEX IF NOT EXISTS idx_favorites_article ON favorites(article_id);

-- Index for article slug (unique constraint should already create this, but explicit)
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_articles_author_created ON articles(author_id, created_at DESC);

-- Index for full-text search on articles (if needed in future)
-- CREATE INDEX IF NOT EXISTS idx_articles_title_description ON articles(title, description);

-- Stats
ANALYZE articles;
ANALYZE article_tags;
ANALYZE tags;
ANALYZE users;
ANALYZE follows;
ANALYZE favorites;