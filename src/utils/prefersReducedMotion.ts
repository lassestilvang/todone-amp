/**
 * Utilities for detecting and respecting prefers-reduced-motion media query
 * WCAG 2.1 Level AAA: 2.3.3 Animation from Interactions
 */

/**
 * Check if the user prefers reduced motion
 * @returns boolean - true if user has prefers-reduced-motion enabled
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Listen to changes in reduced motion preference
 * @param callback - Function to call when preference changes
 * @returns Unsubscribe function
 */
export const onReducedMotionChange = (callback: (prefersReduced: boolean) => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {} // No-op on SSR
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches)
  }

  // Modern browsers use addEventListener
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }

  // Fallback for older browsers
  mediaQuery.addListener(handleChange)
  return () => mediaQuery.removeListener(handleChange)
}

/**
 * Get CSS transition duration respecting reduced motion preference
 * @param normalDuration - Duration in milliseconds for normal motion
 * @returns Duration to use for CSS transitions
 */
export const getTransitionDuration = (normalDuration: number): number => {
  return prefersReducedMotion() ? 0 : normalDuration
}

/**
 * Get CSS transition respecting reduced motion preference
 * @param property - CSS property to transition
 * @param normalDuration - Duration in milliseconds for normal motion
 * @returns CSS transition string or empty string if reduced motion
 */
export const getTransition = (property: string, normalDuration: number = 300): string => {
  const duration = getTransitionDuration(normalDuration)
  return duration === 0 ? 'none' : `${property} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
}

/**
 * Apply reduced motion-safe animation to an element
 * @param element - Element to animate
 * @param keyframes - Animation keyframes (CSS string)
 * @param options - Animation options (duration, iterations, etc.)
 * @returns Promise that resolves when animation completes
 */
export const safeAnimate = async (
  element: HTMLElement,
  keyframes: Keyframe[] | Record<string, unknown>[],
  options?: number | KeyframeAnimationOptions
): Promise<Animation | null> => {
  if (prefersReducedMotion()) {
    return null
  }

  return new Promise((resolve) => {
    const animation = element.animate(keyframes as Keyframe[], options)
    animation.onfinish = () => resolve(animation)
  })
}

/**
 * Get animation duration respecting reduced motion
 * @param normalDuration - Duration in milliseconds
 * @returns 0 if reduced motion, otherwise normal duration
 */
export const getAnimationDuration = (normalDuration: number): number => {
  return getTransitionDuration(normalDuration)
}

/**
 * Hook-like utility to create motion-safe transition style
 * Returns object to spread on element style prop
 * @param normalDuration - Duration in milliseconds
 * @returns Object with transition style
 */
export const motionSafeStyle = (property: string, normalDuration: number = 300) => {
  const duration = getTransitionDuration(normalDuration)
  return {
    transition: duration === 0 ? 'none' : `${property} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  }
}
