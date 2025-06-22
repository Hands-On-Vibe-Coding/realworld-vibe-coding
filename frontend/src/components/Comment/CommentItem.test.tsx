import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'
import { CommentItem } from './CommentItem'
import { createTestComment } from '@/test/fixtures'

// Mock the auth store
const mockAuthStore = {
  user: null as any,
  isAuthenticated: false,
}

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Mock mantine modals
vi.mock('@mantine/modals', () => ({
  modals: {
    openConfirmModal: vi.fn(),
  },
}))

describe('CommentItem', () => {
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    mockOnDelete.mockClear()
    mockAuthStore.user = null
    mockAuthStore.isAuthenticated = false
  })

  it('renders comment information correctly', () => {
    const comment = createTestComment({
      body: 'This is a test comment body',
      author: {
        username: 'comment-author',
        bio: 'Author bio',
        image: 'https://example.com/author.jpg',
        following: false,
      },
      createdAt: '2023-12-25T10:30:00Z',
    })

    render(
      <CommentItem 
        comment={comment} 
        onDelete={mockOnDelete} 
      />
    )

    expect(screen.getByText('This is a test comment body')).toBeInTheDocument()
    expect(screen.getByText('comment-author')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/author.jpg')
  })

  it('shows delete button when user is comment author', () => {
    mockAuthStore.user = { username: 'comment-author' }
    mockAuthStore.isAuthenticated = true

    const comment = createTestComment({
      author: {
        username: 'comment-author',
        bio: 'Author bio',
        image: 'https://example.com/author.jpg',
        following: false,
      },
    })

    render(
      <CommentItem 
        comment={comment} 
        onDelete={mockOnDelete} 
      />
    )

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('hides delete button when user is not comment author', () => {
    mockAuthStore.user = { username: 'different-user' }
    mockAuthStore.isAuthenticated = true

    const comment = createTestComment({
      author: {
        username: 'comment-author',
        bio: 'Author bio',
        image: 'https://example.com/author.jpg',
        following: false,
      },
    })

    render(
      <CommentItem 
        comment={comment} 
        onDelete={mockOnDelete} 
      />
    )

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('hides delete button when user is not authenticated', () => {
    const comment = createTestComment()

    render(
      <CommentItem 
        comment={comment} 
        onDelete={mockOnDelete} 
      />
    )

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows loading state on delete button', () => {
    mockAuthStore.user = { username: 'comment-author' }
    mockAuthStore.isAuthenticated = true

    const comment = createTestComment({
      author: {
        username: 'comment-author',
        bio: 'Author bio',
        image: 'https://example.com/author.jpg',
        following: false,
      },
    })

    render(
      <CommentItem 
        comment={comment} 
        onDelete={mockOnDelete} 
        isDeleting={true}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    expect(deleteButton).toBeDisabled()
  })

  it('displays relative time correctly', () => {
    const comment = createTestComment({
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    })

    render(
      <CommentItem 
        comment={comment} 
        onDelete={mockOnDelete} 
      />
    )

    expect(screen.getByText(/ago/)).toBeInTheDocument()
  })

  it('handles missing author image gracefully', () => {
    const comment = createTestComment({
      author: {
        username: 'no-image-author',
        bio: 'Bio',
        image: '',
        following: false,
      },
    })

    render(
      <CommentItem 
        comment={comment} 
        onDelete={mockOnDelete} 
      />
    )

    expect(screen.getByText('no-image-author')).toBeInTheDocument()
    // When no image is provided, Mantine Avatar shows a placeholder
    expect(screen.getByTitle('no-image-author')).toBeInTheDocument()
  })
})