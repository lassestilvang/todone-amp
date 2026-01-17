import React, { useRef, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  threshold?: number
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, threshold = 80 }) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const scrollTop = useRef(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      startY.current = e.touches[0].clientY
      scrollTop.current = element.scrollTop
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (scrollTop.current > 0) return // Only work at top of scroll

      const currentY = e.touches[0].clientY
      const distance = currentY - startY.current

      if (distance > 0 && !isRefreshing) {
        e.preventDefault()
        setPullDistance(Math.min(distance, threshold * 1.5))
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        setPullDistance(0)
      }
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, threshold, isRefreshing, onRefresh])

  const progress = Math.min((pullDistance / threshold) * 100, 100)
  const isReady = pullDistance >= threshold

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      style={{
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Pull to refresh indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
        style={{
          height: `${pullDistance}px`,
          backgroundColor: isReady ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
          overflow: 'hidden',
        }}
      >
        <div className="flex flex-col items-center">
          <RefreshCw
            className="h-6 w-6 text-icon-info transition-transform"
            style={{
              transform: `rotate(${progress * 3.6}deg) scale(${Math.min(1 + progress / 100, 1.2)})`,
              opacity: Math.min(progress / 100 + 0.3, 1),
            }}
          />
          <span className="text-xs text-semantic-info mt-1">
            {isRefreshing ? 'Refreshing...' : isReady ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Main content with padding for pull gesture */}
      <div style={{ paddingTop: `${pullDistance}px` }}>
        {children}
      </div>
    </div>
  )
}
