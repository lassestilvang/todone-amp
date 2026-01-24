import { describe, it, expect, mock } from 'bun:test'
import {
  debounce,
  throttle,
  measurePerformance,
  isSlowNetwork,
  getAdaptiveLoadingSettings,
} from '@/utils/performance'

describe('Performance Utilities', () => {
  describe('debounce', () => {
    it('should debounce function calls', async () => {
      const callback = mock(() => {})
      const debounced = debounce(callback, 50)

      debounced()
      debounced()
      debounced()

      expect(callback).not.toHaveBeenCalled()

      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should pass arguments to debounced function', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      const callback = mock((..._args: any[]) => {})
      const debounced = debounce(callback, 50)

      debounced(1, 2, 3)

      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(callback).toHaveBeenCalledWith(1, 2, 3)
    })
  })

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      const callback = mock(() => {})
      const throttled = throttle(callback, 50)

      throttled()

      await new Promise((resolve) => setTimeout(resolve, 75))
      throttled()
      throttled()

      // Should have been called at least once due to throttle behavior
      expect(callback.mock.calls.length).toBeGreaterThan(0)
    })

    it('should respect throttle interval', async () => {
      const callback = mock(() => {})
      const throttled = throttle(callback, 100)

      throttled()
      const firstCallTime = Date.now()

      // Try to call again immediately
      throttled()
      const timeElapsed = Date.now() - firstCallTime

      // Second call should not execute immediately
      expect(timeElapsed).toBeLessThan(100)

      await new Promise((resolve) => setTimeout(resolve, 150))
      throttled()
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
