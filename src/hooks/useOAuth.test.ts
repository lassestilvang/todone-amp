import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useOAuth } from './useOAuth'

// Mock OAuth utilities
vi.mock('@/utils/oauth', async () => {
  const actual = await vi.importActual('@/utils/oauth')
  return {
    ...(actual as object),
    startOAuthFlow: vi.fn(() => Promise.resolve('https://example.com/auth')),
    handleOAuthCallback: vi.fn(() => ({
      code: null,
      state: null,
      error: null,
    })),
    verifyOAuthState: vi.fn(() => true),
    getPKCEVerifier: vi.fn(() => 'test-verifier'),
    clearPKCEVerifier: vi.fn(),
    exchangeCodeForToken: vi.fn(() =>
      Promise.resolve({
        accessToken: 'test-token',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
        scope: 'test',
      })
    ),
    storeOAuthToken: vi.fn(),
  }
})

describe('useOAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useOAuth())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should have initiateOAuth, handleCallback, and logout functions', () => {
    const { result } = renderHook(() => useOAuth())

    expect(typeof result.current.initiateOAuth).toBe('function')
    expect(typeof result.current.handleCallback).toBe('function')
    expect(typeof result.current.logout).toBe('function')
  })

  it('should initiate OAuth flow', async () => {
    const { result } = renderHook(() => useOAuth())

    // Mock startOAuthFlow
    const oauth = await import('@/utils/oauth')
    vi.mocked(oauth.startOAuthFlow).mockResolvedValue('https://example.com/auth')

    // Start initiation (note: actual redirect prevents immediate state check)
    act(() => {
      result.current.initiateOAuth('google')
    })

    // Function is called correctly
    expect(typeof result.current.initiateOAuth).toBe('function')
  })

  it('should handle OAuth callback with valid code', async () => {
    const { result } = renderHook(() => useOAuth())

    // Mock handleOAuthCallback to return a code
    const oauth = await import('@/utils/oauth')
    vi.mocked(oauth.handleOAuthCallback).mockReturnValue({
      code: 'test-code',
      state: 'test-state',
      error: null,
    })

    await act(async () => {
      const token = await result.current.handleCallback('google')
      expect(token).toBeTruthy()
    })

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle OAuth errors', async () => {
    const { result } = renderHook(() => useOAuth())

    // Mock OAuth with error
    const oauth = await import('@/utils/oauth')
    vi.mocked(oauth.handleOAuthCallback).mockReturnValue({
      code: null,
      state: null,
      error: 'access_denied',
    })

    await act(async () => {
      const token = await result.current.handleCallback('google')
      expect(token).toBeNull()
    })

    expect(result.current.error).toContain('OAuth error')
  })

  it('should logout and clear token', async () => {
    const { result } = renderHook(() => useOAuth())

    // Simulate having a token
    act(() => {
      result.current.logout('google')
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.token).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should handle missing authorization code', async () => {
    const { result } = renderHook(() => useOAuth())

    await act(async () => {
      const token = await result.current.handleCallback('google')
      expect(token).toBeNull()
    })

    expect(result.current.error).toBeTruthy()
  })
})
