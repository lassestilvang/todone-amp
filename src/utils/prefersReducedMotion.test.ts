import {
  prefersReducedMotion,
  onReducedMotionChange,
  getTransitionDuration,
  getTransition,
  safeAnimate,
  getAnimationDuration,
  motionSafeStyle,
} from './prefersReducedMotion'

describe('Reduced Motion Utilities', () => {
  // Helper to mock matchMedia
  const mockMatchMedia = (matches: boolean) => {
    const listeners: Array<(e: MediaQueryListEvent) => void> = []

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn((listener: (e: MediaQueryListEvent) => void) => listeners.push(listener)),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_: string, listener: (e: MediaQueryListEvent) => void) =>
          listeners.push(listener)
        ),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    return listeners
  }

  describe('prefersReducedMotion', () => {
    it('should return true when prefers-reduced-motion is set', () => {
      mockMatchMedia(true)
      expect(prefersReducedMotion()).toBe(true)
    })

    it('should return false when prefers-reduced-motion is not set', () => {
      mockMatchMedia(false)
      expect(prefersReducedMotion()).toBe(false)
    })
  })

  describe('getTransitionDuration', () => {
    it('should return 0 when reduced motion is preferred', () => {
      mockMatchMedia(true)
      expect(getTransitionDuration(300)).toBe(0)
    })

    it('should return normal duration when reduced motion is not preferred', () => {
      mockMatchMedia(false)
      expect(getTransitionDuration(300)).toBe(300)
    })

    it('should handle different durations', () => {
      mockMatchMedia(false)
      expect(getTransitionDuration(500)).toBe(500)
      expect(getTransitionDuration(150)).toBe(150)
    })
  })

  describe('getTransition', () => {
    it('should return none when reduced motion is preferred', () => {
      mockMatchMedia(true)
      expect(getTransition('opacity', 300)).toBe('none')
    })

    it('should return transition string when reduced motion is not preferred', () => {
      mockMatchMedia(false)
      const result = getTransition('opacity', 300)
      expect(result).toContain('opacity')
      expect(result).toContain('300')
    })

    it('should use default duration of 300ms', () => {
      mockMatchMedia(false)
      const result = getTransition('transform')
      expect(result).toContain('300')
    })

    it('should handle multiple properties (with single property)', () => {
      mockMatchMedia(false)
      const result = getTransition('all', 500)
      expect(result).toContain('all')
      expect(result).toContain('500')
    })
  })

  describe('getAnimationDuration', () => {
    it('should return 0 when reduced motion is preferred', () => {
      mockMatchMedia(true)
      expect(getAnimationDuration(300)).toBe(0)
    })

    it('should return normal duration when reduced motion is not preferred', () => {
      mockMatchMedia(false)
      expect(getAnimationDuration(300)).toBe(300)
    })
  })

  describe('motionSafeStyle', () => {
    it('should return style with no transition when reduced motion is preferred', () => {
      mockMatchMedia(true)
      const style = motionSafeStyle('opacity', 300)
      expect(style.transition).toBe('none')
    })

    it('should return style with transition when reduced motion is not preferred', () => {
      mockMatchMedia(false)
      const style = motionSafeStyle('opacity', 300)
      expect(style.transition).toContain('opacity')
      expect(style.transition).toContain('300')
    })

    it('should use default duration of 300ms', () => {
      mockMatchMedia(false)
      const style = motionSafeStyle('transform')
      expect(style.transition).toContain('300')
    })
  })

  describe('onReducedMotionChange', () => {
    it('should return a function that unsubscribes', () => {
      mockMatchMedia(false)
      const unsubscribe = onReducedMotionChange(() => {})
      expect(typeof unsubscribe).toBe('function')
    })

    it('should call callback on preference change', () => {
      const listeners = mockMatchMedia(false)
      const callback = vi.fn()
      onReducedMotionChange(callback)

      // Simulate preference change
      if (listeners.length > 0) {
        listeners[0]({
          matches: true,
          media: '(prefers-reduced-motion: reduce)',
        } as MediaQueryListEvent)
        expect(callback).toHaveBeenCalledWith(true)
      }
    })
  })

  describe('safeAnimate', () => {
    it('should return null when reduced motion is preferred', async () => {
      mockMatchMedia(true)
      const element = document.createElement('div')
      const result = await safeAnimate(element, [{ opacity: 0 }, { opacity: 1 }])
      expect(result).toBeNull()
    })

    it('should animate when reduced motion is not preferred', async () => {
      mockMatchMedia(false)
      const element = document.createElement('div')

      const mockAnimation: Partial<Animation> = {}

      element.animate = vi.fn().mockReturnValue({
        ...mockAnimation,
        onfinish: null as FrameRequestCallback | null,
      } as unknown as Animation)

      // Create animation promise
      const animatePromise = safeAnimate(element, [{ opacity: '0' }, { opacity: '1' }], {
        duration: 300,
      })

      // Trigger animation finish
      const animation = element.animate([{ opacity: '0' }, { opacity: '1' }], { duration: 300 })
      if (animation.onfinish) {
        animation.onfinish({} as AnimationPlaybackEvent)
      }

      await animatePromise
      expect(element.animate).toHaveBeenCalled()
    })
  })
})
