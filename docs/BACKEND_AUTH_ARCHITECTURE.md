# Backend Authentication Architecture

**Task**: T7.3.1  
**Status**: ✅ Complete  
**Date**: January 2026

---

## Overview

This document defines the backend authentication architecture for Todone, enabling secure multi-user deployment. The current implementation uses local IndexedDB storage with email-based lookup—no password verification, no backend server.

---

## Current State

### What Exists
- **Zustand auth store**: `src/store/authStore.ts` - manages user state client-side
- **Dexie.js database**: Users stored in IndexedDB with email as lookup key
- **OAuth PKCE utilities**: `src/utils/oauth.ts` - prepared for OAuth flows
- **User types**: Full User and UserSettings interfaces defined

### Gaps for Production
- No password storage or verification
- No backend API server
- No JWT/session management
- No refresh token rotation
- No rate limiting
- No account recovery

---

## Architecture Design

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| API Framework | **Hono** | Lightweight, TypeScript-first, edge-ready |
| Database | **PostgreSQL** + **Drizzle ORM** | Type-safe, scalable, good migration story |
| Password Hashing | **Argon2id** | Winner of Password Hashing Competition, memory-hard |
| JWT Library | **jose** | Edge-compatible, well-maintained |
| Rate Limiting | **@upstash/ratelimit** | Serverless-friendly, Redis-backed |
| Deployment | **Cloudflare Workers** or **Node.js** | Edge-first with Node fallback |

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React SPA)                       │
├─────────────────────────────────────────────────────────────────┤
│  useAuthStore  │  API Client  │  Token Storage (memory/secure)  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / CDN                           │
│                   (Cloudflare / Vercel Edge)                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AUTH SERVICE (Hono)                         │
├─────────────────────────────────────────────────────────────────┤
│  Rate Limiter  │  Auth Middleware  │  Route Handlers            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                         │
├─────────────────────────────────────────────────────────────────┤
│  users  │  refresh_tokens  │  password_reset_tokens  │  sessions │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar TEXT,
  karma_points INTEGER DEFAULT 0,
  karma_level VARCHAR(50) DEFAULT 'beginner',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
```

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  family_id UUID NOT NULL,  -- For rotation detection
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address INET
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family_id);
```

### Password Reset Tokens Table

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);
```

---

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| POST | `/api/auth/signup` | Create new account | 5/hour/IP |
| POST | `/api/auth/login` | Authenticate user | 10/min/IP |
| POST | `/api/auth/logout` | Invalidate refresh token | 100/min/user |
| POST | `/api/auth/refresh` | Get new access token | 30/min/user |
| POST | `/api/auth/forgot-password` | Request password reset | 3/hour/email |
| POST | `/api/auth/reset-password` | Reset with token | 5/hour/IP |
| POST | `/api/auth/verify-email` | Verify email address | 10/hour/user |
| GET | `/api/auth/me` | Get current user | 100/min/user |

### Request/Response Examples

#### POST /api/auth/signup

```typescript
// Request
{
  email: string      // Valid email format
  password: string   // Min 8 chars, 1 upper, 1 lower, 1 number
  name: string       // 1-100 characters
}

// Response (201 Created)
{
  user: {
    id: string
    email: string
    name: string
    emailVerified: false
  }
  accessToken: string   // JWT, 15min expiry
  refreshToken: string  // Opaque token, 7 days expiry
}
```

#### POST /api/auth/login

```typescript
// Request
{
  email: string
  password: string
}

// Response (200 OK)
{
  user: User
  accessToken: string
  refreshToken: string
}

// Response (401 Unauthorized)
{
  error: "INVALID_CREDENTIALS"
  message: "Invalid email or password"
}

// Response (423 Locked)
{
  error: "ACCOUNT_LOCKED"
  message: "Account locked due to too many failed attempts"
  lockedUntil: string  // ISO timestamp
}
```

---

## Token Strategy

### Access Token (JWT)

```typescript
interface AccessTokenPayload {
  sub: string        // User ID
  email: string
  iat: number        // Issued at
  exp: number        // Expires at (15 minutes)
  jti: string        // Unique token ID
}

// Settings
const ACCESS_TOKEN_EXPIRY = '15m'
const ALGORITHM = 'ES256'  // ECDSA with P-256 curve
```

### Refresh Token

```typescript
// Opaque token format: base64url(random 32 bytes)
// Stored as SHA-256 hash in database
// Expires in 7 days (configurable)
// Rotated on each use (one-time use)

interface RefreshTokenRecord {
  id: string
  userId: string
  tokenHash: string   // SHA-256 of actual token
  familyId: string    // Detect token reuse attacks
  expiresAt: Date
  revokedAt?: Date
}
```

### Token Rotation Flow

```
1. Client sends refresh token
2. Server validates token exists and not expired/revoked
3. Server creates new refresh token in same family
4. Server revokes old refresh token
5. Server returns new access + refresh tokens

If reused token detected (already revoked):
  - Revoke ALL tokens in family
  - Force user re-authentication
  - Log security event
```

---

## Security Measures

### Password Requirements

```typescript
const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,  // Recommended but not required
  preventCommon: true,    // Check against common password list
}
```

### Password Hashing (Argon2id)

```typescript
const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 65536,      // 64 MB
  timeCost: 3,            // 3 iterations
  parallelism: 4,         // 4 threads
  hashLength: 32,         // 32 bytes output
}
```

### Account Lockout

```typescript
const LOCKOUT_POLICY = {
  maxFailedAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,  // 15 minutes
  resetAfterSuccess: true,
}
```

### Rate Limiting Tiers

```typescript
const RATE_LIMITS = {
  // Strict limits for sensitive endpoints
  login: { requests: 10, window: '1m', keyBy: 'ip' },
  signup: { requests: 5, window: '1h', keyBy: 'ip' },
  forgotPassword: { requests: 3, window: '1h', keyBy: 'email' },
  
  // Relaxed limits for authenticated endpoints
  authenticated: { requests: 100, window: '1m', keyBy: 'userId' },
  refresh: { requests: 30, window: '1m', keyBy: 'userId' },
}
```

---

## Client-Side Integration

### Token Storage Strategy

```typescript
// Access token: Memory only (Zustand store)
// Refresh token: httpOnly cookie (set by server)

// Why not localStorage?
// - XSS vulnerable
// - Persists after logout in some cases

// Why httpOnly cookie for refresh token?
// - Not accessible to JavaScript (XSS protected)
// - Automatically sent with requests
// - Can set SameSite=Strict
```

### Updated Auth Store

```typescript
// src/store/authStore.ts (future implementation)
interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  
  // OAuth
  loginWithProvider: (provider: OAuthProvider) => Promise<void>
}
```

### API Client with Auto-Refresh

```typescript
// src/api/client.ts
class ApiClient {
  private accessToken: string | null = null
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: this.accessToken ? `Bearer ${this.accessToken}` : '',
      },
      credentials: 'include',  // Send cookies
    })
    
    if (response.status === 401) {
      // Try refresh
      const refreshed = await this.refresh()
      if (refreshed) {
        return this.request(endpoint, options)
      }
      // Refresh failed, logout
      authStore.getState().logout()
      throw new AuthError('Session expired')
    }
    
    return response.json()
  }
}
```

---

## OAuth Integration

### Supported Providers

| Provider | Use Case | Scopes |
|----------|----------|--------|
| Google | Calendar sync, Gmail integration | `email profile calendar.readonly` |
| Microsoft | Outlook calendar, email | `User.Read Calendars.Read` |
| GitHub | Developer authentication | `user:email` |

### OAuth Flow (Authorization Code + PKCE)

```
1. Client generates code_verifier and code_challenge
2. Client redirects to provider with code_challenge
3. User authenticates with provider
4. Provider redirects back with authorization code
5. Client sends code + code_verifier to backend
6. Backend exchanges code for tokens with provider
7. Backend creates/links user account
8. Backend returns Todone access + refresh tokens
```

### Account Linking

```typescript
interface OAuthAccount {
  id: string
  userId: string
  provider: 'google' | 'microsoft' | 'github'
  providerAccountId: string
  accessToken: string      // Encrypted at rest
  refreshToken?: string    // Encrypted at rest
  expiresAt?: Date
  scopes: string[]
}
```

---

## Migration Path

### Phase 1: Backend Setup
1. Create Hono API project structure
2. Set up PostgreSQL with Drizzle ORM
3. Implement user table and migrations
4. Deploy to staging environment

### Phase 2: Core Auth
1. Implement signup/login endpoints
2. Add password hashing with Argon2id
3. Implement JWT access tokens
4. Add refresh token rotation

### Phase 3: Client Integration
1. Create API client with token handling
2. Update authStore to use backend
3. Add login/signup forms with validation
4. Implement token refresh logic

### Phase 4: Security Hardening
1. Add rate limiting
2. Implement account lockout
3. Add password reset flow
4. Set up email verification

### Phase 5: OAuth
1. Implement OAuth callback handlers
2. Add account linking
3. Update UI with OAuth buttons
4. Test all provider flows

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/todone

# JWT
JWT_PRIVATE_KEY=<base64-encoded-EC-private-key>
JWT_PUBLIC_KEY=<base64-encoded-EC-public-key>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Rate Limiting
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email (for password reset)
RESEND_API_KEY=...
EMAIL_FROM=noreply@todone.app
```

---

## Security Checklist

- [ ] Passwords hashed with Argon2id
- [ ] Access tokens short-lived (15 min)
- [ ] Refresh tokens rotated on use
- [ ] Refresh tokens stored as hashes only
- [ ] Token reuse detection implemented
- [ ] Account lockout after failed attempts
- [ ] Rate limiting on all auth endpoints
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] httpOnly cookies for refresh tokens
- [ ] SameSite=Strict on cookies
- [ ] No sensitive data in JWT payload
- [ ] Password reset tokens single-use
- [ ] Email verification required for sensitive actions

---

## Testing Strategy

### Unit Tests
- Password hashing/verification
- JWT generation/validation
- Token rotation logic
- Rate limit calculations

### Integration Tests
- Full signup → login → logout flow
- Token refresh flow
- Account lockout after failed attempts
- Password reset flow
- OAuth callback handling

### Security Tests
- SQL injection attempts
- JWT tampering detection
- Refresh token reuse detection
- Rate limit enforcement
- Timing attack resistance (constant-time comparison)

---

## Next Steps

1. **T7.3.2**: Implement password hashing module with Argon2id
2. **T7.3.3**: Create JWT service with ES256 signing
3. **T7.3.4**: Implement refresh token rotation
4. **T7.3.5**: Add rate limiting middleware

---

## References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [RFC 7636 - PKCE](https://tools.ietf.org/html/rfc7636)
- [Argon2 Specification](https://github.com/P-H-C/phc-winner-argon2)
