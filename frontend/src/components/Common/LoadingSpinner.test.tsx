import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/test-utils'

// Simple loading spinner component
function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div 
      data-testid="loading-spinner"
      data-size={size}
      style={{ 
        width: size === 'sm' ? 16 : size === 'md' ? 24 : 32,
        height: size === 'sm' ? 16 : size === 'md' ? 24 : 32,
        border: '2px solid #ccc',
        borderTop: '2px solid #333',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  )
}

// Error boundary component
function ErrorMessage({ 
  title = 'Error', 
  message = 'Something went wrong'
}: { 
  title?: string
  message?: string 
}) {
  return (
    <div role="alert" data-testid="error-message">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}

describe('Common Components', () => {
  describe('LoadingSpinner', () => {
    it('renders with default props', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveAttribute('data-size', 'md')
    })

    it('renders with custom size', () => {
      render(<LoadingSpinner size="lg" />)
      
      const spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveAttribute('data-size', 'lg')
    })

    it('applies correct styling for different sizes', () => {
      const { rerender } = render(<LoadingSpinner size="sm" />)
      let spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveStyle({ width: '16px', height: '16px' })

      rerender(<LoadingSpinner size="lg" />)
      spinner = screen.getByTestId('loading-spinner')
      expect(spinner).toHaveStyle({ width: '32px', height: '32px' })
    })
  })

  describe('ErrorMessage', () => {
    it('renders with default props', () => {
      render(<ErrorMessage />)
      
      expect(screen.getByText('Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('renders with custom props', () => {
      render(
        <ErrorMessage 
          title="Custom Error" 
          message="This is a custom error message" 
        />
      )
      
      expect(screen.getByText('Custom Error')).toBeInTheDocument()
      expect(screen.getByText('This is a custom error message')).toBeInTheDocument()
    })

    it('has correct accessibility attributes', () => {
      render(<ErrorMessage />)
      
      const errorElement = screen.getByTestId('error-message')
      expect(errorElement).toHaveAttribute('role', 'alert')
    })
  })
})