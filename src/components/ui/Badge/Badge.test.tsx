import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'bun:test'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText('Default')
    expect(badge).toHaveClass('bg-surface-tertiary', 'text-content-secondary')
  })

  describe('variants', () => {
    it('applies primary variant styles', () => {
      render(<Badge variant="primary">Primary</Badge>)
      const badge = screen.getByText('Primary')
      expect(badge).toHaveClass('bg-brand-100', 'text-brand-700')
    })

    it('applies success variant styles', () => {
      render(<Badge variant="success">Success</Badge>)
      const badge = screen.getByText('Success')
      expect(badge).toHaveClass('bg-semantic-success-light', 'text-semantic-success')
    })

    it('applies warning variant styles', () => {
      render(<Badge variant="warning">Warning</Badge>)
      const badge = screen.getByText('Warning')
      expect(badge).toHaveClass('bg-semantic-warning-light', 'text-semantic-warning')
    })

    it('applies error variant styles', () => {
      render(<Badge variant="error">Error</Badge>)
      const badge = screen.getByText('Error')
      expect(badge).toHaveClass('bg-semantic-error-light', 'text-semantic-error')
    })

    it('applies info variant styles', () => {
      render(<Badge variant="info">Info</Badge>)
      const badge = screen.getByText('Info')
      expect(badge).toHaveClass('bg-semantic-info-light', 'text-semantic-info')
    })
  })

  describe('sizes', () => {
    it('applies small size styles', () => {
      render(<Badge size="sm">Small</Badge>)
      const badge = screen.getByText('Small')
      expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-xs')
    })

    it('applies medium size styles by default', () => {
      render(<Badge>Medium</Badge>)
      const badge = screen.getByText('Medium')
      expect(badge).toHaveClass('px-2', 'py-0.5', 'text-sm')
    })

    it('applies large size styles', () => {
      render(<Badge size="lg">Large</Badge>)
      const badge = screen.getByText('Large')
      expect(badge).toHaveClass('px-2.5', 'py-1', 'text-sm')
    })
  })

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-class')
  })

  it('has correct displayName', () => {
    expect(Badge.displayName).toBe('Badge')
  })
})
