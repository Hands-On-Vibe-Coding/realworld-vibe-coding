import { describe, it, expect } from 'vitest'

// Test utility functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const dateString = '2023-12-25T00:00:00Z'
      const formatted = formatDate(dateString)
      expect(formatted).toBe('December 25, 2023')
    })

    it('handles different date formats', () => {
      const dateString = '2023-01-01T10:30:00Z'
      const formatted = formatDate(dateString)
      expect(formatted).toBe('January 1, 2023')
    })
  })

  describe('createSlug', () => {
    it('creates slug from title', () => {
      const title = 'This is a Test Article!'
      const slug = createSlug(title)
      expect(slug).toBe('this-is-a-test-article')
    })

    it('handles special characters', () => {
      const title = 'Hello, World! & Other Things'
      const slug = createSlug(title)
      expect(slug).toBe('hello-world-other-things')
    })

    it('handles empty string', () => {
      const slug = createSlug('')
      expect(slug).toBe('')
    })
  })

  describe('truncateText', () => {
    it('truncates long text', () => {
      const text = 'This is a very long text that should be truncated'
      const truncated = truncateText(text, 20)
      expect(truncated).toBe('This is a very long...')
    })

    it('returns original text if shorter than max length', () => {
      const text = 'Short text'
      const truncated = truncateText(text, 20)
      expect(truncated).toBe('Short text')
    })

    it('handles exact length', () => {
      const text = 'Exactly twenty chars'
      const truncated = truncateText(text, 20)
      expect(truncated).toBe('Exactly twenty chars')
    })
  })
})