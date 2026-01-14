import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/utils/cn'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const updatePosition = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    const positions = {
      top: { x: rect.left + rect.width / 2 + scrollX, y: rect.top + scrollY - 8 },
      bottom: { x: rect.left + rect.width / 2 + scrollX, y: rect.bottom + scrollY + 8 },
      left: { x: rect.left + scrollX - 8, y: rect.top + rect.height / 2 + scrollY },
      right: { x: rect.right + scrollX + 8, y: rect.top + rect.height / 2 + scrollY },
    }

    setCoords(positions[position])
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      updatePosition()
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const positionClasses = {
    top: '-translate-x-1/2 -translate-y-full',
    bottom: '-translate-x-1/2',
    left: '-translate-x-full -translate-y-1/2',
    right: '-translate-y-1/2',
  }

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleMouseEnter,
        onBlur: handleMouseLeave,
      })}
      {isVisible &&
        createPortal(
          <div
            role="tooltip"
            className={cn(
              'fixed z-50 px-2 py-1 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg',
              'animate-fadeIn pointer-events-none',
              positionClasses[position],
              className
            )}
            style={{ left: coords.x, top: coords.y }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  )
}

Tooltip.displayName = 'Tooltip'
