import type { Article, Profile, Comment, UserResponse } from '@/types'

export const createTestProfile = (overrides: Partial<Profile> = {}): Profile => ({
  username: 'testuser',
  bio: 'Test bio',
  image: 'https://example.com/avatar.jpg',
  following: false,
  ...overrides,
})

export const createTestArticle = (overrides: Partial<Article> = {}): Article => ({
  id: 1,
  slug: 'test-article',
  title: 'Test Article',
  description: 'This is a test article',
  body: 'This is the body of the test article',
  tagList: ['test', 'article'],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  favorited: false,
  favoritesCount: 0,
  author: createTestProfile(),
  ...overrides,
})

export const createTestComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 1,
  body: 'This is a test comment',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  author: createTestProfile(),
  ...overrides,
})

export const createTestUser = (overrides: Partial<UserResponse> = {}): UserResponse => ({
  email: 'test@example.com',
  token: 'test-token',
  username: 'testuser',
  bio: 'Test bio',
  image: 'https://example.com/avatar.jpg',
  ...overrides,
})

export const createTestArticles = (count: number = 3): Article[] =>
  Array.from({ length: count }, (_, index) =>
    createTestArticle({
      id: index + 1,
      slug: `test-article-${index + 1}`,
      title: `Test Article ${index + 1}`,
    })
  )