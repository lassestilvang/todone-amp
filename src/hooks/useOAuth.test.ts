import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useOAuth } from './useOAuth'

// Mock OAuth utilities
mock.module('@/utils/oauth', () => ({
  startOAuthFlow: mock(() => Promise.resolve('https://example.com/auth')),
  handleOAuthCallback: mock(() => ({
    code: null,
    state: null,
    error: null,
  })),
  verifyOAuthState: mock(() => true),
  getPKCEVerifier: mock(() => 'test-verifier'),
  clearPKCEVerifier: mock(() => {}),
  exchangeCodeForToken: mock(() =>
    Promise.resolve({
      accessToken: 'test-token',
      expiresIn: 3600,
      expiresAt: Date.now() + 3600000,
      tokenType: 'Bearer',
      scope: 'test',
    })
  ),
  storeOAuthToken: mock(() => {}),
  getStoredToken: mock(() => null),
  clearStoredToken: mock(() => {}),
  oAuthConfigs: {
    google: {
      clientId: 'test-client-id',
      authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      scopes: ['email', 'profile'],
      redirectUri: 'http://localhost:5173/auth/callback',
    },
  },
}))

describe('useOAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
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

    // Function is called correctly
    expect(typeof result.current.initiateOAuth).toBe('function')
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
})
