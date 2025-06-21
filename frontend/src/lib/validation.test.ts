import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Example validation schemas
const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  body: z.string().min(1, 'Body is required'),
  tagList: z.array(z.string()).optional(),
})

const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
})

describe('Validation Schemas', () => {
  describe('userRegistrationSchema', () => {
    it('validates correct user data', () => {
      const validData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      const result = userRegistrationSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validData)
      }
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      }

      const result = userRegistrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })

    it('rejects short username', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'ab',
        password: 'password123',
      }

      const result = userRegistrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Username must be at least 3 characters')
      }
    })

    it('rejects short password', () => {
      const invalidData = {
        email: 'test@example.com',
        username: 'testuser',
        password: '123',
      }

      const result = userRegistrationSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters')
      }
    })
  })

  describe('articleSchema', () => {
    it('validates correct article data', () => {
      const validData = {
        title: 'Test Article',
        description: 'This is a test article',
        body: 'This is the body of the article',
        tagList: ['test', 'article'],
      }

      const result = articleSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty title', () => {
      const invalidData = {
        title: '',
        description: 'Description',
        body: 'Body',
      }

      const result = articleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('rejects long title', () => {
      const invalidData = {
        title: 'a'.repeat(101),
        description: 'Description',
        body: 'Body',
      }

      const result = articleSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title too long')
      }
    })

    it('handles optional tagList', () => {
      const dataWithoutTags = {
        title: 'Test Article',
        description: 'Description',
        body: 'Body',
      }

      const result = articleSchema.safeParse(dataWithoutTags)
      expect(result.success).toBe(true)
    })
  })

  describe('commentSchema', () => {
    it('validates correct comment', () => {
      const validData = {
        body: 'This is a valid comment',
      }

      const result = commentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects empty comment', () => {
      const invalidData = {
        body: '',
      }

      const result = commentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Comment cannot be empty')
      }
    })

    it('rejects long comment', () => {
      const invalidData = {
        body: 'a'.repeat(1001),
      }

      const result = commentSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Comment is too long')
      }
    })

    it('accepts comment at max length', () => {
      const validData = {
        body: 'a'.repeat(1000),
      }

      const result = commentSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})