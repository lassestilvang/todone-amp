import { describe, it, expect, vi } from 'vitest'
import { lazyWithDelay, preloadComponent, lazyLoadPatterns } from './lazyLoadUtils'
import * as loggerModule from './logger'

describe('lazyLoadUtils', () => {
  it('should export lazyWithDelay function', () => {
    expect(typeof lazyWithDelay).toBe('function')
  })

  it('should export preloadComponent function', () => {
    expect(typeof preloadComponent).toBe('function')
  })

  it('should export lazyLoadPatterns', () => {
    expect(lazyLoadPatterns).toHaveProperty('views')
    expect(lazyLoadPatterns).toHaveProperty('components')
  })

  it('lazyWithDelay should return a function', () => {
    const mockImport = vi.fn(() =>
      Promise.resolve({ default: () => null })
    )
    const delayedImport = lazyWithDelay(mockImport, 500)
    expect(typeof delayedImport).toBe('function')
  })

  it('lazyWithDelay should delay import resolution', async () => {
    vi.useFakeTimers()
    const mockImport = vi.fn(() =>
      Promise.resolve({ default: () => null })
    )
    const delayedImport = lazyWithDelay(mockImport, 500)

    const promise = delayedImport()
    expect(mockImport).not.toHaveBeenCalled()

    vi.advanceTimersByTime(500)
    await promise
    expect(mockImport).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('preloadComponent should handle successful imports', async () => {
    const mockImport = vi.fn(() =>
      Promise.resolve({ default: () => null })
    )
    await preloadComponent(mockImport)
    expect(mockImport).toHaveBeenCalled()
  })

  it('preloadComponent should handle import errors gracefully', async () => {
    const mockImport = vi.fn(() =>
      Promise.reject(new Error('Import failed'))
    )
    const loggerSpy = vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {})

    await preloadComponent(mockImport)

    expect(loggerSpy).toHaveBeenCalledWith('Failed to preload component:', expect.any(Error))
    loggerSpy.mockRestore()
  })
})
