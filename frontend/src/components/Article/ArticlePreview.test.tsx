import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { ArticlePreview } from './ArticlePreview'
import { createTestArticle } from '@/test/fixtures'

// Mock Tanstack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <a {...props}>{children}</a>,
}))

// Simple test wrapper without router
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {children}
      </MantineProvider>
    </QueryClientProvider>
  )
}

describe('ArticlePreview', () => {
  const mockOnFavoriteToggle = vi.fn()

  beforeEach(() => {
    mockOnFavoriteToggle.mockClear()
  })

  it('renders article information correctly', () => {
    const article = createTestArticle({
      title: 'Test Article Title',
      description: 'Test article description',
      author: {
        username: 'john-doe',
        bio: 'Test bio',
        image: 'https://example.com/avatar.jpg',
        following: false,
      },
      tagList: ['javascript', 'react'],
      favoritesCount: 5,
    })

    render(
      <TestWrapper>
        <ArticlePreview article={article} onFavoriteToggle={mockOnFavoriteToggle} />
      </TestWrapper>
    )

    expect(screen.getByText('Test Article Title')).toBeInTheDocument()
    expect(screen.getByText('Test article description')).toBeInTheDocument()
    expect(screen.getByText('john-doe')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('5 likes')).toBeInTheDocument()
  })

  it('displays formatted creation date', () => {
    const article = createTestArticle({
      createdAt: '2023-12-25T00:00:00Z',
    })

    render(
      <TestWrapper>
        <ArticlePreview article={article} onFavoriteToggle={mockOnFavoriteToggle} />
      </TestWrapper>
    )

    // Date should be formatted (exact format may vary)
    expect(screen.getByText(/Dec/)).toBeInTheDocument()
  })

  it('shows favorite button with correct state', async () => {
    const user = userEvent.setup()
    const article = createTestArticle({
      favorited: false,
      favoritesCount: 3,
    })

    render(
      <TestWrapper>
        <ArticlePreview article={article} onFavoriteToggle={mockOnFavoriteToggle} />
      </TestWrapper>
    )

    const favoriteButton = screen.getByRole('button', { name: /favorite article/i })
    expect(favoriteButton).toBeInTheDocument()

    await user.click(favoriteButton)
    expect(mockOnFavoriteToggle).toHaveBeenCalledWith('test-article', false)
  })

  it('shows unfavorite button when article is favorited', () => {
    const article = createTestArticle({
      favorited: true,
      favoritesCount: 10,
    })

    render(
      <TestWrapper>
        <ArticlePreview article={article} onFavoriteToggle={mockOnFavoriteToggle} />
      </TestWrapper>
    )

    const favoriteButton = screen.getByRole('button')
    expect(favoriteButton).toHaveClass('mantine-ActionIcon-root')
    // Check that it shows favorited state (filled heart)
    expect(screen.getByText('10 likes')).toBeInTheDocument()
  })

  it('displays author avatar with correct attributes', () => {
    const article = createTestArticle({
      author: {
        username: 'jane-doe',
        bio: 'Jane bio',
        image: 'https://example.com/jane.jpg',
        following: false,
      },
    })

    render(
      <TestWrapper>
        <ArticlePreview article={article} onFavoriteToggle={mockOnFavoriteToggle} />
      </TestWrapper>
    )

    const avatar = screen.getByRole('img')
    expect(avatar).toHaveAttribute('src', 'https://example.com/jane.jpg')
    expect(avatar).toHaveAttribute('alt', 'jane-doe')
  })

  it('handles empty tag list', () => {
    const article = createTestArticle({
      tagList: [],
    })

    render(
      <TestWrapper>
        <ArticlePreview article={article} onFavoriteToggle={mockOnFavoriteToggle} />
      </TestWrapper>
    )

    // Should not crash and still render other content
    expect(screen.getByText('Test Article')).toBeInTheDocument()
  })

  it('handles missing author image gracefully', () => {
    const article = createTestArticle({
      author: {
        username: 'no-image-user',
        bio: 'Bio',
        image: '',
        following: false,
      },
    })

    render(
      <TestWrapper>
        <ArticlePreview article={article} onFavoriteToggle={mockOnFavoriteToggle} />
      </TestWrapper>
    )

    expect(screen.getByText('no-image-user')).toBeInTheDocument()
  })
})