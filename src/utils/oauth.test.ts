import { describe, it, expect, beforeEach, mock } from 'bun:test'
import {
  generatePKCEChallenge,
  storePKCEVerifier,
  getPKCEVerifier,
  clearPKCEVerifier,
  buildAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  revokeToken,
  isTokenExpired,
  storeOAuthToken,
  getStoredOAuthToken,
  clearStoredOAuthToken,
  handleOAuthCallback,
  verifyOAuthState,
  OAuthProviders,
  getValidToken,
  type OAuthToken,
  type OAuthProvider,
} from './oauth'

describe('OAuth Utilities', () => {
  beforeEach(() => {
    sessionStorage.clear()
    localStorage.clear()
    // Bun auto-clears mocks
  })

  describe('generatePKCEChallenge', () => {
    it('should generate valid PKCE challenge pair', async () => {
      const { codeVerifier, codeChallenge } = await generatePKCEChallenge()

      expect(codeVerifier).toBeTruthy()
      expect(codeChallenge).toBeTruthy()
      expect(codeVerifier.length).toBe(128)
      expect(codeChallenge.length).toBeGreaterThan(0)
    })

    it('should generate different pairs on each call', async () => {
      const pair1 = await generatePKCEChallenge()
      const pair2 = await generatePKCEChallenge()

      expect(pair1.codeVerifier).not.toBe(pair2.codeVerifier)
      expect(pair1.codeChallenge).not.toBe(pair2.codeChallenge)
    })
  })

  describe('PKCE Verifier Storage', () => {
    it('should store and retrieve PKCE verifier', () => {
      const verifier = 'test-verifier-123'
      storePKCEVerifier(verifier, 'google')

      const retrieved = getPKCEVerifier('google')
      expect(retrieved).toBe(verifier)
    })

    it('should clear PKCE verifier', () => {
      storePKCEVerifier('test-verifier', 'google')
      clearPKCEVerifier('google')

      const retrieved = getPKCEVerifier('google')
      expect(retrieved).toBeNull()
    })

    it('should handle different providers separately', () => {
      storePKCEVerifier('google-verifier', 'google')
      storePKCEVerifier('outlook-verifier', 'outlook')

      expect(getPKCEVerifier('google')).toBe('google-verifier')
      expect(getPKCEVerifier('outlook')).toBe('outlook-verifier')
    })
  })

  describe('buildAuthorizationUrl', () => {
    it('should build valid authorization URL', () => {
      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      const url = buildAuthorizationUrl(provider, 'test-state', 'test-challenge')

      expect(url).toContain('client_id=')
      expect(url).toContain('redirect_uri=')
      expect(url).toContain('response_type=code')
      expect(url).toContain('scope=')
      expect(url).toContain('state=test-state')
      expect(url).toContain('code_challenge=test-challenge')
      expect(url).toContain('code_challenge_method=S256')
    })

    it('should include proper scopes', () => {
      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      const url = buildAuthorizationUrl(provider, 'state', 'challenge')
      expect(url).toContain('scope=')
    })
  })

  describe('Token Exchange', () => {
    it('should handle successful token exchange', async () => {
      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      // @ts-expect-error - Bun fetch mock
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: 'test-access-token',
              refresh_token: 'test-refresh-token',
              expires_in: 3600,
              token_type: 'Bearer',
              scope: 'calendar.readonly',
            }),
        } as Response)
      )

      const token = await exchangeCodeForToken(provider, 'test-code', 'test-verifier')

      expect(token.accessToken).toBe('test-access-token')
      expect(token.refreshToken).toBe('test-refresh-token')
      expect(token.expiresIn).toBe(3600)
      expect(token.tokenType).toBe('Bearer')
    })

    it('should handle token exchange error', async () => {
      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      // @ts-expect-error - Bun fetch mock
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              error: 'invalid_grant',
              error_description: 'The provided authorization code is invalid.',
            }),
        } as Response)
      )

      await expect(exchangeCodeForToken(provider, 'bad-code', 'verifier')).rejects.toThrow(
        'OAuth token exchange failed'
      )
    })
  })

  describe('Token Refresh', () => {
    it('should refresh access token', async () => {
      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      // @ts-expect-error - Bun fetch mock
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: 'new-access-token',
              refresh_token: 'new-refresh-token',
              expires_in: 3600,
              token_type: 'Bearer',
              scope: 'calendar.readonly',
            }),
        } as Response)
      )

      const token = await refreshAccessToken(provider, 'old-refresh-token')

      expect(token.accessToken).toBe('new-access-token')
      expect(token.refreshToken).toBe('new-refresh-token')
    })

    it('should throw on refresh failure', async () => {
      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      // @ts-expect-error - Bun fetch mock
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
        } as Response)
      )

      await expect(refreshAccessToken(provider, 'invalid-token')).rejects.toThrow(
        'Failed to refresh access token'
      )
    })
  })

  describe('Token Revocation', () => {
    it('should revoke token successfully', async () => {
      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      // @ts-expect-error - Bun fetch mock
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
        } as Response)
      )

      const result = await revokeToken(provider, 'test-token')
      expect(result).toBe(true)
    })

    it('should return false if no revoke endpoint', async () => {
      const provider: OAuthProvider = {
        name: 'google',
        config: {
          ...OAuthProviders.google,
          revokeEndpoint: undefined,
        },
      }

      const result = await revokeToken(provider, 'test-token')
      expect(result).toBe(false)
    })
  })

  describe('Token Expiry Check', () => {
    it('should detect expired token', () => {
      const expiredToken: OAuthToken = {
        accessToken: 'test',
        expiresIn: 3600,
        expiresAt: Date.now() - 1000, // expired 1 second ago
        tokenType: 'Bearer',
        scope: 'test',
      }

      expect(isTokenExpired(expiredToken)).toBe(true)
    })

    it('should detect valid token', () => {
      const validToken: OAuthToken = {
        accessToken: 'test',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000, // expires in 1 hour
        tokenType: 'Bearer',
        scope: 'test',
      }

      expect(isTokenExpired(validToken)).toBe(false)
    })
  })

  describe('OAuth Token Storage', () => {
    it('should store OAuth token', () => {
      const token: OAuthToken = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
        scope: 'test',
      }

      storeOAuthToken('google', token)
      const retrieved = getStoredOAuthToken('google')

      expect(retrieved).toEqual(token)
    })

    it('should clear stored token', () => {
      const token: OAuthToken = {
        accessToken: 'test-token',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000,
        tokenType: 'Bearer',
        scope: 'test',
      }

      storeOAuthToken('google', token)
      clearStoredOAuthToken('google')

      const retrieved = getStoredOAuthToken('google')
      expect(retrieved).toBeNull()
    })

    it('should return null if no token stored', () => {
      const token = getStoredOAuthToken('nonexistent')
      expect(token).toBeNull()
    })
  })

  describe('OAuth Callback Handling', () => {
    it('should extract code from callback URL', () => {
      // Set location search directly for happy-dom compatibility
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search: '?code=test-code&state=test-state' },
        writable: true,
      })

      const { code, state, error } = handleOAuthCallback()

      expect(code).toBe('test-code')
      expect(state).toBe('test-state')
      expect(error).toBeNull()
    })

    it('should extract error from callback URL', () => {
      Object.defineProperty(window, 'location', {
        value: { ...window.location, search: '?error=access_denied' },
        writable: true,
      })

      const { code, state, error } = handleOAuthCallback()

      expect(code).toBeNull()
      expect(state).toBeNull()
      expect(error).toBe('access_denied')
    })
  })

  describe('OAuth State Verification', () => {
    it('should verify matching state', () => {
      const state = 'test-state-123'
      sessionStorage.setItem('oauth_state_google', state)

      const isValid = verifyOAuthState('google', state)

      expect(isValid).toBe(true)
      // State should be cleared after verification
      expect(sessionStorage.getItem('oauth_state_google')).toBeNull()
    })

    it('should reject mismatched state', () => {
      sessionStorage.setItem('oauth_state_google', 'expected-state')

      const isValid = verifyOAuthState('google', 'different-state')

      expect(isValid).toBe(false)
    })

    it('should reject if no state stored', () => {
      const isValid = verifyOAuthState('google', 'any-state')

      expect(isValid).toBe(false)
    })

    it('should reject if returned state is null', () => {
      sessionStorage.setItem('oauth_state_google', 'test-state')

      const isValid = verifyOAuthState('google', null)

      expect(isValid).toBe(false)
    })
  })

  describe('Get Valid Token', () => {
    it('should return valid token without refreshing', async () => {
      const token: OAuthToken = {
        accessToken: 'test-token',
        expiresIn: 3600,
        expiresAt: Date.now() + 3600000, // valid for 1 hour
        tokenType: 'Bearer',
        scope: 'test',
      }

      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      const result = await getValidToken(provider, token)
      expect(result).toEqual(token)
    })

    it('should refresh expired token with refresh token', async () => {
      const expiredToken: OAuthToken = {
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        expiresAt: Date.now() - 1000, // expired
        tokenType: 'Bearer',
        scope: 'test',
      }

      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      // @ts-expect-error - Bun fetch mock
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              access_token: 'new-token',
              refresh_token: 'new-refresh',
              expires_in: 3600,
              token_type: 'Bearer',
              scope: 'test',
            }),
        } as Response)
      )

      const result = await getValidToken(provider, expiredToken)
      expect(result.accessToken).toBe('new-token')
    })

    it('should throw if token expired and no refresh token', async () => {
      const expiredToken: OAuthToken = {
        accessToken: 'old-token',
        expiresIn: 3600,
        expiresAt: Date.now() - 1000,
        tokenType: 'Bearer',
        scope: 'test',
      }

      const provider: OAuthProvider = {
        name: 'google',
        config: OAuthProviders.google,
      }

      await expect(getValidToken(provider, expiredToken)).rejects.toThrow(
        'Token expired and no refresh token available'
      )
    })
  })

  describe('OAuth Providers Configuration', () => {
    it('should have Google provider configuration', () => {
      expect(OAuthProviders.google).toBeDefined()
      expect(OAuthProviders.google.authEndpoint).toContain('accounts.google.com')
    })

    it('should have Outlook provider configuration', () => {
      expect(OAuthProviders.outlook).toBeDefined()
      expect(OAuthProviders.outlook.authEndpoint).toContain('microsoftonline.com')
    })

    it('should have Slack provider configuration', () => {
      expect(OAuthProviders.slack).toBeDefined()
      expect(OAuthProviders.slack.authEndpoint).toContain('slack.com')
    })

    it('should have GitHub provider configuration', () => {
      expect(OAuthProviders.github).toBeDefined()
      expect(OAuthProviders.github.authEndpoint).toContain('github.com')
    })
  })
})
