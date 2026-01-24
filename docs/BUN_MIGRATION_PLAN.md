# Bun Migration Plan for Todone

> Complete migration from npm/Node.js/Vitest to Bun as package manager, test runner, bundler, and JavaScript runtime.

**Estimated Effort:** 4-6 hours
**Risk Level:** Medium
**Status:** Draft

---

## Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Migration Goals](#migration-goals)
4. [Pre-Migration Checklist](#pre-migration-checklist)
5. [Phase 1: Package Manager Migration](#phase-1-package-manager-migration)
6. [Phase 2: Test Runner Migration](#phase-2-test-runner-migration)
7. [Phase 3: CI/CD Updates](#phase-3-cicd-updates)
8. [Phase 4: Vercel Deployment Configuration](#phase-4-vercel-deployment-configuration)
9. [Phase 5: Bundler & Dev Server](#phase-5-bundler--dev-server)
10. [Post-Migration Validation](#post-migration-validation)
11. [Rollback Plan](#rollback-plan)
12. [Known Limitations & Gotchas](#known-limitations--gotchas)

---

## Overview

### Why Bun?

| Benefit                | Impact                                          |
| ---------------------- | ----------------------------------------------- |
| **4x faster installs** | npm ci ~8s → bun install ~2s                    |
| **5-15x faster tests** | Vitest ~2s → Bun test ~400ms (for 100 tests)    |
| **Single executable**  | Replace npm, node, npx with one binary          |
| **Native TypeScript**  | Zero-config TS/JSX support                      |
| **Built-in bundler**   | Optional replacement for Vite (we'll keep Vite) |

### What Changes

| Current                  | After Migration |
| ------------------------ | --------------- |
| `npm`                    | `bun`           |
| `npm ci` / `npm install` | `bun install`   |
| `npx`                    | `bunx`          |
| `vitest`                 | `bun test`      |
| `node` runtime           | `bun` runtime   |
| `package-lock.json`      | `bun.lock`      |

### What Stays the Same

- **Vite** - Continues as dev server & bundler (works perfectly with Bun)
- **Playwright** - E2E tests unchanged
- **Storybook** - Compatible with Bun
- **ESLint/Prettier** - Unchanged
- **Tailwind CSS** - Unchanged

---

## Current State Analysis

### Package Manager

- **npm** with `package-lock.json`
- 40 dependencies, 31 devDependencies
- Node.js 20

### Testing

- **Vitest** for unit tests (111+ test files)
- **Playwright** for E2E tests (4 browser targets)
- Test setup in `src/test/setup.ts`

### Build Tools

- **Vite 5** with React plugin, PWA, and visualizer
- **TypeScript 5** with strict mode
- Manual chunks for code splitting

### CI/CD

- **GitHub Actions** - 2 workflows:
  - `ci.yml` - lint, type-check, unit tests, build, Lighthouse
  - `e2e.yml` - Playwright tests on Chromium

### Deployment

- Static site (Vite build → `dist/`)
- Ready for Vercel deployment

---

## Migration Goals

1. ✅ Use `bun` as package manager (replace npm)
2. ✅ Use `bun test` as test runner (replace Vitest)
3. ✅ Use Bun runtime for development (replace Node.js)
4. ✅ Keep Vite as bundler (proven, stable)
5. ✅ Update CI/CD to use Bun
6. ✅ Ensure Vercel deployment works

---

## Pre-Migration Checklist

- [x] Ensure all tests pass with current setup: `npm test` ✅ 114 files, 1957 tests passed (29.99s)
- [x] Ensure build succeeds: `npm run build` ✅ Built in 5.69s
- [x] Ensure E2E tests pass: `npm run test:e2e:chromium` ✅ 71 passed (18.3s)
- [x] Backup `package-lock.json` (will be replaced) ✅ Saved as `package-lock.json.backup`

> **Fixed:** E2E test `tasks.spec.ts:31` was missing `await expect(quickAddInput).toBeVisible()` and used a selector that conflicted with NLP date parsing.

---

## Phase 1: Package Manager Migration

### 1.1 Install Bun

```bash
# macOS/Linux
curl -fsSL https://bun.com/install | bash

# Verify installation
bun --version
```

✅ **Done:** Bun v1.3.6 already installed

### 1.2 Generate Bun Lockfile

```bash
# In project root
bun install
```

This creates `bun.lock`. Keep both lockfiles during transition if needed.

✅ **Done:** `bun install` completed in 1.98s (109 packages)

### 1.3 Update .gitignore

Add to `.gitignore`:

```gitignore
# Bun (keep bun.lock committed)
.bun
```

✅ **Done**

### 1.4 Remove npm Lockfile (after validation)

```bash
rm package-lock.json
```

⏳ **Pending:** Will remove after Phase 2 validation

### 1.5 Update package.json Scripts

```json
{
  "scripts": {
    "dev": "bunx --bun vite",
    "build": "bun run type-check && bunx --bun vite build",
    "preview": "bunx --bun vite preview",
    "lint": "bunx eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "bunx tsc --noEmit",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "test:e2e": "bunx playwright test",
    "test:e2e:ui": "bunx playwright test --ui",
    "test:e2e:headed": "bunx playwright test --headed",
    "test:e2e:chromium": "bunx playwright test --project=chromium",
    "storybook": "bunx --bun storybook dev -p 6006",
    "build-storybook": "bunx storybook build",
    "lighthouse": "bunx lhci autorun",
    "lighthouse:collect": "bunx lhci collect",
    "perf:budget": "bun run build && bun run lighthouse"
  }
}
```

**Note:** `bunx --bun` uses Bun runtime for the executed package. Plain `bunx` uses Node.js runtime.

✅ **Done:** Scripts updated and validated:
- `bun run type-check` ✅
- `bun run lint` ✅  
- `bun run build` ✅ (6.23s)

---

## Phase 2: Test Runner Migration

**Status:** ⚠️ In Progress - 1746/1793 tests passing (97.4%)

✅ Type-check, lint, and build all pass

### Known Issues
- **Zustand store isolation**: Tests pass individually but fail together due to shared state
- **mock.module**: Bun's `mock.module` works differently than Vitest's `vi.mock` (not hoisted)
- **Some jest-dom matchers**: `toHaveStyle` with string values has compatibility issues

### 2.1 Create Bun Test Configuration

Create `bunfig.toml` in project root:

```toml
[test]
# Preload test setup - happydom must be first to set up globals before testing-library
preload = ["./src/test/happydom.ts", "./src/test/setup.ts"]

# Timeout per test (ms)
timeout = 10000

# Test file patterns
root = "./src"
```

✅ **Done:** Created `bunfig.toml` with happy-dom preload

### 2.2 Update Test Setup File

Replace `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom'
import { afterEach, mock } from 'bun:test'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: mock(() => {}),
  writable: true,
})

// Mock Dexie and IndexedDB if needed
global.indexedDB = {
  open: mock(() => {}),
  deleteDatabase: mock(() => {}),
} as unknown as IDBFactory
```

### 2.3 Migrate Test Files

**Find-and-replace across all test files:**

| Find                                                                       | Replace                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `import { describe, it, expect } from 'vitest'`                            | `import { describe, it, expect } from 'bun:test'`                              |
| `import { describe, it, expect, vi } from 'vitest'`                        | `import { describe, it, expect, mock } from 'bun:test'`                        |
| `import { describe, it, expect, beforeEach } from 'vitest'`                | `import { describe, it, expect, beforeEach } from 'bun:test'`                  |
| `import { describe, it, expect, beforeEach, vi } from 'vitest'`            | `import { describe, it, expect, beforeEach, mock } from 'bun:test'`            |
| `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'` | `import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'` |
| `import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'` | `import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'` |
| `import { describe, it, expect, vi, beforeEach } from 'vitest'`            | `import { describe, it, expect, beforeEach, mock } from 'bun:test'`            |
| `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'` | `import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'` |
| `import { describe, it, expect, beforeEach, afterEach } from 'vitest'`     | `import { describe, it, expect, beforeEach, afterEach } from 'bun:test'`       |
| `import { afterEach, vi } from 'vitest'`                                   | `import { afterEach, mock } from 'bun:test'`                                   |

**Mock API migration:**

| Vitest                         | Bun                              | Notes                         |
| ------------------------------ | -------------------------------- | ----------------------------- |
| `vi.fn()`                      | `mock(() => {})`                 | Function mock                 |
| `vi.fn().mockReturnValue(x)`   | `mock(() => x)`                  | Return value                  |
| `vi.fn().mockResolvedValue(x)` | `mock(() => Promise.resolve(x))` | Async mock                    |
| `vi.fn().mockRejectedValue(x)` | `mock(() => Promise.reject(x))`  | Rejected promise              |
| `vi.spyOn(obj, 'method')`      | `mock.module()` or reassign      | Different approach            |
| `vi.clearAllMocks()`           | `mock.restore()`                 | Clear mocks                   |
| `vi.useFakeTimers()`           | `mock.setSystemTime(date)`       | Fake timers                   |
| `vi.advanceTimersByTime(ms)`   | Not directly supported           | Use real timers or workaround |

### 2.4 Files Requiring Changes

Based on grep analysis, **111+ test files** need import updates. Here's a migration script to automate:

```bash
#!/bin/bash
# scripts/migrate-vitest-to-bun.sh

# Replace vitest imports with bun:test
find src -name "*.test.ts" -o -name "*.test.tsx" | while read file; do
  # Replace various vitest import patterns
  sed -i '' "s/from 'vitest'/from 'bun:test'/g" "$file"

  # Replace vi. calls with mock/jest equivalents
  sed -i '' "s/vi\.fn()/mock(() => {})/g" "$file"
  sed -i '' "s/vi\.clearAllMocks()/mock.restore()/g" "$file"
done

echo "Migration complete. Review changes and test."
```

### 2.5 Remove Vitest Dependencies

After migration is validated:

```bash
bun remove vitest @vitest/ui
```

Also remove from `vitest.config.ts` (file can be deleted).

---

## Phase 3: CI/CD Updates

**Status:** ✅ Complete

- Updated `.github/workflows/ci.yml` to use `oven-sh/setup-bun@v2`
- Updated `.github/workflows/e2e.yml` to use `oven-sh/setup-bun@v2`
- Added Bun dependency caching with `actions/cache@v4`
- All commands now use `bun install --frozen-lockfile`, `bun test`, `bun run build`, etc.

### 3.1 Update `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run ESLint
        run: bun run lint

      - name: Run TypeScript type check
        run: bun run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run unit tests
        run: bun test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build application
        run: bun run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 1

  performance-budget:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Download build artifacts
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Install Lighthouse CI
        run: bun add -g @lhci/cli

      - name: Run Lighthouse CI
        run: bunx lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Check bundle size budget
        run: |
          echo "Checking bundle size budgets..."

          TOTAL_JS=$(find dist/assets -name "*.js" -exec cat {} \; | wc -c)
          TOTAL_JS_KB=$((TOTAL_JS / 1024))

          echo "Total JS bundle size: ${TOTAL_JS_KB}KB"

          MAX_JS_KB=1500

          if [ "$TOTAL_JS_KB" -gt "$MAX_JS_KB" ]; then
            echo "❌ BUDGET EXCEEDED: JS bundle is ${TOTAL_JS_KB}KB (max: ${MAX_JS_KB}KB)"
            exit 1
          else
            echo "✅ JS bundle size within budget: ${TOTAL_JS_KB}KB / ${MAX_JS_KB}KB"
          fi

      - name: Upload Lighthouse report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse-report
          path: .lighthouseci/
          retention-days: 7
```

### 3.2 Update `.github/workflows/e2e.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Install Playwright browsers
        run: bunx playwright install --with-deps chromium

      - name: Build application
        run: bun run build

      - name: Run E2E tests
        run: bun run test:e2e:chromium

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## Phase 4: Vercel Deployment Configuration

**Status:** ✅ Complete

- Created `vercel.json` with Bun build/install commands
- Vercel will auto-detect `bun.lock` and use Bun as package manager

### 4.1 Create/Update `vercel.json`

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "outputDirectory": "dist"
}
```

### 4.2 Vercel Project Settings

In Vercel Dashboard → Project → Settings → General:

| Setting          | Value                     |
| ---------------- | ------------------------- |
| Framework Preset | Vite                      |
| Build Command    | `bun run build`           |
| Output Directory | `dist`                    |
| Install Command  | `bun install`             |
| Node.js Version  | 20.x (Bun runs alongside) |

### 4.3 Important Notes for Vercel + Bun

1. **Bun as Package Manager**: Vercel auto-detects `bun.lock` and uses Bun for installs
2. **Build runs with Bun**: The build command runs in Bun runtime
3. **No Server Functions**: This is a static SPA, so no need for Bun runtime functions
4. **If using Vercel Functions later**: Add `bunVersion: "1.x"` to `vercel.json`:

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "bun@1.x"
    }
  }
}
```

### 4.4 Vercel Environment Variables

No changes needed - existing env vars continue to work.

---

## Phase 5: Bundler & Dev Server

### 5.1 Keep Vite (Recommended)

Vite is stable, well-tested, and has excellent plugin ecosystem. We'll use Bun as the **runtime** for Vite.

Update `vite.config.ts` (no changes needed, works as-is):

```typescript
// vite.config.ts - Already compatible with Bun
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  // ... existing config works unchanged
})
```

### 5.2 Alternative: Bun Bundler (Optional, Not Recommended Yet)

Bun has a built-in bundler, but for this project we recommend staying with Vite because:

- Vite PWA plugin is battle-tested
- Code splitting configuration is already optimized
- Rollup visualizer works well
- Less migration risk

If you want to explore Bun bundler in the future, see [Bun Bundler Docs](https://bun.sh/docs/bundler).

---

## Post-Migration Validation

### Validation Checklist

```bash
# 1. Clean install
rm -rf node_modules
bun install

# 2. Run unit tests
bun test

# 3. Run type check
bun run type-check

# 4. Run lint
bun run lint

# 5. Build application
bun run build

# 6. Preview build
bun run preview
# Open http://localhost:4173 and verify app works

# 7. Run E2E tests
bun run test:e2e:chromium

# 8. Run Storybook
bun run storybook
# Open http://localhost:6006 and verify components render

# 9. Run Lighthouse
bun run lighthouse
```

### Performance Comparison

Document before/after times:

| Task          | Before (npm/Vitest) | After (Bun) | Improvement |
| ------------- | ------------------- | ----------- | ----------- |
| `install`     | \_\_\_ s            | \_\_\_ s    | \_\_\_x     |
| `test`        | \_\_\_ s            | \_\_\_ s    | \_\_\_x     |
| `build`       | \_\_\_ s            | \_\_\_ s    | \_\_\_x     |
| `dev` startup | \_\_\_ ms           | \_\_\_ ms   | \_\_\_x     |

---

## Rollback Plan

If issues arise, rollback is straightforward:

```bash
# 1. Restore package-lock.json from git
git checkout main -- package-lock.json

# 2. Remove bun files
rm bun.lock bunfig.toml

# 3. Restore vitest imports (git restore or manual)
git checkout main -- src/test/setup.ts
# Restore test files if needed

# 4. Restore CI workflows
git checkout main -- .github/workflows/

# 5. Reinstall with npm
rm -rf node_modules
npm ci

# 6. Verify
npm test
npm run build
```

---

## Known Limitations & Gotchas

### Bun Test Runner Differences

| Issue                             | Workaround                                                                                                        |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **No `vi.advanceTimersByTime()`** | Use `mock.setSystemTime()` for date mocking, or real timers                                                       |
| **Single process execution**      | Tests share global state - ensure proper cleanup in `afterEach`                                                   |
| **Some Jest matchers missing**    | Most common matchers work; check [bun.d.ts](https://github.com/oven-sh/bun/blob/main/packages/bun-types/bun.d.ts) |
| **No test.each table syntax**     | Use loops or multiple test cases                                                                                  |

### Potential Compatibility Issues

1. **`@testing-library/jest-dom`** - Works with Bun, but verify matchers
2. **`jsdom` environment** - Bun has built-in happy-dom, may need adjustment
3. **Native modules** - Most work, but test any N-API dependencies

### Storybook Considerations

Storybook 8 works with Bun, but:

- Use `bunx --bun storybook dev` to run with Bun runtime
- Some addons may have Node.js-specific code

### CI Caching

GitHub Actions caching with Bun:

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest

- name: Cache bun dependencies
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
    restore-keys: |
      bun-${{ runner.os }}-
```

---

## Files to Create/Modify Summary

### New Files

- [ ] `bunfig.toml` - Bun configuration
- [ ] `vercel.json` - Vercel deployment config
- [ ] `scripts/migrate-vitest-to-bun.sh` - Migration helper script

### Modified Files

- [ ] `package.json` - Update scripts
- [ ] `.gitignore` - Add Bun entries
- [ ] `src/test/setup.ts` - Migrate from vitest to bun:test
- [ ] `.github/workflows/ci.yml` - Use setup-bun action
- [ ] `.github/workflows/e2e.yml` - Use setup-bun action
- [ ] `playwright.config.ts` - Update webServer command
- [ ] All 111+ test files - Update imports

### Deleted Files

- [ ] `package-lock.json` - Replaced by bun.lock
- [ ] `vitest.config.ts` - No longer needed (config in bunfig.toml)

---

## Implementation Order

1. **Phase 1** (30 min): Package manager migration
2. **Phase 2** (2-3 hours): Test runner migration (111+ files)
3. **Phase 3** (30 min): CI/CD updates
4. **Phase 4** (15 min): Vercel configuration
5. **Phase 5** (15 min): Validation & documentation
6. **Buffer** (1 hour): Fix unexpected issues

---

## References

- [Bun Documentation](https://bun.sh/docs)
- [Bun Test Runner](https://bun.sh/docs/cli/test)
- [Vercel Bun Runtime](https://vercel.com/docs/functions/runtimes/bun)
- [oven-sh/setup-bun GitHub Action](https://github.com/oven-sh/setup-bun)
- [Vite + Bun Compatibility](https://vitejs.dev/guide/ssr.html#bun)
