module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        // Performance budgets based on Phase 7 targets
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.85 }],

        // Core Web Vitals budgets
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // LCP < 2.5s
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }], // FCP < 1.8s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // CLS < 0.1
        'total-blocking-time': ['error', { maxNumericValue: 300 }], // TBT < 300ms (proxy for FID)
        'interactive': ['error', { maxNumericValue: 3500 }], // TTI < 3.5s
        'speed-index': ['warn', { maxNumericValue: 3500 }], // SI < 3.5s

        // Resource budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }], // 500KB JS
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }], // 100KB CSS
        'resource-summary:total:size': ['warn', { maxNumericValue: 1000000 }], // 1MB total

        // Best practices
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'uses-text-compression': 'off', // Local static server doesn't compress
        'uses-long-cache-ttl': 'off', // Not applicable for static dist
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
}
