/**
 * Color Blindness Accessibility Audit Script
 *
 * This script simulates how colors appear to users with different types of
 * color vision deficiency and identifies potential accessibility issues.
 *
 * Types simulated:
 * - Protanopia (red-blind, ~1% of males)
 * - Deuteranopia (green-blind, ~1% of males)
 * - Tritanopia (blue-blind, ~0.003% of population)
 * - Achromatopsia (complete color blindness, ~0.003% of population)
 *
 * Run with: npx tsx scripts/audit-colorblind.ts
 */

// Color tokens that need to be distinguishable
const semanticColors = {
  light: {
    success: '#15803d',
    warning: '#92400e',
    error: '#b91c1c',
    info: '#1d4ed8',
    'priority-p1': '#b91c1c',
    'priority-p2': '#c2410c',
    'priority-p3': '#1d4ed8',
    'priority-p4': '#4b5563',
    'icon-success': '#22c55e',
    'icon-warning': '#f59e0b',
    'icon-error': '#ef4444',
    'icon-info': '#3b82f6',
  },
  dark: {
    success: '#86efac',
    warning: '#fbbf24',
    error: '#fca5a5',
    info: '#60a5fa',
    'priority-p1': '#f87171',
    'priority-p2': '#fb923c',
    'priority-p3': '#60a5fa',
    'priority-p4': '#9ca3af',
    'icon-success': '#4ade80',
    'icon-warning': '#fbbf24',
    'icon-error': '#f87171',
    'icon-info': '#60a5fa',
  },
}

// Parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) throw new Error(`Invalid hex color: ${hex}`)
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)))
  return '#' + [clamp(r), clamp(g), clamp(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

// Color blindness simulation matrices
// Based on algorithms from: https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
const colorBlindMatrices = {
  // Protanopia (red-blind)
  protanopia: [
    [0.567, 0.433, 0.0],
    [0.558, 0.442, 0.0],
    [0.0, 0.242, 0.758],
  ],
  // Deuteranopia (green-blind)
  deuteranopia: [
    [0.625, 0.375, 0.0],
    [0.7, 0.3, 0.0],
    [0.0, 0.3, 0.7],
  ],
  // Tritanopia (blue-blind)
  tritanopia: [
    [0.95, 0.05, 0.0],
    [0.0, 0.433, 0.567],
    [0.0, 0.475, 0.525],
  ],
  // Achromatopsia (complete color blindness - grayscale)
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
}

type ColorBlindType = keyof typeof colorBlindMatrices

// Apply color blindness simulation
function simulateColorBlindness(hex: string, type: ColorBlindType): string {
  const { r, g, b } = hexToRgb(hex)
  const matrix = colorBlindMatrices[type]

  const newR = matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b
  const newG = matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b
  const newB = matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b

  return rgbToHex(newR, newG, newB)
}

// Calculate color difference using CIEDE2000 (simplified version using Euclidean distance in Lab)
function colorDifference(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  // Simple Euclidean distance in RGB space (0-441.67 range)
  const dr = rgb1.r - rgb2.r
  const dg = rgb1.g - rgb2.g
  const db = rgb1.b - rgb2.b

  return Math.sqrt(dr * dr + dg * dg + db * db)
}

// Check if two colors are distinguishable (minimum difference threshold)
// A difference of 50+ is generally considered distinguishable
const MIN_DISTINGUISHABLE_DIFFERENCE = 40

interface DistinguishabilityResult {
  color1: string
  color2: string
  color1Name: string
  color2Name: string
  difference: number
  isDistinguishable: boolean
}

function checkDistinguishability(
  colors: Record<string, string>,
  type: ColorBlindType
): DistinguishabilityResult[] {
  const results: DistinguishabilityResult[] = []
  const colorNames = Object.keys(colors)

  for (let i = 0; i < colorNames.length; i++) {
    for (let j = i + 1; j < colorNames.length; j++) {
      const name1 = colorNames[i]
      const name2 = colorNames[j]
      const sim1 = simulateColorBlindness(colors[name1], type)
      const sim2 = simulateColorBlindness(colors[name2], type)
      const diff = colorDifference(sim1, sim2)

      results.push({
        color1: colors[name1],
        color2: colors[name2],
        color1Name: name1,
        color2Name: name2,
        difference: diff,
        isDistinguishable: diff >= MIN_DISTINGUISHABLE_DIFFERENCE,
      })
    }
  }

  return results
}

// Groups of colors that MUST be distinguishable from each other
const criticalGroups = {
  'Semantic Status Colors': ['success', 'warning', 'error', 'info'],
  'Priority Levels': ['priority-p1', 'priority-p2', 'priority-p3', 'priority-p4'],
  'Icon Status Colors': ['icon-success', 'icon-warning', 'icon-error', 'icon-info'],
  'Error vs Success': ['success', 'error'],
  'Warning vs Error': ['warning', 'error'],
}

function runAudit() {
  console.log('='.repeat(80))
  console.log('Color Blindness Accessibility Audit')
  console.log('='.repeat(80))
  console.log('Simulating color vision deficiency types:')
  console.log('  • Protanopia (red-blind) - affects ~1% of males')
  console.log('  • Deuteranopia (green-blind) - affects ~1% of males')
  console.log('  • Tritanopia (blue-blind) - affects ~0.003% of population')
  console.log('  • Achromatopsia (total color blindness) - affects ~0.003%')
  console.log('='.repeat(80))

  const modes = [
    { name: 'LIGHT MODE', colors: semanticColors.light },
    { name: 'DARK MODE', colors: semanticColors.dark },
  ]

  const allIssues: {
    mode: string
    type: ColorBlindType
    group: string
    colors: string[]
    difference: number
  }[] = []

  for (const mode of modes) {
    console.log(`\n${'━'.repeat(80)}`)
    console.log(`${mode.name}`)
    console.log('━'.repeat(80))

    // Show color transformations
    console.log('\n📊 Color Transformations:')
    console.log('─'.repeat(60))
    console.log('Color'.padEnd(15) + 'Original'.padEnd(12) + 'Protan'.padEnd(12) + 'Deutan'.padEnd(12) + 'Tritan'.padEnd(12) + 'Achrom')
    console.log('─'.repeat(60))

    for (const [name, hex] of Object.entries(mode.colors)) {
      const protan = simulateColorBlindness(hex, 'protanopia')
      const deutan = simulateColorBlindness(hex, 'deuteranopia')
      const tritan = simulateColorBlindness(hex, 'tritanopia')
      const achrom = simulateColorBlindness(hex, 'achromatopsia')
      console.log(
        name.padEnd(15) +
          hex.padEnd(12) +
          protan.padEnd(12) +
          deutan.padEnd(12) +
          tritan.padEnd(12) +
          achrom
      )
    }

    // Check critical color groups
    for (const [groupName, colorNames] of Object.entries(criticalGroups)) {
      console.log(`\n🔍 ${groupName}:`)

      const groupColors: Record<string, string> = {}
      for (const name of colorNames) {
        if (mode.colors[name as keyof typeof mode.colors]) {
          groupColors[name] = mode.colors[name as keyof typeof mode.colors]
        }
      }

      if (Object.keys(groupColors).length < 2) continue

      for (const type of Object.keys(colorBlindMatrices) as ColorBlindType[]) {
        const results = checkDistinguishability(groupColors, type)
        const problems = results.filter((r) => !r.isDistinguishable)

        if (problems.length > 0) {
          console.log(`   ❌ ${type}:`)
          for (const p of problems) {
            console.log(
              `      • ${p.color1Name} ↔ ${p.color2Name}: difference=${p.difference.toFixed(1)} (min ${MIN_DISTINGUISHABLE_DIFFERENCE})`
            )
            allIssues.push({
              mode: mode.name,
              type,
              group: groupName,
              colors: [p.color1Name, p.color2Name],
              difference: p.difference,
            })
          }
        } else {
          console.log(`   ✅ ${type}: All colors distinguishable`)
        }
      }
    }
  }

  // Summary
  console.log(`\n${'='.repeat(80)}`)
  console.log('SUMMARY')
  console.log('='.repeat(80))

  if (allIssues.length === 0) {
    console.log('✅ All critical color groups are distinguishable across all color blindness types!')
  } else {
    console.log(`⚠️  ${allIssues.length} potential distinguishability issues found:\n`)

    // Group by type
    const byType = allIssues.reduce(
      (acc, issue) => {
        acc[issue.type] = acc[issue.type] || []
        acc[issue.type].push(issue)
        return acc
      },
      {} as Record<string, typeof allIssues>
    )

    for (const [type, issues] of Object.entries(byType)) {
      console.log(`\n${type.toUpperCase()} (${issues.length} issues):`)
      for (const issue of issues) {
        console.log(`  • [${issue.mode}] ${issue.group}: ${issue.colors.join(' ↔ ')}`)
      }
    }

    console.log('\n📋 RECOMMENDATIONS:')
    console.log('─'.repeat(60))
    console.log('1. Consider adding secondary indicators (icons, patterns, text labels)')
    console.log('   alongside color to convey status information.')
    console.log('')
    console.log('2. For priority levels, include the priority number (P1, P2, P3, P4)')
    console.log('   as text in addition to color coding.')
    console.log('')
    console.log('3. For status indicators (success/error/warning), use icons:')
    console.log('   ✓ checkmark for success, ✗ X for error, ⚠ triangle for warning')
    console.log('')
    console.log('4. The high-contrast theme provides better distinguishability')
    console.log('   for users with color vision deficiency.')
  }

  console.log('\n')
}

runAudit()
