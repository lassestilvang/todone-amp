# Service Worker Caching Strategy

**Implemented**: January 2026  
**Status**: ✅ Complete

## Overview

Todone uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) with [Workbox](https://developer.chrome.com/docs/workbox/) for production-grade service worker caching. This enables:

- **Offline support**: App works without network connection
- **Instant loading**: Cached assets load immediately
- **Auto-updates**: Users are notified when new versions are available
- **Precaching**: All build assets are cached during installation

## Caching Strategies

### Precaching (Install-time)

All build assets are precached during service worker installation:

- HTML, CSS, JavaScript files
- SVG and PNG images
- Font files (woff2)
- Favicon and app icons

**Total precached entries**: ~44 files (~2.4 MB)

### Runtime Caching

| Resource Type | Strategy | Cache Name | Max Age | Max Entries |
|---------------|----------|------------|---------|-------------|
| Google Fonts CSS | Cache First | `google-fonts-cache` | 1 year | 10 |
| Google Fonts Files | Cache First | `gstatic-fonts-cache` | 1 year | 10 |
| Images (png, jpg, svg, gif, webp) | Stale While Revalidate | `images-cache` | 30 days | 50 |
| Static Resources (js, css) | Stale While Revalidate | `static-resources` | 7 days | 30 |

### Strategy Explanations

1. **Cache First**: Serves from cache immediately, never checks network. Best for immutable resources like fonts.

2. **Stale While Revalidate**: Serves from cache immediately while fetching an update in the background. Best for resources that should be fast but can be updated.

## Auto-Update Behavior

The service worker is configured with `registerType: 'autoUpdate'`:

1. New service worker installs in background
2. User sees "Update available" notification via `UpdatePrompt` component
3. User can:
   - Click "Refresh" to activate the new version immediately
   - Click "Later" to dismiss (update activates on next visit)

## Configuration

Service worker configuration is in [vite.config.ts](../vite.config.ts):

```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'icons/*.svg'],
  manifest: { /* PWA manifest */ },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [/* caching rules */],
  },
})
```

## React Integration

### usePWA Hook

The `usePWA` hook (`src/hooks/usePWA.ts`) provides:

```typescript
const {
  isOnline,          // Network status
  isInstallable,     // Can show install prompt
  isInstalled,       // Already installed as PWA
  needsRefresh,      // New version available
  isUpdating,        // Currently updating
  install,           // Trigger install prompt
  refresh,           // Apply update and reload
  dismissRefresh,    // Dismiss update notification
} = usePWA()
```

### UpdatePrompt Component

The `UpdatePrompt` component (`src/components/UpdatePrompt.tsx`) displays a notification when updates are available:

- Fixed position at bottom-right
- Shows "Refresh" and "Later" buttons
- Loading state during update
- Accessible with proper ARIA labels

## Build Output

After `npm run build`:

```
dist/
├── sw.js                    # Generated service worker
├── workbox-*.js             # Workbox runtime
├── manifest.webmanifest     # PWA manifest
└── assets/                  # Precached assets
```

## Testing

To test the service worker:

1. Run `npm run build && npm run preview`
2. Open DevTools → Application → Service Workers
3. Verify service worker is registered
4. Check "Offline" in DevTools Network tab
5. Refresh - app should still work

## Debugging

- Enable service worker logging in vite.config.ts:
  ```typescript
  devOptions: {
    enabled: true,  // Enable in development
  }
  ```
- Check Console for `[PWA]` prefixed messages
- Use DevTools → Application → Cache Storage to inspect cached resources

## Related Files

- [vite.config.ts](../vite.config.ts) - PWA plugin configuration
- [src/hooks/usePWA.ts](../src/hooks/usePWA.ts) - React hook for PWA features
- [src/components/UpdatePrompt.tsx](../src/components/UpdatePrompt.tsx) - Update notification UI
- [src/vite-env.d.ts](../src/vite-env.d.ts) - TypeScript declarations
