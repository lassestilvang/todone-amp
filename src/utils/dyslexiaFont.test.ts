import { describe, it, expect, beforeEach } from 'bun:test'
import {
  isDyslexiaFontEnabled,
  enableDyslexiaFont,
  disableDyslexiaFont,
  applyDyslexiaFont,
  removeDyslexiaFont,
  toggleDyslexiaFont,
  initializeDyslexiaFont,
} from './dyslexiaFont'

describe('Dyslexia Font Utilities', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    // Remove dyslexia font class if present
    document.documentElement.classList.remove('dyslexia-font')
    // Remove style tag if present
    const styleTag = document.getElementById('dyslexia-font-styles')
    if (styleTag) {
      styleTag.remove()
    }
  })

  describe('isDyslexiaFontEnabled', () => {
    it('should return false by default', () => {
      expect(isDyslexiaFontEnabled()).toBe(false)
    })

    it('should return true when enabled', () => {
      localStorage.setItem('enableDyslexiaFont', 'true')
      expect(isDyslexiaFontEnabled()).toBe(true)
    })

    it('should return false when explicitly disabled', () => {
      localStorage.setItem('enableDyslexiaFont', 'false')
      expect(isDyslexiaFontEnabled()).toBe(false)
    })
  })

  describe('enableDyslexiaFont', () => {
    it('should set localStorage flag', () => {
      enableDyslexiaFont()
      expect(localStorage.getItem('enableDyslexiaFont')).toBe('true')
    })

    it('should add dyslexia-font class to html', () => {
      enableDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(true)
    })

    it('should create style tag', () => {
      enableDyslexiaFont()
      const styleTag = document.getElementById('dyslexia-font-styles')
      expect(styleTag).not.toBeNull()
    })

    it('should add style content', () => {
      enableDyslexiaFont()
      const styleTag = document.getElementById('dyslexia-font-styles')
      expect(styleTag?.textContent).toContain('OpenDyslexic')
    })
  })

  describe('disableDyslexiaFont', () => {
    beforeEach(() => {
      enableDyslexiaFont()
    })

    it('should set localStorage flag to false', () => {
      disableDyslexiaFont()
      expect(localStorage.getItem('enableDyslexiaFont')).toBe('false')
    })

    it('should remove dyslexia-font class from html', () => {
      disableDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(false)
    })

    it('should remove style tag', () => {
      disableDyslexiaFont()
      const styleTag = document.getElementById('dyslexia-font-styles')
      expect(styleTag).toBeNull()
    })
  })

  describe('applyDyslexiaFont', () => {
    it('should add dyslexia-font class to html', () => {
      applyDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(true)
    })

    it('should create style tag if not present', () => {
      applyDyslexiaFont()
      expect(document.getElementById('dyslexia-font-styles')).not.toBeNull()
    })

    it('should not duplicate style tag', () => {
      applyDyslexiaFont()
      applyDyslexiaFont()
      const styleTags = document.querySelectorAll('#dyslexia-font-styles')
      expect(styleTags.length).toBe(1)
    })
  })

  describe('removeDyslexiaFont', () => {
    beforeEach(() => {
      applyDyslexiaFont()
    })

    it('should remove dyslexia-font class', () => {
      removeDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(false)
    })

    it('should remove style tag', () => {
      removeDyslexiaFont()
      expect(document.getElementById('dyslexia-font-styles')).toBeNull()
    })
  })

  describe('toggleDyslexiaFont', () => {
    it('should enable font when disabled', () => {
      const result = toggleDyslexiaFont()
      expect(result).toBe(true)
      expect(isDyslexiaFontEnabled()).toBe(true)
    })

    it('should disable font when enabled', () => {
      enableDyslexiaFont()
      const result = toggleDyslexiaFont()
      expect(result).toBe(false)
      expect(isDyslexiaFontEnabled()).toBe(false)
    })

    it('should return correct state on multiple toggles', () => {
      expect(toggleDyslexiaFont()).toBe(true)
      expect(toggleDyslexiaFont()).toBe(false)
      expect(toggleDyslexiaFont()).toBe(true)
    })

    it('should apply/remove class on toggle', () => {
      toggleDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(true)

      toggleDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(false)
    })
  })

  describe('initializeDyslexiaFont', () => {
    it('should apply font if enabled in localStorage', () => {
      localStorage.setItem('enableDyslexiaFont', 'true')
      initializeDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(true)
    })

    it('should not apply font if disabled in localStorage', () => {
      localStorage.setItem('enableDyslexiaFont', 'false')
      initializeDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(false)
    })

    it('should handle missing localStorage', () => {
      initializeDyslexiaFont()
      expect(document.documentElement.classList.contains('dyslexia-font')).toBe(false)
    })
  })
})
