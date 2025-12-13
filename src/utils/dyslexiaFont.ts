/**
 * Utilities for dyslexia-friendly font support
 * Implements OpenDyslexic font family for better readability
 * WCAG 2.1 Level AAA: Enhanced visual presentation
 */

/**
 * Check if dyslexia-friendly font is enabled
 * @returns boolean - true if dyslexia font is enabled
 */
export const isDyslexiaFontEnabled = (): boolean => {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem('enableDyslexiaFont') === 'true'
}

/**
 * Enable dyslexia-friendly font globally
 */
export const enableDyslexiaFont = (): void => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('enableDyslexiaFont', 'true')
  applyDyslexiaFont()
}

/**
 * Disable dyslexia-friendly font globally
 */
export const disableDyslexiaFont = (): void => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem('enableDyslexiaFont', 'false')
  removeDyslexiaFont()
}

/**
 * Apply dyslexia-friendly font to the document
 */
export const applyDyslexiaFont = (): void => {
  if (typeof document === 'undefined') return

  // Add dyslexia-friendly font class to html element
  document.documentElement.classList.add('dyslexia-font')

  // Create or update style tag for OpenDyslexic font
  let styleTag = document.getElementById('dyslexia-font-styles')
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = 'dyslexia-font-styles'
    styleTag.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=OpenDyslexic:wght@400;700&display=swap');
      
      html.dyslexia-font {
        --font-sans: 'OpenDyslexic', 'system-ui', 'sans-serif';
      }
      
      html.dyslexia-font,
      html.dyslexia-font * {
        font-family: var(--font-sans) !important;
        font-size: 1.05em;
        letter-spacing: 0.05em;
        line-height: 1.6;
      }
      
      html.dyslexia-font button,
      html.dyslexia-font input,
      html.dyslexia-font textarea,
      html.dyslexia-font select {
        font-family: var(--font-sans) !important;
      }
    `
    document.head.appendChild(styleTag)
  }
}

/**
 * Remove dyslexia-friendly font from the document
 */
export const removeDyslexiaFont = (): void => {
  if (typeof document === 'undefined') return

  // Remove dyslexia-friendly font class from html element
  document.documentElement.classList.remove('dyslexia-font')

  // Remove style tag (optional, can keep it for reuse)
  const styleTag = document.getElementById('dyslexia-font-styles')
  if (styleTag) {
    styleTag.remove()
  }
}

/**
 * Toggle dyslexia-friendly font
 * @returns boolean - true if font is now enabled
 */
export const toggleDyslexiaFont = (): boolean => {
  const isEnabled = isDyslexiaFontEnabled()
  if (isEnabled) {
    disableDyslexiaFont()
    return false
  } else {
    enableDyslexiaFont()
    return true
  }
}

/**
 * Initialize dyslexia-friendly font based on saved preference
 */
export const initializeDyslexiaFont = (): void => {
  if (isDyslexiaFontEnabled()) {
    applyDyslexiaFont()
  }
}
