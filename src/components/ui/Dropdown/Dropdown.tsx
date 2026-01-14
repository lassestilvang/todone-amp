import React, { useState, useRef, useEffect, createContext, useContext } from 'react'
import { cn } from '@/utils/cn'
import { ChevronDown } from 'lucide-react'

interface DropdownContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

const useDropdown = () => {
  const context = useContext(DropdownContext)
  if (!context) throw new Error('Dropdown components must be used within a Dropdown')
  return context
}

export interface DropdownProps {
  children: React.ReactNode
  className?: string
}

export const Dropdown: React.FC<DropdownProps> = ({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className={cn('relative inline-block', className)}>{children}</div>
    </DropdownContext.Provider>
  )
}

export interface DropdownTriggerProps {
  children: React.ReactNode
  className?: string
  showChevron?: boolean
}

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  className,
  showChevron = true,
}) => {
  const { isOpen, setIsOpen, triggerRef } = useDropdown()

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium',
        'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md',
        'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-brand-500',
        className
      )}
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      {children}
      {showChevron && (
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      )}
    </button>
  )
}

export interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'right'
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  children,
  className,
  align = 'left',
}) => {
  const { isOpen, setIsOpen, triggerRef } = useDropdown()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, setIsOpen, triggerRef])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        'absolute z-50 mt-1 min-w-[160px] py-1',
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        'rounded-md shadow-lg animate-fadeIn',
        align === 'left' ? 'left-0' : 'right-0',
        className
      )}
    >
      {children}
    </div>
  )
}

export interface DropdownItemProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  icon?: React.ReactNode
  className?: string
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  disabled = false,
  danger = false,
  icon,
  className,
}) => {
  const { setIsOpen } = useDropdown()

  const handleClick = () => {
    if (disabled) return
    onClick?.()
    setIsOpen(false)
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
        'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        danger && 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
        !danger && 'text-gray-700 dark:text-gray-300',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

export const DropdownDivider: React.FC = () => (
  <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" role="separator" />
)

Dropdown.displayName = 'Dropdown'
DropdownTrigger.displayName = 'DropdownTrigger'
DropdownMenu.displayName = 'DropdownMenu'
DropdownItem.displayName = 'DropdownItem'
DropdownDivider.displayName = 'DropdownDivider'
