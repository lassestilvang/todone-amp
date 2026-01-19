/**
 * Accessible Chart Colors
 *
 * Color palettes optimized for distinguishability across different types of
 * color vision deficiency. These colors are chosen to be distinguishable for:
 * - Normal vision
 * - Protanopia (red-blind)
 * - Deuteranopia (green-blind)
 * - Tritanopia (blue-blind)
 *
 * The palettes use a combination of hue and luminance differences to ensure
 * colors remain distinguishable even when hue perception is impaired.
 *
 * Based on ColorBrewer 2.0 and research from:
 * - https://colorbrewer2.org
 * - https://www.nature.com/articles/nmeth.1618
 */

/**
 * Primary chart palette - 8 colors optimized for colorblind accessibility
 * These colors have sufficient luminance contrast and hue variation
 */
export const CHART_COLORS = {
  // Blue - universally distinguishable
  blue: '#2563eb',
  // Orange - distinct from blue in all CVD types
  orange: '#ea580c',
  // Teal/Cyan - distinct from both blue and green
  teal: '#0d9488',
  // Purple - distinguishable by luminance
  purple: '#7c3aed',
  // Pink/Magenta - distinct from red for protanopia
  pink: '#db2777',
  // Yellow - high luminance, distinct from all others
  yellow: '#ca8a04',
  // Gray - neutral, distinguishable by luminance
  gray: '#6b7280',
  // Dark blue - darker variant for contrast
  darkBlue: '#1e40af',
} as const

/**
 * Semantic chart colors for status/comparison charts
 * Optimized for colorblind accessibility
 */
export const CHART_SEMANTIC_COLORS = {
  // Green optimized for visibility in deuteranopia
  success: '#059669',
  // Blue is universally safe
  primary: '#2563eb',
  // Orange is distinguishable from green/red confusion
  warning: '#d97706',
  // Red-pink hybrid visible in protanopia
  error: '#dc2626',
  // Neutral for comparisons
  neutral: '#6b7280',
} as const

/**
 * Two-color palette for comparison charts (e.g., current vs previous)
 * Blue and orange are the most universally distinguishable pair
 */
export const CHART_COMPARISON_COLORS = {
  current: '#2563eb', // Blue
  previous: '#ea580c', // Orange
} as const

/**
 * Productivity chart colors
 * Blue for "created" and teal for "completed" - distinguishable in all CVD types
 */
export const CHART_PRODUCTIVITY_COLORS = {
  completed: '#059669', // Teal-green - success semantic
  created: '#2563eb', // Blue - primary semantic
} as const

/**
 * Get an array of chart colors for pie/bar charts with multiple categories
 * @param count - Number of colors needed
 * @returns Array of hex color strings
 */
export function getChartColorArray(count: number): string[] {
  const colors = [
    CHART_COLORS.blue,
    CHART_COLORS.orange,
    CHART_COLORS.teal,
    CHART_COLORS.purple,
    CHART_COLORS.pink,
    CHART_COLORS.yellow,
    CHART_COLORS.gray,
    CHART_COLORS.darkBlue,
  ]

  // If more colors needed than available, cycle through
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length])
  }
  return result
}

/**
 * Chart color with pattern support for additional distinguishability
 * Useful when colors alone are not sufficient (e.g., printing, severe CVD)
 */
export interface ChartColorWithPattern {
  fill: string
  pattern?: 'solid' | 'diagonal' | 'dots' | 'horizontal'
}

/**
 * Get colors with patterns for maximum accessibility
 */
export function getChartColorsWithPatterns(count: number): ChartColorWithPattern[] {
  const patterns: ChartColorWithPattern['pattern'][] = ['solid', 'diagonal', 'dots', 'horizontal']
  const colors = getChartColorArray(count)

  return colors.map((fill, index) => ({
    fill,
    pattern: patterns[index % patterns.length],
  }))
}

/**
 * Gradient definitions for area charts
 * Each gradient uses a single color with opacity variation
 */
export const CHART_GRADIENTS = {
  completed: {
    id: 'gradientCompleted',
    color: CHART_PRODUCTIVITY_COLORS.completed,
    startOpacity: 0.8,
    endOpacity: 0.1,
  },
  created: {
    id: 'gradientCreated',
    color: CHART_PRODUCTIVITY_COLORS.created,
    startOpacity: 0.8,
    endOpacity: 0.1,
  },
} as const
