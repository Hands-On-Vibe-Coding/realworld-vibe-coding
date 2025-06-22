import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from './authStore'
import { createTestUser } from '@/test/fixtures'

// Mock the API
const mockApi = {
  setToken: vi.fn(),
  setTokenExpiredCallback: vi.fn(),
  getCurrentUser: vi.fn(),
}

vi.mock('@/lib/api', () => ({
  api: mockApi,
}))

// Mock Mantine notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}))

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuthStore())

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('logs in user successfully', () => {
    const { result } = renderHook(() => useAuthStore())
    const testUser = createTestUser()
    const testToken = 'test-jwt-token'

    act(() => {
      result.current.login(testUser, testToken)
    })

    expect(result.current.user).toEqual(testUser)
    expect(result.current.token).toBe(testToken)
    expect(result.current.isAuthenticated).toBe(true)
    expect(mockApi.setToken).toHaveBeenCalledWith(testToken)
    expect(mockApi.setTokenExpiredCallback).toHaveBeenCalled()
  })

  it('logs out user and clears state', () => {
    const { result } = renderHook(() => useAuthStore())
    const testUser = createTestUser()

    // First login
    act(() => {
      result.current.login(testUser, 'test-token')
    })

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(mockApi.setToken).toHaveBeenCalledWith(null)
  })

  it('updates user information', () => {
    const { result } = renderHook(() => useAuthStore())
    const originalUser = createTestUser({ username: 'original' })
    const updatedUser = createTestUser({ username: 'updated' })

    // Login first
    act(() => {
      result.current.login(originalUser, 'test-token')
    })

    // Update user
    act(() => {
      result.current.updateUser(updatedUser)
    })

    expect(result.current.user).toEqual(updatedUser)
    expect(result.current.isAuthenticated).toBe(true) // Should remain authenticated
  })

  it('sets token correctly', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setToken('new-token')
    })

    expect(result.current.token).toBe('new-token')
    expect(result.current.isAuthenticated).toBe(true)
    expect(mockApi.setToken).toHaveBeenCalledWith('new-token')
  })

  it('clears authentication when token is null', () => {
    const { result } = renderHook(() => useAuthStore())

    // First set a token
    act(() => {
      result.current.setToken('test-token')
    })

    // Then clear it
    act(() => {
      result.current.setToken(null)
    })

    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(mockApi.setToken).toHaveBeenCalledWith(null)
  })

  it('sets loading state', () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.setLoading(false)
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('initializes successfully with valid token', async () => {
    const { result } = renderHook(() => useAuthStore())
    const testUser = createTestUser()

    // Set up the store with a token
    act(() => {
      result.current.setToken('valid-token')
    })

    // Mock API response
    mockApi.getCurrentUser.mockResolvedValueOnce({ user: testUser })

    // Initialize
    await act(async () => {
      await result.current.initialize()
    })

    expect(result.current.user).toEqual(testUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(mockApi.getCurrentUser).toHaveBeenCalled()
  })

  it('logs out when initialization fails with invalid token', async () => {
    const { result } = renderHook(() => useAuthStore())

    // Set up the store with an invalid token
    act(() => {
      result.current.setToken('invalid-token')
    })

    // Mock API error
    mockApi.getCurrentUser.mockRejectedValueOnce(new Error('Invalid token'))

    // Initialize
    await act(async () => {
      await result.current.initialize()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('does not initialize when no token is present', async () => {
    const { result } = renderHook(() => useAuthStore())

    await act(async () => {
      await result.current.initialize()
    })

    expect(mockApi.getCurrentUser).not.toHaveBeenCalled()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})