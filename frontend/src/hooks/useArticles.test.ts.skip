import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useArticles, useFeed, useArticle } from './useArticles'
import { createTestQueryClient } from '@/test/test-utils'
import { createTestArticle, createTestArticles } from '@/test/fixtures'

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    getArticles: vi.fn(),
    getFeed: vi.fn(),
    getArticle: vi.fn(),
  },
}))

const mockApi = await import('@/lib/api')

// Mock auth store
const mockAuthStore = {
  isAuthenticated: false,
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useArticles', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('fetches articles successfully', async () => {
    const mockArticles = createTestArticles(3)
    mockApi.getArticles.mockResolvedValueOnce({
      articles: mockArticles,
      articlesCount: 3,
    })

    const { result } = renderHook(
      () => useArticles({ limit: 10, offset: 0 }),
      { wrapper: createWrapper(queryClient) }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.articles).toHaveLength(3)
    expect(result.current.data?.articlesCount).toBe(3)
    expect(mockApi.getArticles).toHaveBeenCalledWith({ limit: 10, offset: 0 })
  })

  it('handles API errors gracefully', async () => {
    mockApi.getArticles.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(
      () => useArticles({ limit: 10, offset: 0 }),
      { wrapper: createWrapper(queryClient) }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('uses correct query key with parameters', () => {
    const params = { limit: 5, offset: 10, tag: 'react' }
    
    renderHook(
      () => useArticles(params),
      { wrapper: createWrapper(queryClient) }
    )

    // Check that the query was called with the right parameters
    expect(mockApi.getArticles).toHaveBeenCalledWith(params)
  })
})

describe('useFeed', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('fetches feed when user is authenticated', async () => {
    mockAuthStore.isAuthenticated = true
    const mockFeedArticles = createTestArticles(2)
    mockApi.getFeed.mockResolvedValueOnce({
      articles: mockFeedArticles,
      articlesCount: 2,
    })

    const { result } = renderHook(
      () => useFeed({ limit: 10, offset: 0 }),
      { wrapper: createWrapper(queryClient) }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.articles).toHaveLength(2)
    expect(mockApi.getFeed).toHaveBeenCalledWith({ limit: 10, offset: 0 })
  })

  it('does not fetch feed when user is not authenticated', () => {
    mockAuthStore.isAuthenticated = false

    const { result } = renderHook(
      () => useFeed({ limit: 10, offset: 0 }),
      { wrapper: createWrapper(queryClient) }
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockApi.getFeed).not.toHaveBeenCalled()
  })
})

describe('useArticle', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = createTestQueryClient()
    vi.clearAllMocks()
  })

  it('fetches single article successfully', async () => {
    const mockArticle = createTestArticle({ slug: 'test-article' })
    mockApi.getArticle.mockResolvedValueOnce({
      article: mockArticle,
    })

    const { result } = renderHook(
      () => useArticle('test-article'),
      { wrapper: createWrapper(queryClient) }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data?.article.slug).toBe('test-article')
    expect(mockApi.getArticle).toHaveBeenCalledWith('test-article')
  })

  it('does not fetch when slug is undefined', () => {
    const { result } = renderHook(
      () => useArticle(undefined),
      { wrapper: createWrapper(queryClient) }
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockApi.getArticle).not.toHaveBeenCalled()
  })

  it('handles article not found error', async () => {
    mockApi.getArticle.mockRejectedValueOnce(new Error('Article not found'))

    const { result } = renderHook(
      () => useArticle('non-existent-article'),
      { wrapper: createWrapper(queryClient) }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error?.message).toBe('Article not found')
  })
})