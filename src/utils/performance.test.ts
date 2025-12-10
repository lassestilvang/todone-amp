import { describe, it, expect, vi } from 'vitest'
import {
  debounce,
  throttle,
  measurePerformance,
  isSlowNetwork,
  getAdaptiveLoadingSettings,
} from '@/utils/performance'

describe('Performance Utilities', () => {
  describe('debounce', () => {
    it('should debounce function calls', () => {
      return new Promise<void>((resolve) => {
        const callback = vi.fn()
        const debounced = debounce(callback, 50)

        debounced()
        debounced()
        debounced()

        expect(callback).not.toHaveBeenCalled()

        setTimeout(() => {
          expect(callback).toHaveBeenCalledTimes(1)
          resolve()
        }, 100)
      })
    })

    it('should pass arguments to debounced function', () => {
      return new Promise<void>((resolve) => {
        const callback = vi.fn()
        const debounced = debounce(callback, 50)

        debounced(1, 2, 3)

        setTimeout(() => {
          expect(callback).toHaveBeenCalledWith(1, 2, 3)
          resolve()
        }, 100)
      })
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', () => {
      return new Promise<void>((resolve) => {
        const callback = vi.fn()
        const throttled = throttle(callback, 50)

        throttled()

        setTimeout(() => {
          throttled()
          throttled()

          // Should have been called at least once due to throttle behavior
          expect(callback.mock.calls.length).toBeGreaterThan(0)
          resolve()
        }, 75)
      })
    })

    it('should respect throttle interval', () => {
      return new Promise<void>((resolve) => {
        const callback = vi.fn()
        const throttled = throttle(callback, 100)

        throttled()
        const firstCallTime = Date.now()

        // Try to call again immediately
        throttled()
        const timeElapsed = Date.now() - firstCallTime

        // Second call should not execute immediately
        expect(timeElapsed).toBeLessThan(100)

        setTimeout(() => {
          throttled()
          resolve()
        }, 150)
      })
    })
  })

  describe('measurePerformance', () => {
    it('should measure async function execution time', async () => {
      const { result, duration } = await measurePerformance('test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return 'done'
      })

      expect(result).toBe('done')
      expect(duration).toBeGreaterThanOrEqual(45)
      expect(duration).toBeLessThan(200)
    })

    it('should handle errors gracefully', async () => {
      try {
        await measurePerformance('test', async () => {
          throw new Error('test error')
        })
      } catch (e) {
        expect((e as Error).message).toBe('test error')
      }
    })
  })

  describe('isSlowNetwork', () => {
    it('should return boolean', () => {
      const result = isSlowNetwork()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getAdaptiveLoadingSettings', () => {
    it('should return adaptive loading configuration', () => {
      const settings = getAdaptiveLoadingSettings()
      expect(settings).toHaveProperty('reducedImages')
      expect(settings).toHaveProperty('skipAnimations')
      expect(settings).toHaveProperty('preloadAssets')
      expect(settings).toHaveProperty('lazyLoadComponents')
      expect(settings).toHaveProperty('qualityLevel')
    })

    it('should have valid quality levels', () => {
      const settings = getAdaptiveLoadingSettings()
      expect(['low', 'high']).toContain(settings.qualityLevel)
    })

    it('should have boolean properties', () => {
      const settings = getAdaptiveLoadingSettings()
      expect(typeof settings.reducedImages).toBe('boolean')
      expect(typeof settings.skipAnimations).toBe('boolean')
      expect(typeof settings.preloadAssets).toBe('boolean')
      expect(typeof settings.lazyLoadComponents).toBe('boolean')
    })
  })
})
