import { renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion'

describe('useReducedMotion Hook', () => {
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

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
    const mockAddListener = vi.fn()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addListener: mockAddListener,
        removeListener: vi.fn(),
        addEventListener: mockAddListener,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    renderHook(() => useReducedMotion())
    expect(mockAddListener).toHaveBeenCalled()
  })
})
