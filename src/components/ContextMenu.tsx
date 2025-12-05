import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  action: () => void
  isDangerous?: boolean
  disabled?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
  onOpen?: () => void
  onClose?: () => void
}

/**
 * ContextMenu component supporting long-press and right-click
 * Automatically positions to stay within viewport
 */
export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  children,
  onOpen,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  // Handle right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setIsOpen(true)
    onOpen?.()
  }

  // Handle long-press (touch)
  const handleTouchStart = useRef<{ x: number; y: number; timer: NodeJS.Timeout | null }>({
    x: 0,
    y: 0,
    timer: null,
  })

  const handleTouchDown = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleTouchStart.current.x = touch.clientX
    handleTouchStart.current.y = touch.clientY

    handleTouchStart.current.timer = setTimeout(() => {
      setPosition({ x: touch.clientX, y: touch.clientY })
      setIsOpen(true)
      onOpen?.()
    }, 500)
  }

  const handleTouchEnd = () => {
    if (handleTouchStart.current.timer) {
      clearTimeout(handleTouchStart.current.timer)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const distance = Math.sqrt(
      Math.pow(touch.clientX - handleTouchStart.current.x, 2) +
        Math.pow(touch.clientY - handleTouchStart.current.y, 2)
    )
    // Cancel long-press if user moves finger more than 10px
    if (distance > 10 && handleTouchStart.current.timer) {
      clearTimeout(handleTouchStart.current.timer)
      handleTouchStart.current.timer = null
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
          onClose?.()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        onClose?.()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, onClose])

  const handleMenuItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.action()
      setIsOpen(false)
      onClose?.()
    }
  }

  // Adjust position to keep menu within viewport
  let adjustedX = position.x
  let adjustedY = position.y
  if (menuRef.current) {
    const rect = menuRef.current.getBoundingClientRect()
    if (rect.right > window.innerWidth) {
      adjustedX = Math.max(0, window.innerWidth - rect.width - 8)
    }
    if (rect.bottom > window.innerHeight) {
      adjustedY = Math.max(0, window.innerHeight - rect.height - 8)
    }
  }

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchDown}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {children}
      </div>

      {/* Menu */}
      {isOpen && (
        <>
          {/* Backdrop for touch devices */}
          <div
            className="md:hidden fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              onClose?.()
            }}
          />

          {/* Context Menu */}
          <div
            ref={menuRef}
            className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 py-1 min-w-48"
            style={{
              left: `${adjustedX}px`,
              top: `${adjustedY}px`,
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                disabled={item.disabled}
                className={cn(
                  'w-full px-4 py-2 text-sm font-medium text-left transition-colors',
                  'flex items-center gap-3',
                  'first:rounded-t-lg last:rounded-b-lg',
                  item.disabled
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : item.isDangerous
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
