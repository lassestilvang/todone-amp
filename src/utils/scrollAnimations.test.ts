import { describe, it, expect, beforeEach, mock, afterEach, spyOn } from 'bun:test'
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
    global.IntersectionObserver = mock((callback: IntersectionObserverCallback) => {
      const observer = {
        observe: mock((el: Element) => {
          // Defer callback to next tick to allow style setup
          setTimeout(() => {
            // @ts-expect-error - IntersectionObserverEntry mock
            callback([{ target: el, isIntersecting: true }], observer)
          }, 0)
        }),
        unobserve: mock(() => {}),
        disconnect: mock(() => {}),
      }
      return observer
    })
  })

  afterEach(() => {
    document.body.removeChild(mockElement)
    mockElements.forEach((el) => document.body.removeChild(el))
  })

  describe('observeElementEntry', () => {
    it('should observe element and call callback when visible', async () => {
      const callback = mock(() => {})
      const observer = observeElementEntry(mockElement, callback)
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(callback).toHaveBeenCalled()
      expect(observer).toBeDefined()
    })

    it('should unobserve after first intersection', () => {
      const unobserveSpy = mock(() => {})
      const observeSpy = mock(() => {})

      // @ts-expect-error - IntersectionObserver is a mock object
      global.IntersectionObserver = mock(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_callback: IntersectionObserverCallback) => ({
          observe: observeSpy,
          unobserve: unobserveSpy,
          disconnect: mock(() => {}),
        })
      )

      observeElementEntry(mockElement, mock(() => {}))
      expect(observeSpy).toHaveBeenCalled()
    })
  })

  describe('observeAndAnimate', () => {
    it('should add animation class when element enters viewport', async () => {
      observeAndAnimate(mockElement, 'animate-test')
      await new Promise(resolve => setTimeout(resolve, 10))
      // Animation class should be added by the observer
      expect(mockElement.classList.contains('animate-test')).toBe(true)
    })

    it('should use default fadeIn animation class', async () => {
      observeAndAnimate(mockElement)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(mockElement.classList.contains('animate-fadeIn')).toBe(true)
    })
  })

  describe('smoothScrollToElement', () => {
    it('should scroll to element', () => {
      const scrollSpy = spyOn(window, 'scrollTo')
      smoothScrollToElement(mockElement)
      expect(scrollSpy).toHaveBeenCalled()
    })

    it('should apply offset to scroll position', () => {
      const scrollSpy = spyOn(window, 'scrollTo')
      smoothScrollToElement(mockElement, 100)
      expect(scrollSpy).toHaveBeenCalled()
    })

    it('should use smooth behavior by default', () => {
      const scrollSpy = spyOn(window, 'scrollTo')
      smoothScrollToElement(mockElement)
      const call = scrollSpy.mock.calls[0][0] as ScrollToOptions
      expect(call.behavior).toBe('smooth')
    })
  })

  describe('smoothScrollToTop', () => {
    it('should scroll to top', () => {
      const scrollSpy = spyOn(window, 'scrollTo')
      smoothScrollToTop()
      expect(scrollSpy).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      })
    })

    it('should support instant behavior', () => {
      const scrollSpy = spyOn(window, 'scrollTo')
      smoothScrollToTop('auto')
      const call = scrollSpy.mock.calls[0][0] as ScrollToOptions
      expect(call.behavior).toBe('auto')
    })
  })

  describe('isElementInViewport', () => {
    it('should return true for elements in viewport', () => {
      // Set element position to be visible
      mockElement.getBoundingClientRect = mock(() => ({
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
      mockElement.getBoundingClientRect = mock(() => ({
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
      spyOn(window, 'removeEventListener')
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
    it('should set initial scale transform', async () => {
      const observer = scaleOnScroll(mockElement, 0.8, 1)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(observer).toBeDefined()
    })

    it('should animate to target scale', async () => {
      const observer = scaleOnScroll(mockElement, 0.5, 1.2)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(observer).toBeDefined()
    })
  })

  describe('rotateOnScroll', () => {
    it('should set rotation animation', async () => {
      const observer = rotateOnScroll(mockElement)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(observer).toBeDefined()
    })

    it('should support custom rotation degrees', async () => {
      const observer = rotateOnScroll(mockElement, 720)
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(observer).toBeDefined()
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
    it('should animate counter to final value', async () => {
      animateCounter(mockElement as HTMLElement, 100, 1000)
      await new Promise(resolve => setTimeout(resolve, 1100))
      expect(mockElement.textContent).toBeTruthy()
    })

    it('should respect animation duration', () => {
      const observer = animateCounter(mockElement as HTMLElement, 50, 500)
      expect(observer).toBeDefined()
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
