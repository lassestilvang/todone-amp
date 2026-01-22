# Performance Budgets

**Status**: ✅ Implemented  
**Date**: January 2026

---

## Overview

Performance budgets are enforced in CI to prevent performance regressions. The budgets are based on Phase 7 targets and industry best practices.

---

## Budget Targets

### Lighthouse Scores (minimum)

| Metric | Budget | Rationale |
|--------|--------|-----------|
| Performance | ≥ 90 | Industry standard for high-quality apps |
| Accessibility | ≥ 90 | WCAG compliance requirement |
| Best Practices | ≥ 90 | Security and modern standards |
| SEO | ≥ 85 | Basic discoverability |

### Core Web Vitals

| Metric | Budget | Google Threshold |
|--------|--------|------------------|
| LCP (Largest Contentful Paint) | < 2.5s | Good: < 2.5s |
| FCP (First Contentful Paint) | < 1.8s | Good: < 1.8s |
| CLS (Cumulative Layout Shift) | < 0.1 | Good: < 0.1 |
| TBT (Total Blocking Time) | < 300ms | Proxy for FID |
| TTI (Time to Interactive) | < 3.5s | User experience target |
| Speed Index | < 3.5s | Visual completeness |

### Bundle Size Budgets

| Resource | Budget | Notes |
|----------|--------|-------|
| JavaScript (total) | < 500KB gzipped | ~1500KB uncompressed |
| CSS (total) | < 100KB | Including Tailwind |
| Total resources | < 1MB | Full page load |

---

## CI Integration

Performance budgets are enforced in `.github/workflows/ci.yml`:

```yaml
performance-budget:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Run Lighthouse CI
      run: lhci autorun
```

### What Happens on Budget Violation

1. **Error assertions** (Lighthouse scores, Core Web Vitals): CI fails
2. **Warning assertions** (resource sizes): CI passes with warnings
3. **Bundle size check**: CI fails if JS bundle exceeds 1500KB uncompressed

---

## Local Testing

### Run full performance audit

```bash
npm run perf:budget
```

### Run Lighthouse only (requires built dist)

```bash
npm run build
npm run lighthouse
```

### Quick collection without assertions

```bash
npm run build
npm run lighthouse:collect
```

---

## Configuration

Budgets are configured in `lighthouserc.js`:

```javascript
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 3,  // Average of 3 runs
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        // ... more assertions
      },
    },
  },
}
```

---

## Monitoring Performance

### Web Vitals in Production

Real user metrics are collected via `src/utils/webVitals.ts`:

```typescript
import { initWebVitals } from '@/utils/webVitals'

initWebVitals((metric) => {
  // Send to analytics service
  console.log(metric)
})
```

### Bundle Analysis

After building, view the bundle visualization:

```bash
npm run build
open dist/bundle-stats.html
```

---

## Troubleshooting

### CI Fails with Lighthouse Errors

1. Check the Lighthouse report artifact in the failed workflow
2. Identify which assertion failed
3. Common fixes:
   - Large images: compress or lazy load
   - Bundle size: code split or remove unused dependencies
   - CLS: add explicit dimensions to images/containers

### Bundle Size Exceeds Budget

1. Run `npm run build` and check `dist/bundle-stats.html`
2. Identify large chunks
3. Consider:
   - Dynamic imports for large libraries
   - Tree shaking (check for barrel exports)
   - Removing unused dependencies

### Flaky Performance Tests

Lighthouse CI runs 3 times and uses median values. If tests are still flaky:

1. Check for timing-dependent code
2. Consider loosening thresholds slightly
3. Review CI runner resources

---

## References

- [Lighthouse CI documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Performance budgets](https://web.dev/performance-budgets-101/)
