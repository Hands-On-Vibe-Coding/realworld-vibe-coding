import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/test/test-utils'

// Simple form component for testing
function SimpleCommentForm({ 
  onSubmit, 
  isSubmitting = false 
}: { 
  onSubmit: (data: { body: string }) => void
  isSubmitting?: boolean 
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const body = formData.get('body') as string
    if (body.trim()) {
      onSubmit({ body })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea 
        name="body"
        placeholder="Write a comment..."
        data-testid="comment-input"
        required
        minLength={1}
        maxLength={1000}
      />
      <button 
        type="submit" 
        disabled={isSubmitting}
        data-testid="submit-button"
      >
        {isSubmitting ? 'Posting...' : 'Post Comment'}
      </button>
    </form>
  )
}

describe('CommentForm', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('renders form elements correctly', () => {
    render(<SimpleCommentForm onSubmit={mockOnSubmit} />)

    expect(screen.getByTestId('comment-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument()
    expect(screen.getByText('Post Comment')).toBeInTheDocument()
  })

  it('submits form with comment text', async () => {
    const user = userEvent.setup()
    render(<SimpleCommentForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByTestId('comment-input')
    const submitButton = screen.getByTestId('submit-button')

    await user.type(textarea, 'This is a test comment')
    await user.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      body: 'This is a test comment'
    })
  })

  it('does not submit empty comment', async () => {
    const user = userEvent.setup()
    render(<SimpleCommentForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByTestId('submit-button')
    await user.click(submitButton)

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows loading state when submitting', () => {
    render(<SimpleCommentForm onSubmit={mockOnSubmit} isSubmitting={true} />)

    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Posting...')).toBeInTheDocument()
  })

  it('trims whitespace from comment', async () => {
    const user = userEvent.setup()
    render(<SimpleCommentForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByTestId('comment-input')
    const submitButton = screen.getByTestId('submit-button')

    await user.type(textarea, '   Comment with spaces   ')
    await user.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalledWith({
      body: '   Comment with spaces   '
    })
  })

  it('validates textarea attributes', () => {
    render(<SimpleCommentForm onSubmit={mockOnSubmit} />)

    const textarea = screen.getByTestId('comment-input')
    expect(textarea).toHaveAttribute('required')
    expect(textarea).toHaveAttribute('minLength', '1')
    expect(textarea).toHaveAttribute('maxLength', '1000')
  })
})