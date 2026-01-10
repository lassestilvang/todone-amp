# Todone - Required Fixes & Improvements

**Created**: January 9, 2026  
**Updated**: January 10, 2026  
**Priority**: Critical issues must be fixed before production deployment

---

## ✅ Completed Fixes

### 1. Database Initialization Bug
**File**: `src/db/database.ts` (lines 91-111)  
**Priority**: 🔴 CRITICAL  
**Status**: ✅ FIXED

**Problem**: New users never get a default inbox project created.

The `initializeDatabase` function checks if the user exists, but `signup` adds the user BEFORE calling this function, so it always returns early.

```typescript
// Current (broken):
const existingUser = await db.users.get(userId)
if (existingUser) return  // Always returns - user was just created!
```

**Fix**:
```typescript
export async function initializeDatabase(userId: string): Promise<void> {
  // Check for existing inbox project, not user
  const existingInbox = await db.projects
    .where({ ownerId: userId, name: 'Inbox' })
    .first()
  if (existingInbox) return

  // Create default inbox project...
}
```

---

### 2. PWA Manifest is Browser Extension Manifest
**File**: `public/manifest.json`  
**Priority**: 🔴 CRITICAL  
**Status**: ✅ FIXED (created public/manifest.webmanifest)

**Problem**: The manifest.json is a Chrome Extension Manifest V3, not a PWA web app manifest. PWA installation will not work.

**Fix**:
1. Rename current file to `public/extension/manifest.json`
2. Create new `public/manifest.webmanifest`:
```json
{
  "name": "Todone - Task Manager",
  "short_name": "Todone",
  "description": "From to-do to todone",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```
3. Update `index.html`:
```html
<link rel="manifest" href="/manifest.webmanifest" />
```
4. Update `public/service-worker.js` to use proper icon paths

---

### 3. AchievementNotificationCenter Not Rendered
**File**: `src/App.tsx`  
**Priority**: 🔴 CRITICAL  
**Status**: ✅ FIXED

**Problem**: The `AchievementNotificationCenter` component exists but is not mounted in the app, so achievement toasts never display.

**Fix**: Add to App.tsx:
```tsx
import { AchievementNotificationCenter } from '@/components/AchievementNotificationCenter'

// In return statement, add before closing </DragDropContextProvider>:
<AchievementNotificationCenter />
```

---

### 4. ResponsiveLayout Not Used
**File**: `src/App.tsx`  
**Priority**: 🔴 CRITICAL  
**Status**: ✅ FIXED (integrated ResponsiveLayout and MobileNavigation)

**Problem**: Documentation claims responsive layout with mobile navigation, but `App.tsx` uses plain `<div>` layout. Mobile views (MobileInboxView, MobileNavigation) exist but aren't integrated.

**Fix**: Either:
- A) Integrate `ResponsiveLayout` component as documented
- B) Update documentation to reflect current desktop-only implementation

---

### 5. Recurrence Edit Instance Bug
**File**: `src/store/taskStore.ts` (lines 514-556)  
**Priority**: 🔴 CRITICAL  
**Status**: ✅ FIXED

**Problem**: `editRecurringTaskInstance` ignores the `updates` parameter in `'single'` mode - it only adds an exception date (skip), not an actual edit.

**Fix**: Now creates a new standalone task with the updates applied and adds the original date as an exception to skip it.

---

## 🟡 High Priority Issues

### 6. Centralize User Persistence
**Files**: `src/store/authStore.ts`, `src/pages/AuthPage.tsx`  
**Priority**: 🟡 HIGH  
**Status**: ✅ FIXED

**Problem**: localStorage persistence is done in AuthPage, not authStore. Logout doesn't clear localStorage.

**Fix**:
```typescript
// In authStore.ts login/signup success:
localStorage.setItem('userId', user.id)

// In authStore.ts logout:
localStorage.removeItem('userId')
```

---

### 7. Sync Store Integration Missing
**File**: `src/store/syncStore.ts`  
**Priority**: 🟡 HIGH  
**Status**: ⏳ TODO

**Problem**: 
- `initializeSync()` is never called on app startup
- CRUD operations don't call `addPendingOperation` when offline
- `syncPendingOperations` is a stub with no network calls
- `detectAndResolveConflicts` just logs success

**Fix**: Either implement real sync or update docs to clarify this is local-only storage.

---

### 8. Service Worker Icon Paths
**File**: `public/service-worker.js`  
**Priority**: 🟡 HIGH  
**Status**: ✅ FIXED (now uses /icons/icon-192.svg)

**Problem**: Service worker uses `/manifest.json` as notification icon (it's JSON, not an image).

**Fix**: Updated to use `/icons/icon-192.svg` for icon and badge.

---

## 🟢 Medium Priority Issues

### 9. Remove Console Statements
**Priority**: 🟢 MEDIUM  
**Status**: ⏳ TODO

**Problem**: 50+ console.log/warn/error statements in production code.

**Files with console statements**:
- `src/store/dashboardStore.ts` (9 occurrences)
- `src/store/notificationStore.ts` (2 occurrences)
- `src/store/taskStore.ts` (2 occurrences)
- `src/store/favoritesStore.ts` (5 occurrences)
- `src/components/*.tsx` (various)
- `src/hooks/usePWA.ts` (5 occurrences)
- `src/utils/*.ts` (various)

**Fix**: Replace with proper error handling or remove. Consider a logging utility for development-only logs.

---

### 10. Fix Test Warnings
**Priority**: 🟢 MEDIUM  
**Status**: ⏳ TODO

**Problems**:
- `QuickAddModal.test.tsx`: "An update was not wrapped in act(...)"
- `scrollAnimations.test.ts`: "Not implemented: window.scrollTo"

**Fix**: Wrap state updates in `act()` and mock `window.scrollTo` in test setup.

---

### 11. ESLint Suppression Comments
**File**: `src/App.tsx` (lines 59, 71)  
**Priority**: 🟢 MEDIUM  
**Status**: ⏳ TODO

**Problem**: Using `eslint-disable-next-line react-hooks/exhaustive-deps`

**Fix**: Either include all dependencies (Zustand actions are stable) or add explicit comments explaining why suppression is safe.

---

### 12. Build Warning - Dynamic Import
**Priority**: 🟢 MEDIUM  
**Status**: ⏳ TODO

**Warning**: 
```
gamificationStore.ts is dynamically imported by taskStore.ts 
but also statically imported by StreakDisplay.tsx
```

**Fix**: Choose one import strategy - either always static or always dynamic for gamificationStore.

---

### 13. DB Transaction for Bulk Operations
**File**: `src/store/taskStore.ts` (reorderTasks method)  
**Priority**: 🟢 MEDIUM  
**Status**: ⏳ TODO

**Problem**: Reordering tasks writes one-by-one to Dexie instead of using a transaction.

**Fix**:
```typescript
await db.transaction('rw', db.tasks, async () => {
  for (const task of updatedTasks) {
    await db.tasks.update(task.id, { order: task.order, updatedAt: now })
  }
})
```

---

## 📋 Security Notes (For Future)

### Authentication Model
Current auth is local email lookup only - no password verification. This is acceptable for a local-only demo app but NOT for multi-user production.

**Before deploying as SaaS**:
- [ ] Implement proper backend authentication
- [ ] Add password hashing and verification
- [ ] Use secure session tokens
- [ ] Move OAuth tokens to server-side storage

### Global Window Hooks
`window.__addAchievementNotification` is exposed globally. Consider using an event bus or React context instead.

---

## ✅ Verification Checklist

After fixes, verify:
- [ ] New user signup creates default inbox project
- [ ] PWA can be installed on mobile/desktop
- [ ] Achievement notifications display when tasks completed
- [ ] Mobile layout works on narrow screens
- [ ] Recurring task "edit single instance" works correctly
- [ ] User session persists after page refresh
- [ ] Logout clears session properly
- [ ] No console statements in production build
- [ ] All tests pass without warnings
- [ ] Build completes without warnings

---

**Last Updated**: January 9, 2026
