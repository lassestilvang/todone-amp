import { renderHook, act } from '@testing-library/react'
import { useDyslexiaFont } from './useDyslexiaFont'

describe('useDyslexiaFont Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dyslexia-font')
    const styleTag = document.getElementById('dyslexia-font-styles')
    if (styleTag) {
      styleTag.remove()
    }
  })

  it('should initialize with false when not enabled', () => {
    const { result } = renderHook(() => useDyslexiaFont())
    expect(result.current.enabled).toBe(false)
  })

  it('should initialize with true when enabled in localStorage', () => {
    localStorage.setItem('enableDyslexiaFont', 'true')
    const { result } = renderHook(() => useDyslexiaFont())
    expect(result.current.enabled).toBe(true)
  })

  it('should toggle enabled state', () => {
    const { result } = renderHook(() => useDyslexiaFont())

    act(() => {
      result.current.toggle()
    })

    expect(result.current.enabled).toBe(true)

    act(() => {
      result.current.toggle()
    })

    expect(result.current.enabled).toBe(false)
  })

  it('should enable font', () => {
    const { result } = renderHook(() => useDyslexiaFont())

    act(() => {
      result.current.enable()
    })

    expect(result.current.enabled).toBe(true)
    expect(localStorage.getItem('enableDyslexiaFont')).toBe('true')
  })

  it('should disable font', () => {
    localStorage.setItem('enableDyslexiaFont', 'true')
    const { result } = renderHook(() => useDyslexiaFont())

    expect(result.current.enabled).toBe(true)

    act(() => {
      result.current.disable()
    })

    expect(result.current.enabled).toBe(false)
    expect(localStorage.getItem('enableDyslexiaFont')).toBe('false')
  })

  it('should handle multiple enable calls', () => {
    const { result } = renderHook(() => useDyslexiaFont())

    act(() => {
      result.current.enable()
      result.current.enable()
    })

    expect(result.current.enabled).toBe(true)
  })

  it('should handle multiple disable calls', () => {
    localStorage.setItem('enableDyslexiaFont', 'true')
    const { result } = renderHook(() => useDyslexiaFont())

    act(() => {
      result.current.disable()
      result.current.disable()
    })

    expect(result.current.enabled).toBe(false)
  })

  it('should return all control functions', () => {
    const { result } = renderHook(() => useDyslexiaFont())

    expect(typeof result.current.toggle).toBe('function')
    expect(typeof result.current.enable).toBe('function')
    expect(typeof result.current.disable).toBe('function')
  })
})
