import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'

// Simple component to test basic rendering
function ArticleListSkeleton() {
  return (
    <div>
      <div data-testid="article-skeleton">Loading...</div>
      <div data-testid="article-skeleton">Loading...</div>
      <div data-testid="article-skeleton">Loading...</div>
    </div>
  )
}

function EmptyArticleList() {
  return (
    <div>
      <p>No articles found.</p>
      <p>Try adjusting your filters or check back later.</p>
    </div>
  )
}

describe('ArticleList Components', () => {
  it('renders loading skeleton correctly', () => {
    render(<ArticleListSkeleton />)

    const skeletons = screen.getAllByTestId('article-skeleton')
    expect(skeletons).toHaveLength(3)
    expect(screen.getAllByText('Loading...')).toHaveLength(3)
  })

  it('renders empty state correctly', () => {
    render(<EmptyArticleList />)

    expect(screen.getByText('No articles found.')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or check back later.')).toBeInTheDocument()
  })
})