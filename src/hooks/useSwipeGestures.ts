import { useEffect, useRef } from 'react'

export type SwipeDirection = 'left' | 'right' | 'up' | 'down'
export type SwipeCallback = (direction: SwipeDirection) => void

interface SwipeGestureConfig {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  minDistance?: number
  maxDuration?: number
}

/**
 * Hook for detecting swipe gestures on touch devices
 * Typical use cases:
 * - Swipe right: Complete task
 * - Swipe left: Delete/Archive task
 * - Pull down: Refresh
 */
export const useSwipeGestures = (config: SwipeGestureConfig) => {
  const startX = useRef(0)
  const startY = useRef(0)
  const startTime = useRef(0)
  const { minDistance = 50, maxDuration = 1000 } = config

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX
      startY.current = e.touches[0].clientY
      startTime.current = Date.now()
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      const duration = Date.now() - startTime.current

      if (duration > maxDuration) return

      const distanceX = startX.current - endX
      const distanceY = startY.current - endY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance < minDistance) return

      // Determine primary direction
      const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY)

      if (isHorizontal) {
        if (distanceX > 0 && config.onSwipeLeft) {
          config.onSwipeLeft()
        } else if (distanceX < 0 && config.onSwipeRight) {
          config.onSwipeRight()
        }
      } else {
        if (distanceY > 0 && config.onSwipeUp) {
          config.onSwipeUp()
        } else if (distanceY < 0 && config.onSwipeDown) {
          config.onSwipeDown()
        }
      }
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [config, minDistance, maxDuration])

  return ref
}
