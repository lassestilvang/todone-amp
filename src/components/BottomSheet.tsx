import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  fullHeight?: boolean
}

/**
 * Mobile-optimized bottom sheet component
 * Works well on mobile devices and tablets
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  fullHeight = false,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when sheet is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    // If dragged down more than 50px, close the sheet
    if (touchEndY - touchStartY.current > 50) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-surface-primary rounded-t-2xl',
          'md:hidden',
          'transition-transform duration-300',
          'max-h-[90vh] flex flex-col',
          fullHeight && 'h-screen',
          className
        )}
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-2 pb-2">
          <div className="w-12 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-content-tertiary hover:text-content-secondary rounded-lg hover:bg-surface-tertiary active:bg-surface-tertiary transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </div>

      {/* Desktop Modal Fallback */}
      <div
        className={cn(
          'hidden md:fixed md:inset-0 md:z-50 md:flex md:items-end md:justify-center',
          isOpen ? 'md:flex' : 'md:hidden'
        )}
      >
        <div
          className="hidden md:block absolute inset-0 bg-black bg-opacity-40"
          onClick={onClose}
        />
        <div className="hidden md:block relative bg-surface-primary rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 text-content-tertiary hover:text-content-secondary"
              >
                <X size={24} />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </>
  )
}
