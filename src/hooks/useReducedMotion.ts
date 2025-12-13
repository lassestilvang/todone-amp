import { useEffect, useState } from 'react'
import { prefersReducedMotion, onReducedMotionChange } from '@/utils/prefersReducedMotion'

/**
 * Hook to detect and track user's reduced motion preference
 * Allows React components to respect accessibility settings
 * @returns boolean - true if user prefers reduced motion
 */
export const useReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    // Set initial value
    setPrefersReduced(prefersReducedMotion())

    // Listen for changes
    const unsubscribe = onReducedMotionChange((reduced) => {
      setPrefersReduced(reduced)
    })

    return unsubscribe
  }, [])

  return prefersReduced
}
