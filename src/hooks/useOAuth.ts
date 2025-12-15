import { useCallback, useEffect, useState } from 'react'
import {
  startOAuthFlow,
  handleOAuthCallback,
  verifyOAuthState,
  getPKCEVerifier,
  clearPKCEVerifier,
  exchangeCodeForToken,
  storeOAuthToken,
  OAuthProviders,
  type OAuthToken,
} from '@/utils/oauth'

export interface UseOAuthState {
  isLoading: boolean
  error: string | null
  token: OAuthToken | null
  isAuthenticated: boolean
}

export interface UseOAuthReturn extends UseOAuthState {
  initiateOAuth: (provider: keyof typeof OAuthProviders) => Promise<void>
  handleCallback: (provider: string) => Promise<OAuthToken | null>
  logout: (provider: string) => void
}

/**
 * Hook for managing OAuth flows
 * Handles code exchange, token storage, and state verification
 */
export function useOAuth(): UseOAuthReturn {
  const [state, setState] = useState<UseOAuthState>({
    isLoading: false,
    error: null,
    token: null,
    isAuthenticated: false,
  })

  /**
   * Initialize OAuth flow - redirects to provider
   */
  const initiateOAuth = useCallback(
    async (provider: keyof typeof OAuthProviders) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        const authUrl = await startOAuthFlow(provider)
        window.location.href = authUrl
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initiate OAuth'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }))
      }
    },
    []
  )

  /**
   * Handle OAuth callback - exchange code for token
   */
  const handleCallback = useCallback(
    async (provider: string): Promise<OAuthToken | null> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))

        const { code, state: returnedState, error } = handleOAuthCallback()

        if (error) {
          const message = `OAuth error: ${error}`
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: message,
          }))
          return null
        }

        if (!code) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'No authorization code received',
          }))
          return null
        }

        // Verify state to prevent CSRF
        if (!verifyOAuthState(provider, returnedState)) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Invalid state parameter - possible CSRF attack',
          }))
          return null
        }

        // Get PKCE verifier
        const verifier = getPKCEVerifier(provider)
        if (!verifier) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'PKCE verifier not found',
          }))
          return null
        }

        // Exchange code for token
        const providerConfig = OAuthProviders[provider]
        if (!providerConfig) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: `Unknown provider: ${provider}`,
          }))
          return null
        }

        const oauthProvider = {
          name: provider as 'google' | 'outlook' | 'slack' | 'github',
          config: providerConfig,
        }

        const token = await exchangeCodeForToken(oauthProvider, code, verifier)

        // Store token
        storeOAuthToken(provider, token)
        clearPKCEVerifier(provider)

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
          token,
          isAuthenticated: true,
        }))

        return token
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Token exchange failed'
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }))
        return null
      }
    },
    []
  )

  /**
   * Logout - clear stored token
   */
  const logout = useCallback((provider: string) => {
    clearPKCEVerifier(provider)
    localStorage.removeItem(`oauth_token_${provider}`)

    setState((prev) => ({
      ...prev,
      token: null,
      isAuthenticated: false,
      error: null,
    }))
  }, [])

  /**
   * Check for OAuth callback on mount
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      // Infer provider from URL or check all
      const providers = Object.keys(OAuthProviders)
      for (const provider of providers) {
        handleCallback(provider)
        break
      }
    }
  }, [handleCallback])

  return {
    ...state,
    initiateOAuth,
    handleCallback,
    logout,
  }
}
