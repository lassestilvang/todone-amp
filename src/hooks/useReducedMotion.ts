import { useEffect, useState } from 'react'

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled "Reduce motion" in OS settings
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check initial preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook to get animation config based on user preference
 */
export const useAnimationConfig = () => {
  const prefersReducedMotion = useReducedMotion()

  return {
    shouldAnimate: !prefersReducedMotion,
    duration: prefersReducedMotion ? 0 : 300,
    delay: prefersReducedMotion ? 0 : 150,
    transitionClass: prefersReducedMotion ? '' : 'transition-all duration-300',
  }
}
