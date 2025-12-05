import { useRef, useCallback } from 'react'

interface GestureHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
}

const SWIPE_THRESHOLD = 50 // pixels
const LONG_PRESS_DURATION = 500 // milliseconds

/**
 * Custom hook for handling touch gestures on mobile
 * Supports: swipe left/right/up/down, long press
 */
export const useTouchGestures = (handlers: GestureHandlers) => {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
      touchStartTime.current = Date.now()

      // Start long press timer
      if (handlers.onLongPress) {
        longPressTimer.current = setTimeout(() => {
          handlers.onLongPress?.()
        }, LONG_PRESS_DURATION)
      }
    },
    [handlers]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Cancel long press if touch ended
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const duration = Date.now() - touchStartTime.current

      // Don't trigger swipe if it was a long press
      if (duration > LONG_PRESS_DURATION) return

      const deltaX = touchEndX - touchStartX.current
      const deltaY = touchEndY - touchStartY.current

      // Determine swipe direction
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
          if (deltaX > 0) {
            handlers.onSwipeRight?.()
          } else {
            handlers.onSwipeLeft?.()
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
          if (deltaY > 0) {
            handlers.onSwipeDown?.()
          } else {
            handlers.onSwipeUp?.()
          }
        }
      }
    },
    [handlers]
  )

  const handleTouchMove = useCallback(() => {
    // Cancel long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  }
}
