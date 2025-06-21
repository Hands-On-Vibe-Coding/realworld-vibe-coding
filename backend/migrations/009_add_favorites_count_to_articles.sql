-- Add favorites_count column to articles table
-- Migration: 009_add_favorites_count_to_articles.sql

ALTER TABLE articles ADD COLUMN favorites_count INTEGER DEFAULT 0 NOT NULL;

-- Create index for favorites_count for performance
CREATE INDEX IF NOT EXISTS idx_articles_favorites_count ON articles(favorites_count DESC);