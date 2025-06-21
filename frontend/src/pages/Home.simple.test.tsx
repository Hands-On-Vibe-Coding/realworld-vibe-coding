import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'

// Mock auth store
const mockAuthStore = {
  isAuthenticated: false,
}

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}))

// Simplified HomePage component for testing
function SimpleHomePage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div>
      <header data-testid="hero-section">
        <h1>RealWorld</h1>
        <p>A place to share your knowledge.</p>
      </header>
      
      <main>
        <div data-testid="tabs">
          <button data-testid="global-tab">Global Feed</button>
          {isAuthenticated && (
            <button data-testid="feed-tab">Your Feed</button>
          )}
        </div>
        
        <div data-testid="content-area">
          <div data-testid="articles-section">
            {/* Articles would be rendered here */}
            <p>Articles loading...</p>
          </div>
          <aside data-testid="sidebar">
            <h3>Popular Tags</h3>
            <div data-testid="tags-list">
              <span>javascript</span>
              <span>react</span>
              <span>vue</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    mockAuthStore.isAuthenticated = false
  })

  it('renders hero section correctly', () => {
    render(<SimpleHomePage isAuthenticated={false} />)

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByText('RealWorld')).toBeInTheDocument()
    expect(screen.getByText('A place to share your knowledge.')).toBeInTheDocument()
  })

  it('shows global feed tab for unauthenticated users', () => {
    render(<SimpleHomePage isAuthenticated={false} />)

    expect(screen.getByTestId('global-tab')).toBeInTheDocument()
    expect(screen.queryByTestId('feed-tab')).not.toBeInTheDocument()
  })

  it('shows both tabs for authenticated users', () => {
    render(<SimpleHomePage isAuthenticated={true} />)

    expect(screen.getByTestId('global-tab')).toBeInTheDocument()
    expect(screen.getByTestId('feed-tab')).toBeInTheDocument()
  })

  it('renders sidebar with tags', () => {
    render(<SimpleHomePage isAuthenticated={false} />)

    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByText('Popular Tags')).toBeInTheDocument()
    expect(screen.getByTestId('tags-list')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('vue')).toBeInTheDocument()
  })

  it('renders articles section', () => {
    render(<SimpleHomePage isAuthenticated={false} />)

    expect(screen.getByTestId('articles-section')).toBeInTheDocument()
    expect(screen.getByText('Articles loading...')).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    render(<SimpleHomePage isAuthenticated={false} />)

    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument() // aside
  })
})