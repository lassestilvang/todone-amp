import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn utility', () => {
  it('should combine class names', () => {
    const result = cn('px-2', 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle undefined values', () => {
    const result = cn('px-2', undefined, 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle null values', () => {
    const result = cn('px-2', null, 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle boolean conditions', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('base')
    expect(result).toContain('active')
  })

  it('should handle objects', () => {
    const result = cn({
      'px-2': true,
      'py-1': true,
      'hidden': false,
    })
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle arrays', () => {
    const result = cn(['px-2', 'py-1'])
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle Tailwind merge conflicts', () => {
    // Tailwind merge should resolve padding conflicts
    const result = cn('p-2', 'p-4')
    expect(result).toContain('p-4')
  })
})
