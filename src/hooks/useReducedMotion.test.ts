import { describe, it, expect, mock } from 'bun:test'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

describe('useReducedMotion Hook', () => {
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(globalThis.window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mock(() => ({
        matches,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: mock(() => {}),
        removeListener: mock(() => {}),
        addEventListener: mock(() => {}),
        removeEventListener: mock(() => {}),
        dispatchEvent: mock(() => {}),
      })),
    })
  }

  it('should return false when reduced motion is not preferred', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
  })

  it('should return true when reduced motion is preferred', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('should initialize with correct preference on mount', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })

  it('should set up listener on mount', () => {
    mockMatchMedia(false)
    const mockAddListener = mock(() => {})
    Object.defineProperty(globalThis.window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mock(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: mockAddListener,
        removeListener: mock(() => {}),
        addEventListener: mockAddListener,
        removeEventListener: mock(() => {}),
        dispatchEvent: mock(() => {}),
      })),
    })

    renderHook(() => useReducedMotion())
    expect(mockAddListener).toHaveBeenCalled()
  })
})
