import { describe, it, expect, mock, spyOn } from 'bun:test'
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
    const mockImport = mock(() =>
      Promise.resolve({ default: () => null })
    )
    const delayedImport = lazyWithDelay(mockImport, 500)
    expect(typeof delayedImport).toBe('function')
  })

  it('lazyWithDelay should delay import resolution', async () => {
    const mockImport = mock(() =>
      Promise.resolve({ default: () => null })
    )
    const delayedImport = lazyWithDelay(mockImport, 100)

    const promise = delayedImport()
    expect(mockImport).not.toHaveBeenCalled()

    await new Promise((resolve) => setTimeout(resolve, 150))
    await promise
    expect(mockImport).toHaveBeenCalled()
  })

  it('preloadComponent should handle successful imports', async () => {
    const mockImport = mock(() =>
      Promise.resolve({ default: () => null })
    )
    await preloadComponent(mockImport)
    expect(mockImport).toHaveBeenCalled()
  })

  it('preloadComponent should handle import errors gracefully', async () => {
    const mockImport = mock(() =>
      Promise.reject(new Error('Import failed'))
    )
    const loggerSpy = spyOn(loggerModule.logger, 'warn').mockImplementation(() => {})

    await preloadComponent(mockImport)

    expect(loggerSpy).toHaveBeenCalledWith('Failed to preload component:', expect.any(Error))
    loggerSpy.mockRestore()
  })
})
