/**
 * OAuth 2.0 Flow Handler for Calendar & Service Integrations
 *
 * Supports: Google Calendar, Outlook Calendar, Gmail, Slack
 * Uses Authorization Code Flow with PKCE for security
 */

export interface OAuthConfig {
  clientId: string
  redirectUrl: string
  scopes: string[]
  authEndpoint: string
  tokenEndpoint: string
  revokeEndpoint?: string
}

export interface OAuthToken {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  expiresAt: number
  tokenType: string
  scope: string
}

export interface OAuthProvider {
  name: 'google' | 'outlook' | 'slack' | 'github'
  config: OAuthConfig
}

/**
 * Generate PKCE challenge pair for secure OAuth flow
 * @returns {code_challenge, code_verifier}
 */
export async function generatePKCEChallenge(): Promise<{
  codeVerifier: string
  codeChallenge: string
}> {
  const codeVerifier = generateRandomString(128)
  const buffer = await sha256(codeVerifier)
  const codeChallenge = base64UrlEncode(buffer)
  return { codeVerifier, codeChallenge }
}

/**
 * Generate random string for PKCE
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const randomValues = crypto.getRandomValues(new Uint8Array(length))
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

/**
 * SHA256 hash function for PKCE
 */
async function sha256(input: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  return crypto.subtle.digest('SHA-256', data)
}

/**
 * Base64 URL encode for PKCE
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Store PKCE verifier in session storage
 */
export function storePKCEVerifier(verifier: string, provider: string): void {
  sessionStorage.setItem(`oauth_pkce_${provider}`, verifier)
}

/**
 * Retrieve PKCE verifier from session storage
 */
export function getPKCEVerifier(provider: string): string | null {
  return sessionStorage.getItem(`oauth_pkce_${provider}`)
}

/**
 * Clear PKCE verifier from session storage
 */
export function clearPKCEVerifier(provider: string): void {
  sessionStorage.removeItem(`oauth_pkce_${provider}`)
}

/**
 * Build OAuth authorization URL
 */
export function buildAuthorizationUrl(
  provider: OAuthProvider,
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    client_id: provider.config.clientId,
    redirect_uri: provider.config.redirectUrl,
    response_type: 'code',
    scope: provider.config.scopes.join(' '),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })

  return `${provider.config.authEndpoint}?${params.toString()}`
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  provider: OAuthProvider,
  code: string,
  codeVerifier: string
): Promise<OAuthToken> {
  const payload = {
    grant_type: 'authorization_code',
    code,
    client_id: provider.config.clientId,
    redirect_uri: provider.config.redirectUrl,
    code_verifier: codeVerifier,
  }

  const response = await fetch(provider.config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`OAuth token exchange failed: ${error.error_description || error.error}`)
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    expiresAt: Date.now() + data.expires_in * 1000,
    tokenType: data.token_type,
    scope: data.scope,
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  provider: OAuthProvider,
  refreshToken: string
): Promise<OAuthToken> {
  const payload = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: provider.config.clientId,
  }

  const response = await fetch(provider.config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh access token')
  }

  const data = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
    expiresAt: Date.now() + data.expires_in * 1000,
    tokenType: data.token_type,
    scope: data.scope,
  }
}

/**
 * Revoke OAuth token
 */
export async function revokeToken(
  provider: OAuthProvider,
  token: string
): Promise<boolean> {
  if (!provider.config.revokeEndpoint) {
    return false
  }

  try {
    const response = await fetch(provider.config.revokeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        client_id: provider.config.clientId,
      }).toString(),
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: OAuthToken): boolean {
  return Date.now() >= token.expiresAt
}

/**
 * Get valid token, refreshing if necessary
 */
export async function getValidToken(
  provider: OAuthProvider,
  token: OAuthToken
): Promise<OAuthToken> {
  if (!isTokenExpired(token)) {
    return token
  }

  if (!token.refreshToken) {
    throw new Error('Token expired and no refresh token available')
  }

  return refreshAccessToken(provider, token.refreshToken)
}

/**
 * Store OAuth token securely in localStorage
 */
export function storeOAuthToken(provider: string, token: OAuthToken): void {
  localStorage.setItem(`oauth_token_${provider}`, JSON.stringify(token))
}

/**
 * Retrieve OAuth token from localStorage
 */
export function getStoredOAuthToken(provider: string): OAuthToken | null {
  const stored = localStorage.getItem(`oauth_token_${provider}`)
  return stored ? JSON.parse(stored) : null
}

/**
 * Clear stored OAuth token
 */
export function clearStoredOAuthToken(provider: string): void {
  localStorage.removeItem(`oauth_token_${provider}`)
}

/**
 * Get environment variable safely
 */
function getEnvVar(key: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env
  return (env && env[key]) || ''
}

/**
 * Get OAuth provider configurations
 * Dynamically loads client IDs from environment variables
 */
export function getOAuthProviders(): Record<string, OAuthConfig> {
  return {
    google: {
      clientId: getEnvVar('VITE_GOOGLE_OAUTH_CLIENT_ID'),
      redirectUrl: `${window.location.origin}/auth/callback/google`,
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
      authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
    },
    outlook: {
      clientId: getEnvVar('VITE_OUTLOOK_OAUTH_CLIENT_ID'),
      redirectUrl: `${window.location.origin}/auth/callback/outlook`,
      scopes: [
        'Calendars.Read',
        'Mail.Read',
        'User.Read',
      ],
      authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      revokeEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
    },
    slack: {
      clientId: getEnvVar('VITE_SLACK_OAUTH_CLIENT_ID'),
      redirectUrl: `${window.location.origin}/auth/callback/slack`,
      scopes: [
        'channels:read',
        'users:read',
        'chat:write',
      ],
      authEndpoint: 'https://slack.com/oauth/v2/authorize',
      tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
    },
    github: {
      clientId: getEnvVar('VITE_GITHUB_OAUTH_CLIENT_ID'),
      redirectUrl: `${window.location.origin}/auth/callback/github`,
      scopes: [
        'repo',
        'gist',
        'user',
      ],
      authEndpoint: 'https://github.com/login/oauth/authorize',
      tokenEndpoint: 'https://github.com/login/oauth/access_token',
    },
  }
}

/**
 * Predefined OAuth provider configurations
 */
export const OAuthProviders: Record<string, OAuthConfig> = getOAuthProviders()

/**
 * Start OAuth flow for a provider
 */
export async function startOAuthFlow(
  providerName: keyof typeof OAuthProviders
): Promise<string> {
  const config = OAuthProviders[providerName]

  if (!config.clientId) {
    throw new Error(`OAuth client ID not configured for ${providerName}`)
  }

  const { codeVerifier, codeChallenge } = await generatePKCEChallenge()
  const state = generateRandomString(32)

  // Store state and verifier for verification on callback
  sessionStorage.setItem(`oauth_state_${providerName}`, state)
  storePKCEVerifier(codeVerifier, providerName)

  const provider: OAuthProvider = {
    name: providerName as 'google' | 'outlook' | 'slack' | 'github',
    config,
  }

  return buildAuthorizationUrl(provider, state, codeChallenge)
}

/**
 * Handle OAuth callback and extract code
 */
export function handleOAuthCallback(): {
  code: string | null
  state: string | null
  error: string | null
} {
  const params = new URLSearchParams(window.location.search)

  return {
    code: params.get('code'),
    state: params.get('state'),
    error: params.get('error'),
  }
}

/**
 * Verify OAuth state to prevent CSRF attacks
 */
export function verifyOAuthState(
  providerName: string,
  returnedState: string | null
): boolean {
  const storedState = sessionStorage.getItem(`oauth_state_${providerName}`)
  if (!storedState || !returnedState) {
    return false
  }
  const isValid = storedState === returnedState
  if (isValid) {
    sessionStorage.removeItem(`oauth_state_${providerName}`)
  }
  return isValid
}
