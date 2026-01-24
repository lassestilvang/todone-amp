import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'bun:test'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('renders image when src provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User avatar" />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(img).toHaveAttribute('alt', 'User avatar')
  })

  it('shows initials fallback when no src', () => {
    render(<Avatar name="John Doe" />)
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveTextContent('JD')
    expect(avatar).toHaveAttribute('aria-label', 'John Doe')
  })

  it('shows initials when image fails to load', () => {
    render(<Avatar src="https://example.com/broken.jpg" name="Jane Smith" />)
    const img = screen.getByRole('img')
    expect(img.tagName).toBe('IMG')

    fireEvent.error(img)

    const fallback = screen.getByRole('img')
    expect(fallback.tagName).toBe('DIV')
    expect(fallback).toHaveTextContent('JS')
  })

  describe('size variants', () => {
    it('renders xs size', () => {
      render(<Avatar name="Test" size="xs" />)
      const avatar = screen.getByRole('img')
      expect(avatar).toHaveClass('h-6', 'w-6', 'text-xs')
    })

    it('renders sm size', () => {
      render(<Avatar name="Test" size="sm" />)
      const avatar = screen.getByRole('img')
      expect(avatar).toHaveClass('h-8', 'w-8', 'text-sm')
    })

    it('renders md size (default)', () => {
      render(<Avatar name="Test" />)
      const avatar = screen.getByRole('img')
      expect(avatar).toHaveClass('h-10', 'w-10', 'text-base')
    })

    it('renders lg size', () => {
      render(<Avatar name="Test" size="lg" />)
      const avatar = screen.getByRole('img')
      expect(avatar).toHaveClass('h-12', 'w-12', 'text-lg')
    })

    it('renders xl size', () => {
      render(<Avatar name="Test" size="xl" />)
      const avatar = screen.getByRole('img')
      expect(avatar).toHaveClass('h-16', 'w-16', 'text-xl')
    })
  })

  it('shows single initial for single name', () => {
    render(<Avatar name="Alice" />)
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveTextContent('A')
  })

  it('shows first and last initials for two-word name', () => {
    render(<Avatar name="John Doe" />)
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveTextContent('JD')
  })

  it('shows first and last initials for multi-word name', () => {
    render(<Avatar name="Mary Jane Watson" />)
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveTextContent('MW')
  })

  it('applies custom className', () => {
    render(<Avatar name="Test" className="custom-class" />)
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveClass('custom-class')
  })

  it('uses alt as fallback for name', () => {
    render(<Avatar alt="Fallback Name" />)
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveTextContent('FN')
    expect(avatar).toHaveAttribute('aria-label', 'Fallback Name')
  })

  it('shows ? when no name or alt provided', () => {
    render(<Avatar />)
    const avatar = screen.getByRole('img')
    expect(avatar).toHaveTextContent('?')
  })
})
