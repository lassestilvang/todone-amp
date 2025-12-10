/**
 * Accessibility utilities and WCAG 2.1 AA compliance helpers
 */

export interface AccessibilityIssue {
  level: 'error' | 'warning' | 'info'
  criterion: string
  element?: HTMLElement
  message: string
  suggestion: string
}

/**
 * Check for common accessibility issues in the application
 * Based on WCAG 2.1 Level AA standards
 */
export const getAccessibilityIssues = (): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = []

  // 1. Check for missing alt attributes on images
  const images = document.querySelectorAll('img:not([alt])')
  images.forEach((img) => {
    issues.push({
      level: 'error',
      criterion: '1.1.1 Non-text Content (WCAG 2.1 A)',
      element: img as HTMLElement,
      message: 'Image missing alt text',
      suggestion: 'Add descriptive alt text to all images',
    })
  })

  // 2. Check for buttons and links with no accessible name
  const buttons = document.querySelectorAll('button:not([aria-label]):not(:has(*))')
  buttons.forEach((btn) => {
    if (!btn.textContent?.trim()) {
      issues.push({
        level: 'error',
        criterion: '2.1.1 Keyboard (WCAG 2.1 A)',
        element: btn as HTMLElement,
        message: 'Button has no accessible name',
        suggestion: 'Add visible text or aria-label to button',
      })
    }
  })

  // 3. Check for form fields without labels
  const inputs = document.querySelectorAll('input, textarea, select')
  inputs.forEach((input) => {
    const hasLabel = document.querySelector(`label[for="${input.id}"]`)
    const hasAriaLabel = input.hasAttribute('aria-label')
    if (!hasLabel && !hasAriaLabel && input.id) {
      issues.push({
        level: 'warning',
        criterion: '3.3.2 Labels or Instructions (WCAG 2.1 A)',
        element: input as HTMLElement,
        message: 'Form field missing label',
        suggestion: 'Associate a label with this input field',
      })
    }
  })

  // 4. Check for insufficient color contrast (basic check)
  const colorIssues = checkColorContrast()
  issues.push(...colorIssues)

  // 5. Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  let previousLevel = 0
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1])
    if (index > 0 && level > previousLevel + 1) {
      issues.push({
        level: 'warning',
        criterion: '1.3.1 Info and Relationships (WCAG 2.1 A)',
        element: heading as HTMLElement,
        message: `Heading hierarchy skipped from H${previousLevel} to H${level}`,
        suggestion: 'Use sequential heading levels (H1 → H2 → H3, not H1 → H3)',
      })
    }
    previousLevel = level
  })

  // 6. Check for links with no discernible text
  const links = document.querySelectorAll('a[href]')
  links.forEach((link) => {
    const hasText = link.textContent?.trim()
    const hasAriaLabel = link.hasAttribute('aria-label')
    const hasTitle = link.hasAttribute('title')
    if (!hasText && !hasAriaLabel && !hasTitle) {
      issues.push({
        level: 'error',
        criterion: '2.4.4 Link Purpose (WCAG 2.1 A)',
        element: link as HTMLElement,
        message: 'Link has no discernible text',
        suggestion: 'Add visible link text or aria-label attribute',
      })
    }
  })

  // 7. Check for keyboard trappable elements
  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, [tabindex]'
  )
  focusableElements.forEach((element) => {
    const tabIndex = parseInt(element.getAttribute('tabindex') || '0')
    if (tabIndex > 0) {
      issues.push({
        level: 'warning',
        criterion: '2.4.3 Focus Order (WCAG 2.1 A)',
        element: element as HTMLElement,
        message: 'Element uses positive tabindex value',
        suggestion: 'Avoid positive tabindex values; rely on DOM order instead',
      })
    }
  })

  // 8. Check for language specification
  const htmlElement = document.documentElement
  if (!htmlElement.hasAttribute('lang')) {
    issues.push({
      level: 'error',
      criterion: '3.1.1 Language of Page (WCAG 2.1 A)',
      element: htmlElement,
      message: 'Document language not specified',
      suggestion: 'Add lang attribute to html element (e.g., lang="en")',
    })
  }

  // 9. Check for skip links
  const skipLink = document.querySelector('a[href="#main"], a.skip-link')
  if (!skipLink) {
    issues.push({
      level: 'warning',
      criterion: '2.4.1 Bypass Blocks (WCAG 2.1 A)',
      message: 'No skip-to-main-content link found',
      suggestion: 'Add a skip link to allow users to bypass navigation',
    })
  }

  // 10. Check for ARIA attributes usage
  const elementsWithAriaHidden = document.querySelectorAll('[aria-hidden="true"]')
  elementsWithAriaHidden.forEach((element) => {
    const focusableChild = element.querySelector(
      'button, a[href], input:not([type="hidden"]), textarea, select'
    )
    if (focusableChild) {
      issues.push({
        level: 'error',
        criterion: '2.1.1 Keyboard (WCAG 2.1 A)',
        element: element as HTMLElement,
        message: 'Focusable element inside aria-hidden container',
        suggestion: 'Remove aria-hidden from container or move focusable content outside',
      })
    }
  })

  // 6. Check for keyboard navigation support
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea')
  let keyboardIssueCount = 0
  interactiveElements.forEach((el) => {
    if (parseInt(window.getComputedStyle(el).zIndex) > 0 && !hasKeyboardAccess(el as HTMLElement)) {
      keyboardIssueCount++
    }
  })

  if (keyboardIssueCount > 0) {
    issues.push({
      level: 'warning',
      criterion: '2.1.1 Keyboard (WCAG 2.1 A)',
      message: `${keyboardIssueCount} interactive element(s) may not be keyboard accessible`,
      suggestion: 'Ensure all interactive elements are reachable via keyboard Tab navigation',
    })
  }

  return issues
}

/**
 * Check for color contrast issues
 * WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
 */
function checkColorContrast(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = []

  const textElements = document.querySelectorAll('p, span, a, button, label')
  textElements.forEach((el) => {
    if (!el.textContent?.trim()) return

    const styles = window.getComputedStyle(el)
    const bgColor = styles.backgroundColor
    const textColor = styles.color
    const fontSize = parseFloat(styles.fontSize)
    const fontWeight = parseInt(styles.fontWeight) || 400

    // Simple heuristic: if both are similar to default, it might be okay
    // This is a basic check; real contrast calculation is more complex
    if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
      // No background color set, skip
      return
    }

    // For demo purposes, flag potential issues with specific color combinations
    if (bgColor.includes('gray') && textColor.includes('gray')) {
      const isLargeText = fontSize > 18 || (fontSize > 14 && fontWeight > 700)
      if (!isLargeText) {
        issues.push({
          level: 'info',
          criterion: '1.4.3 Contrast (Minimum) (WCAG 2.1 AA)',
          element: el as HTMLElement,
          message: 'Text color combination may have insufficient contrast',
          suggestion: 'Verify text and background colors meet 4.5:1 contrast ratio for normal text',
        })
      }
    }
  })

  return issues
}

/**
 * Check if an element has keyboard access
 */
function hasKeyboardAccess(element: HTMLElement): boolean {
  const tabindex = element.getAttribute('tabindex')
  const isNativelyFocusable =
    ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) &&
    !element.hasAttribute('disabled')

  return isNativelyFocusable || (tabindex !== null && parseInt(tabindex) >= 0)
}

/**
 * Generate an accessibility report
 */
export const generateAccessibilityReport = (): {
  summary: string
  errors: number
  warnings: number
  infos: number
  issues: AccessibilityIssue[]
} => {
  const issues = getAccessibilityIssues()
  const errors = issues.filter((i) => i.level === 'error').length
  const warnings = issues.filter((i) => i.level === 'warning').length
  const infos = issues.filter((i) => i.level === 'info').length

  const summary =
    errors === 0 && warnings === 0
      ? '✓ No accessibility issues detected'
      : `Found ${errors} error(s), ${warnings} warning(s), and ${infos} info message(s)`

  return { summary, errors, warnings, infos, issues }
}

/**
 * Apply common accessibility fixes
 */
export const applyAccessibilityFixes = () => {
  // Add skip to main content link if missing
  if (!document.querySelector('[href="#main-content"]')) {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50'
    skipLink.textContent = 'Skip to main content'
    document.body.insertBefore(skipLink, document.body.firstChild)
  }

  // Ensure main content has id
  const main = document.querySelector('main')
  if (main && !main.id) {
    main.id = 'main-content'
  }

  // Add role="main" if main element doesn't exist
  if (!document.querySelector('main') && !document.querySelector('[role="main"]')) {
    const firstSection = document.querySelector('section')
    if (firstSection && !firstSection.hasAttribute('role')) {
      firstSection.setAttribute('role', 'main')
    }
  }
}
