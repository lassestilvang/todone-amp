/**
 * Scroll animation utilities for enhanced UI interactions
 */

/**
 * Intersection Observer options for animations
 */
export const ANIMATION_OPTIONS: IntersectionObserverInit = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px',
}

/**
 * Apply fade-in animation when element enters viewport
 */
export function observeElementEntry(
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry)
        observer.unobserve(entry.target)
      }
    })
  }, options)

  observer.observe(element)
  return observer
}

/**
 * Apply animation class when element comes into view
 */
export function observeAndAnimate(
  element: Element,
  animationClass: string = 'animate-fadeIn',
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  return observeElementEntry(
    element,
    (entry) => {
      entry.target.classList.add(animationClass)
    },
    options
  )
}

/**
 * Smooth scroll to element
 */
export function smoothScrollToElement(
  element: Element,
  offset: number = 0,
  behavior: ScrollBehavior = 'smooth'
): void {
  const topOffset = element.getBoundingClientRect().top + window.scrollY - offset

  window.scrollTo({
    top: topOffset,
    behavior,
  })
}

/**
 * Smooth scroll to top
 */
export function smoothScrollToTop(behavior: ScrollBehavior = 'smooth'): void {
  window.scrollTo({
    top: 0,
    behavior,
  })
}

/**
 * Detect if element is in viewport
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

/**
 * Parallax scroll effect
 */
export function applyParallaxEffect(
  element: Element,
  speed: number = 0.5,
  direction: 'vertical' | 'horizontal' = 'vertical'
): (() => void) {
  const handleScroll = () => {
    const offsetTop = (element as HTMLElement).offsetTop
    const elementScrollPosition = offsetTop - window.scrollY
    const translateValue = elementScrollPosition * speed

    if (direction === 'vertical') {
      (element as HTMLElement).style.transform = `translateY(${translateValue}px)`
    } else {
      (element as HTMLElement).style.transform = `translateX(${translateValue}px)`
    }
  }

  window.addEventListener('scroll', handleScroll)

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}

/**
 * Fade in on scroll animation
 */
export function fadeInOnScroll(
  elements: Element[],
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100')
        entry.target.classList.remove('opacity-0')
        observer.unobserve(entry.target)
      }
    })
  }, options)

  elements.forEach((el) => {
    el.classList.add('opacity-0')
    observer.observe(el)
  })

  return observer
}

/**
 * Slide in animation based on scroll position
 */
export function slideInOnScroll(
  element: Element,
  direction: 'left' | 'right' | 'up' | 'down' = 'left',
  distance: number = 50,
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  const getTransform = () => {
    const transforms: Record<string, string> = {
      left: `translateX(-${distance}px)`,
      right: `translateX(${distance}px)`,
      up: `translateY(-${distance}px)`,
      down: `translateY(${distance}px)`,
    }
    return transforms[direction]
  }

  const htmlElement = element as HTMLElement
  try {
    htmlElement.style.transform = getTransform()
    htmlElement.style.opacity = '0'
    htmlElement.style.transition = 'all 0.6s ease-out'
  } catch {
    // Handle cases where style is not writable
  }

  return observeElementEntry(
    element,
    () => {
      htmlElement.style.transform = 'translate(0, 0)'
      htmlElement.style.opacity = '1'
    },
    options
  )
}

/**
 * Scale animation on scroll
 */
export function scaleOnScroll(
  element: Element,
  minScale: number = 0.8,
  maxScale: number = 1,
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  const htmlElement = element as HTMLElement
  try {
    htmlElement.style.transition = 'transform 0.6s ease-out'
    htmlElement.style.transform = `scale(${minScale})`
  } catch {
    // Handle cases where style is not writable
  }

  const observer = observeElementEntry(element, () => {
    htmlElement.style.transform = `scale(${maxScale})`
  }, options)
  return observer
}

/**
 * Rotate animation on scroll
 */
export function rotateOnScroll(
  element: Element,
  degrees: number = 360,
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  const htmlElement = element as HTMLElement
  try {
    htmlElement.style.transition = 'transform 0.8s ease-out'
    htmlElement.style.transform = 'rotate(0deg)'
  } catch {
    // Handle cases where style is not writable
  }

  const observer = observeElementEntry(element, () => {
    htmlElement.style.transform = `rotate(${degrees}deg)`
  }, options)
  return observer
}

/**
 * Stagger animation for multiple elements
 */
export function staggerAnimateElements(
  elements: Element[],
  animationClass: string = 'animate-fadeIn',
  staggerDelay: number = 100,
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const index = Array.from(elements).indexOf(entry.target)
        setTimeout(
          () => {
            entry.target.classList.add(animationClass)
            observer.unobserve(entry.target)
          },
          index * staggerDelay
        )
      }
    })
  }, options)

  elements.forEach((el) => observer.observe(el))
  return observer
}

/**
 * Counter animation for numeric values
 */
export function animateCounter(
  element: HTMLElement,
  finalValue: number,
  duration: number = 1000,
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  let currentValue = 0
  const step = finalValue / (duration / 16) // Approximate 60fps

  return observeElementEntry(
    element,
    () => {
      const interval = setInterval(() => {
        currentValue += step
        if (currentValue >= finalValue) {
          currentValue = finalValue
          clearInterval(interval)
        }
        element.textContent = Math.floor(currentValue).toString()
      }, 16)
    },
    options
  )
}

/**
 * Progress bar animation
 */
export function animateProgressBar(
  element: HTMLElement,
  targetPercentage: number,
  duration: number = 1000,
  options: IntersectionObserverInit = ANIMATION_OPTIONS
): IntersectionObserver {
  (element as HTMLElement).style.transition = `width ${duration}ms ease-out`

  return observeElementEntry(
    element,
    () => {
      (element as HTMLElement).style.width = `${targetPercentage}%`
    },
    options
  )
}
