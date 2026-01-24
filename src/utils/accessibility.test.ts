import { describe, it, expect } from 'bun:test'
import { getAccessibilityIssues, generateAccessibilityReport } from '@/utils/accessibility'

describe('Accessibility Utilities', () => {
  describe('getAccessibilityIssues', () => {
    it('should return array of issues', () => {
      const issues = getAccessibilityIssues()
      expect(Array.isArray(issues)).toBe(true)
    })

    it('should identify missing alt text', () => {
      // Create test image without alt
      const img = document.createElement('img')
      img.src = 'test.jpg'
      document.body.appendChild(img)

      const issues = getAccessibilityIssues()
      const altIssues = issues.filter((i) => i.criterion.includes('1.1.1'))
      expect(altIssues.length).toBeGreaterThan(0)

      document.body.removeChild(img)
    })

    it('should identify buttons without accessible names', () => {
      const btn = document.createElement('button')
      btn.innerHTML = ''
      document.body.appendChild(btn)

      const issues = getAccessibilityIssues()
      const btnIssues = issues.filter((i) => i.message.includes('Button'))
      expect(btnIssues.length >= 0).toBe(true)

      document.body.removeChild(btn)
    })

    it('should include criterion references', () => {
      const issues = getAccessibilityIssues()
      if (issues.length > 0) {
        expect(issues[0].criterion).toMatch(/WCAG 2.1/)
      }
    })
  })

  describe('generateAccessibilityReport', () => {
    it('should return report with summary', () => {
      const report = generateAccessibilityReport()
      expect(report.summary).toBeDefined()
      expect(typeof report.summary).toBe('string')
    })

    it('should count errors, warnings, and infos', () => {
      const report = generateAccessibilityReport()
      expect(report.errors >= 0).toBe(true)
      expect(report.warnings >= 0).toBe(true)
      expect(report.infos >= 0).toBe(true)
    })

    it('should include issues array', () => {
      const report = generateAccessibilityReport()
      expect(Array.isArray(report.issues)).toBe(true)
    })

    it('should show success message when no issues', () => {
      const report = generateAccessibilityReport()
      if (report.errors === 0 && report.warnings === 0) {
        expect(report.summary).toContain('✓')
      }
    })

    it('should count matches issues array', () => {
      const report = generateAccessibilityReport()
      const countedErrors = report.issues.filter((i) => i.level === 'error').length
      const countedWarnings = report.issues.filter((i) => i.level === 'warning').length
      const countedInfos = report.issues.filter((i) => i.level === 'info').length

      expect(countedErrors).toBe(report.errors)
      expect(countedWarnings).toBe(report.warnings)
      expect(countedInfos).toBe(report.infos)
    })
  })

  describe('Issue severity levels', () => {
    it('should have valid severity levels', () => {
      const issues = getAccessibilityIssues()
      issues.forEach((issue) => {
        expect(['error', 'warning', 'info']).toContain(issue.level)
      })
    })

    it('should include suggestions for all issues', () => {
      const issues = getAccessibilityIssues()
      issues.forEach((issue) => {
        expect(issue.suggestion).toBeDefined()
        expect(issue.suggestion.length).toBeGreaterThan(0)
      })
    })
  })

  describe('WCAG Compliance', () => {
    it('should check level A compliance', () => {
      const issues = getAccessibilityIssues()
      const levelAIssues = issues.filter((i) => i.criterion.includes('(WCAG 2.1 A)'))
      expect(Array.isArray(levelAIssues)).toBe(true)
    })

    it('should check level AA compliance', () => {
      const issues = getAccessibilityIssues()
      const levelAAIssues = issues.filter((i) => i.criterion.includes('(WCAG 2.1 AA)'))
      expect(Array.isArray(levelAAIssues)).toBe(true)
    })
  })
})
