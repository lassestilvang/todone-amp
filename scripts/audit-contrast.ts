/**
 * WCAG Contrast Ratio Audit Script
 *
 * This script audits all color token combinations for WCAG AA compliance.
 * - Text: 4.5:1 minimum (3:1 for large text 18px+ or 14px+ bold)
 * - UI Components: 3:1 minimum
 *
 * Run with: npx tsx scripts/audit-contrast.ts
 */

// Color tokens from tokens.css
const lightModeTokens = {
  // Surfaces
  'surface-primary': '#ffffff',
  'surface-secondary': '#f9fafb',
  'surface-tertiary': '#f3f4f6',
  'surface-elevated': '#ffffff',

  // Text
  'text-primary': '#111827',
  'text-secondary': '#4b5563',
  'text-tertiary': '#6b7280', // Darkened for 4.5:1 contrast
  'text-disabled': '#6b7280', // Darkened for 3:1 contrast

  // Borders
  'border-default': '#6b7280', // Darkened for 3:1 contrast
  'border-hover': '#4b5563',

  // Interactive
  'interactive-primary': '#16a34a', // Darkened for 3:1 contrast
  'interactive-primary-hover': '#15803d',

  // Semantic
  success: '#15803d', // Darkened for 4.5:1 contrast
  'success-light': '#dcfce7',
  warning: '#92400e', // Darkened for 4.5:1 contrast
  'warning-light': '#fef3c7',
  error: '#b91c1c', // Darkened for 4.5:1 contrast
  'error-light': '#fee2e2',
  info: '#1d4ed8', // Darkened for 4.5:1 contrast
  'info-light': '#dbeafe',

  // Priority
  'priority-p1': '#b91c1c', // Darkened for 4.5:1 contrast
  'priority-p1-bg': '#fef2f2',
  'priority-p2': '#c2410c', // Darkened for 4.5:1 contrast
  'priority-p2-bg': '#fff7ed',
  'priority-p3': '#1d4ed8', // Darkened for 4.5:1 contrast
  'priority-p3-bg': '#eff6ff',
  'priority-p4': '#4b5563', // Darkened for better contrast
  'priority-p4-bg': '#f9fafb',

  // Sidebar
  'sidebar-bg': '#f9fafb',
  'sidebar-text': '#374151',
  'sidebar-text-muted': '#6b7280',

  // Input
  'input-bg': '#ffffff',
  'input-placeholder': '#6b7280', // Darkened for 4.5:1 contrast

  // Tooltip
  'tooltip-bg': '#1f2937',
  'tooltip-text': '#ffffff',
}

const darkModeTokens = {
  // Surfaces
  'surface-primary': '#111827',
  'surface-secondary': '#1f2937',
  'surface-tertiary': '#374151',
  'surface-elevated': '#1f2937',

  // Text
  'text-primary': '#f9fafb',
  'text-secondary': '#d1d5db',
  'text-tertiary': '#9ca3af',
  'text-disabled': '#6b7280', // Lightened for 3:1 contrast

  // Borders
  'border-default': '#6b7280', // Lightened for 3:1 contrast
  'border-hover': '#9ca3af',

  // Interactive
  'interactive-primary': '#4ade80',
  'interactive-primary-hover': '#22c55e',

  // Semantic
  success: '#86efac', // Lightened for 4.5:1 on success-light
  'success-light': '#14532d', // Darkened for better contrast
  warning: '#fbbf24',
  'warning-light': '#78350f',
  error: '#fca5a5', // Lightened for 4.5:1 on error-light
  'error-light': '#7f1d1d',
  info: '#60a5fa',
  'info-light': '#1e3a5f',

  // Priority
  'priority-p1': '#f87171',
  'priority-p1-bg': 'rgba(239, 68, 68, 0.15)',
  'priority-p2': '#fb923c',
  'priority-p2-bg': 'rgba(249, 115, 22, 0.15)',
  'priority-p3': '#60a5fa',
  'priority-p3-bg': 'rgba(59, 130, 246, 0.15)',
  'priority-p4': '#9ca3af',
  'priority-p4-bg': 'rgba(107, 114, 128, 0.15)',

  // Sidebar
  'sidebar-bg': '#1f2937',
  'sidebar-text': '#e5e7eb',
  'sidebar-text-muted': '#9ca3af',

  // Input
  'input-bg': '#1f2937',
  'input-placeholder': '#9ca3af', // Lightened for 4.5:1 contrast

  // Tooltip
  'tooltip-bg': '#374151',
  'tooltip-text': '#f9fafb',
}

// Parse color to RGB
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      }
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      }
    }
  }

  // Handle rgba colors - blend with dark background for dark mode
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
    if (match) {
      const alpha = parseFloat(match[4])
      // Blend with dark background (#111827)
      const bgR = 17,
        bgG = 24,
        bgB = 39
      return {
        r: Math.round(parseInt(match[1]) * alpha + bgR * (1 - alpha)),
        g: Math.round(parseInt(match[2]) * alpha + bgG * (1 - alpha)),
        b: Math.round(parseInt(match[3]) * alpha + bgB * (1 - alpha)),
      }
    }
  }

  return null
}

// Calculate relative luminance (WCAG formula)
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = parseColor(color1)
  const rgb2 = parseColor(color2)

  if (!rgb1 || !rgb2) return null

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)

  return (lighter + 0.05) / (darker + 0.05)
}

// Define expected combinations to audit
interface ColorCombination {
  name: string
  foreground: string
  background: string
  type: 'text' | 'ui' | 'large-text'
  minRatio: number
}

function getCombinations(tokens: Record<string, string>): ColorCombination[] {
  return [
    // Primary text on surfaces
    {
      name: 'text-primary on surface-primary',
      foreground: tokens['text-primary'],
      background: tokens['surface-primary'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'text-primary on surface-secondary',
      foreground: tokens['text-primary'],
      background: tokens['surface-secondary'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'text-primary on surface-tertiary',
      foreground: tokens['text-primary'],
      background: tokens['surface-tertiary'],
      type: 'text',
      minRatio: 4.5,
    },

    // Secondary text on surfaces
    {
      name: 'text-secondary on surface-primary',
      foreground: tokens['text-secondary'],
      background: tokens['surface-primary'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'text-secondary on surface-secondary',
      foreground: tokens['text-secondary'],
      background: tokens['surface-secondary'],
      type: 'text',
      minRatio: 4.5,
    },

    // Tertiary text on surfaces (often used for hints, captions)
    {
      name: 'text-tertiary on surface-primary',
      foreground: tokens['text-tertiary'],
      background: tokens['surface-primary'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'text-tertiary on surface-secondary',
      foreground: tokens['text-tertiary'],
      background: tokens['surface-secondary'],
      type: 'text',
      minRatio: 4.5,
    },

    // Disabled text
    {
      name: 'text-disabled on surface-primary',
      foreground: tokens['text-disabled'],
      background: tokens['surface-primary'],
      type: 'ui',
      minRatio: 3.0,
    },

    // Placeholder text
    {
      name: 'input-placeholder on input-bg',
      foreground: tokens['input-placeholder'],
      background: tokens['input-bg'],
      type: 'text',
      minRatio: 4.5,
    },

    // Interactive colors
    {
      name: 'interactive-primary on surface-primary',
      foreground: tokens['interactive-primary'],
      background: tokens['surface-primary'],
      type: 'ui',
      minRatio: 3.0,
    },

    // Border visibility
    {
      name: 'border-default on surface-primary',
      foreground: tokens['border-default'],
      background: tokens['surface-primary'],
      type: 'ui',
      minRatio: 3.0,
    },
    {
      name: 'border-default on surface-secondary',
      foreground: tokens['border-default'],
      background: tokens['surface-secondary'],
      type: 'ui',
      minRatio: 3.0,
    },

    // Semantic colors on light backgrounds
    {
      name: 'success on success-light',
      foreground: tokens['success'],
      background: tokens['success-light'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'warning on warning-light',
      foreground: tokens['warning'],
      background: tokens['warning-light'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'error on error-light',
      foreground: tokens['error'],
      background: tokens['error-light'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'info on info-light',
      foreground: tokens['info'],
      background: tokens['info-light'],
      type: 'text',
      minRatio: 4.5,
    },

    // Priority colors on their backgrounds
    {
      name: 'priority-p1 on priority-p1-bg',
      foreground: tokens['priority-p1'],
      background: tokens['priority-p1-bg'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'priority-p2 on priority-p2-bg',
      foreground: tokens['priority-p2'],
      background: tokens['priority-p2-bg'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'priority-p3 on priority-p3-bg',
      foreground: tokens['priority-p3'],
      background: tokens['priority-p3-bg'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'priority-p4 on priority-p4-bg',
      foreground: tokens['priority-p4'],
      background: tokens['priority-p4-bg'],
      type: 'text',
      minRatio: 4.5,
    },

    // Priority colors on surface-primary (for badges, icons)
    {
      name: 'priority-p1 on surface-primary',
      foreground: tokens['priority-p1'],
      background: tokens['surface-primary'],
      type: 'ui',
      minRatio: 3.0,
    },
    {
      name: 'priority-p2 on surface-primary',
      foreground: tokens['priority-p2'],
      background: tokens['surface-primary'],
      type: 'ui',
      minRatio: 3.0,
    },
    {
      name: 'priority-p3 on surface-primary',
      foreground: tokens['priority-p3'],
      background: tokens['surface-primary'],
      type: 'ui',
      minRatio: 3.0,
    },
    {
      name: 'priority-p4 on surface-primary',
      foreground: tokens['priority-p4'],
      background: tokens['surface-primary'],
      type: 'ui',
      minRatio: 3.0,
    },

    // Sidebar
    {
      name: 'sidebar-text on sidebar-bg',
      foreground: tokens['sidebar-text'],
      background: tokens['sidebar-bg'],
      type: 'text',
      minRatio: 4.5,
    },
    {
      name: 'sidebar-text-muted on sidebar-bg',
      foreground: tokens['sidebar-text-muted'],
      background: tokens['sidebar-bg'],
      type: 'text',
      minRatio: 4.5,
    },

    // Tooltip
    {
      name: 'tooltip-text on tooltip-bg',
      foreground: tokens['tooltip-text'],
      background: tokens['tooltip-bg'],
      type: 'text',
      minRatio: 4.5,
    },
  ]
}

function runAudit() {
  console.log('='.repeat(80))
  console.log('WCAG AA Contrast Ratio Audit')
  console.log('='.repeat(80))
  console.log('Requirements: Text 4.5:1 | Large Text 3:1 | UI Components 3:1')
  console.log('='.repeat(80))

  const modes = [
    { name: 'LIGHT MODE', tokens: lightModeTokens },
    { name: 'DARK MODE', tokens: darkModeTokens },
  ]

  const issues: { mode: string; combination: string; ratio: number; required: number }[] = []

  for (const mode of modes) {
    console.log(`\n${'─'.repeat(80)}`)
    console.log(`${mode.name}`)
    console.log('─'.repeat(80))

    const combinations = getCombinations(mode.tokens)

    for (const combo of combinations) {
      const ratio = getContrastRatio(combo.foreground, combo.background)

      if (ratio === null) {
        console.log(`⚠️  ${combo.name}: Could not calculate (invalid color format)`)
        continue
      }

      const passes = ratio >= combo.minRatio
      const status = passes ? '✅' : '❌'
      const ratioStr = ratio.toFixed(2)

      console.log(`${status} ${combo.name}`)
      console.log(`   Ratio: ${ratioStr}:1 (required: ${combo.minRatio}:1)`)
      console.log(`   Colors: ${combo.foreground} on ${combo.background}`)

      if (!passes) {
        issues.push({
          mode: mode.name,
          combination: combo.name,
          ratio: parseFloat(ratioStr),
          required: combo.minRatio,
        })
      }
    }
  }

  console.log(`\n${'='.repeat(80)}`)
  console.log('SUMMARY')
  console.log('='.repeat(80))

  if (issues.length === 0) {
    console.log('✅ All color combinations pass WCAG AA requirements!')
  } else {
    console.log(`❌ ${issues.length} contrast issues found:\n`)
    for (const issue of issues) {
      console.log(`  • [${issue.mode}] ${issue.combination}`)
      console.log(`    Current: ${issue.ratio}:1, Required: ${issue.required}:1`)
    }
  }

  console.log('\n')
}

runAudit()
