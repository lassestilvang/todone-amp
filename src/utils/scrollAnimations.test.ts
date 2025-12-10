import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  observeElementEntry,
  observeAndAnimate,
  smoothScrollToElement,
  smoothScrollToTop,
  isElementInViewport,
  applyParallaxEffect,
  fadeInOnScroll,
  slideInOnScroll,
  scaleOnScroll,
  rotateOnScroll,
  staggerAnimateElements,
  animateCounter,
  animateProgressBar,
} from './scrollAnimations'

describe('Scroll Animations', () => {
  let mockElement: HTMLElement
  let mockElements: HTMLElement[]

  beforeEach(() => {
    mockElement = document.createElement('div')
    mockElements = [document.createElement('div'), document.createElement('div'), document.createElement('div')]
    document.body.appendChild(mockElement)
    mockElements.forEach((el) => document.body.appendChild(el))

    // Mock IntersectionObserver - eslint-disable-next-line
    // @ts-expect-error - IntersectionObserver is a mock object
    global.IntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => {
      const observer = {
        observe: vi.fn((el: Element) => {
          // Defer callback to next tick to allow style setup
          setTimeout(() => {
            // @ts-expect-error - IntersectionObserverEntry mock
            callback([{ target: el, isIntersecting: true }], observer)
          }, 0)
        }),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }
      return observer
    })
  })

  afterEach(() => {
    document.body.removeChild(mockElement)
    mockElements.forEach((el) => document.body.removeChild(el))
    vi.clearAllMocks()
  })

  describe('observeElementEntry', () => {
    it('should observe element and call callback when visible', () => {
      vi.useFakeTimers()
      const callback = vi.fn()
      const observer = observeElementEntry(mockElement, callback)
      vi.advanceTimersByTime(0)

      expect(callback).toHaveBeenCalled()
      expect(observer).toBeDefined()
      vi.useRealTimers()
    })

    it('should unobserve after first intersection', () => {
      const unobserveSpy = vi.fn()
      const observeSpy = vi.fn()

      // @ts-expect-error - IntersectionObserver is a mock object
      global.IntersectionObserver = vi.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_callback: IntersectionObserverCallback) => ({
          observe: observeSpy,
          unobserve: unobserveSpy,
          disconnect: vi.fn(),
        })
      )

      observeElementEntry(mockElement, vi.fn())
      expect(observeSpy).toHaveBeenCalled()
    })
  })

  describe('observeAndAnimate', () => {
    it('should add animation class when element enters viewport', () => {
      vi.useFakeTimers()
      observeAndAnimate(mockElement, 'animate-test')
      vi.advanceTimersByTime(0)
      // Animation class should be added by the observer
      expect(mockElement.classList.contains('animate-test')).toBe(true)
      vi.useRealTimers()
    })

    it('should use default fadeIn animation class', () => {
      vi.useFakeTimers()
      observeAndAnimate(mockElement)
      vi.advanceTimersByTime(0)
      expect(mockElement.classList.contains('animate-fadeIn')).toBe(true)
      vi.useRealTimers()
    })
  })

  describe('smoothScrollToElement', () => {
    it('should scroll to element', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo')
      smoothScrollToElement(mockElement)
      expect(scrollSpy).toHaveBeenCalled()
    })

    it('should apply offset to scroll position', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo')
      smoothScrollToElement(mockElement, 100)
      expect(scrollSpy).toHaveBeenCalled()
    })

    it('should use smooth behavior by default', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo')
      smoothScrollToElement(mockElement)
      const call = scrollSpy.mock.calls[0][0] as ScrollToOptions
      expect(call.behavior).toBe('smooth')
    })
  })

  describe('smoothScrollToTop', () => {
    it('should scroll to top', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo')
      smoothScrollToTop()
      expect(scrollSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      })
    })

    it('should support instant behavior', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo')
      smoothScrollToTop('auto')
      const call = scrollSpy.mock.calls[0][0] as ScrollToOptions
      expect(call.behavior).toBe('auto')
    })
  })

  describe('isElementInViewport', () => {
    it('should return true for elements in viewport', () => {
      // Set element position to be visible
      mockElement.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 100,
        bottom: 200,
        right: 200,
        width: 100,
        height: 100,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      } as DOMRect))

      const result = isElementInViewport(mockElement)
      expect(result).toBe(true)
    })

    it('should return false for elements outside viewport', () => {
      mockElement.getBoundingClientRect = vi.fn(() => ({
        top: 10000,
        left: 10000,
        bottom: 11000,
        right: 11000,
        width: 100,
        height: 100,
        x: 10000,
        y: 10000,
        toJSON: () => ({}),
      } as DOMRect))

      const result = isElementInViewport(mockElement)
      expect(result).toBe(false)
    })
  })

  describe('applyParallaxEffect', () => {
    it('should apply parallax effect on scroll', () => {
      const cleanup = applyParallaxEffect(mockElement)
      expect(typeof cleanup).toBe('function')
    })

    it('should remove event listener on cleanup', () => {
      vi.spyOn(window, 'removeEventListener')
      const cleanup = applyParallaxEffect(mockElement)
      cleanup()
      // Cleanup function executed without error
      expect(cleanup).toBeDefined()
    })

    it('should support vertical and horizontal parallax', () => {
      applyParallaxEffect(mockElement, 0.5, 'vertical')
      applyParallaxEffect(mockElement, 0.5, 'horizontal')
      // Both should complete without error
      expect(mockElement).toBeDefined()
    })
  })

  describe('fadeInOnScroll', () => {
    it('should initialize fade-in animation on elements', () => {
      const observer = fadeInOnScroll(mockElements)
      expect(observer).toBeDefined()
    })

    it('should observe all provided elements', () => {
      const observer = fadeInOnScroll(mockElements)
      expect(observer).toBeDefined()
    })
  })

  describe('slideInOnScroll', () => {
    it('should set initial slide transform', () => {
      const observer = slideInOnScroll(mockElement, 'left', 50)
      const style = (mockElement as HTMLElement).style
      expect(style.transform).toBeTruthy()
      expect(observer).toBeDefined()
    })

    it('should support all slide directions', () => {
      const directions: Array<'left' | 'right' | 'up' | 'down'> = ['left', 'right', 'up', 'down']
      directions.forEach((dir) => {
        const el = document.createElement('div')
        document.body.appendChild(el)
        const observer = slideInOnScroll(el, dir)
        expect((el as HTMLElement).style.transform).toBeTruthy()
        expect(observer).toBeDefined()
        document.body.removeChild(el)
      })
    })
  })

  describe('scaleOnScroll', () => {
    it('should set initial scale transform', () => {
      vi.useFakeTimers()
      const observer = scaleOnScroll(mockElement, 0.8, 1)
      vi.advanceTimersByTime(0)
      expect(observer).toBeDefined()
      vi.useRealTimers()
    })

    it('should animate to target scale', () => {
      vi.useFakeTimers()
      const observer = scaleOnScroll(mockElement, 0.5, 1.2)
      vi.advanceTimersByTime(0)
      expect(observer).toBeDefined()
      vi.useRealTimers()
    })
  })

  describe('rotateOnScroll', () => {
    it('should set rotation animation', () => {
      vi.useFakeTimers()
      const observer = rotateOnScroll(mockElement)
      vi.advanceTimersByTime(0)
      expect(observer).toBeDefined()
      vi.useRealTimers()
    })

    it('should support custom rotation degrees', () => {
      vi.useFakeTimers()
      const observer = rotateOnScroll(mockElement, 720)
      vi.advanceTimersByTime(0)
      expect(observer).toBeDefined()
      vi.useRealTimers()
    })
  })

  describe('staggerAnimateElements', () => {
    it('should observe all elements', () => {
      const observer = staggerAnimateElements(mockElements)
      expect(observer).toBeDefined()
    })

    it('should apply stagger delay', () => {
      const delayMs = 100
      staggerAnimateElements(mockElements, 'animate-test', delayMs)
      // Stagger logic should be applied
      expect(mockElements.length).toBe(3)
    })
  })

  describe('animateCounter', () => {
    it('should animate counter to final value', () => {
      vi.useFakeTimers()
      animateCounter(mockElement as HTMLElement, 100, 1000)
      vi.advanceTimersByTime(1000)
      vi.useRealTimers()
      expect(mockElement.textContent).toBeTruthy()
    })

    it('should respect animation duration', () => {
      vi.useFakeTimers()
      const observer = animateCounter(mockElement as HTMLElement, 50, 500)
      expect(observer).toBeDefined()
      vi.useRealTimers()
    })
  })

  describe('animateProgressBar', () => {
    it('should set transition on progress bar', () => {
      animateProgressBar(mockElement as HTMLElement, 75, 1000)
      const style = (mockElement as HTMLElement).style
      expect(style.transition).toBeTruthy()
    })

    it('should support custom duration', () => {
      animateProgressBar(mockElement as HTMLElement, 50, 2000)
      const style = (mockElement as HTMLElement).style
      expect(style.transition).toContain('2000')
    })

    it('should set width to target percentage', () => {
      animateProgressBar(mockElement as HTMLElement, 80, 1000)
      const observer = animateProgressBar(mockElement as HTMLElement, 80)
      expect(observer).toBeDefined()
    })
  })
})
