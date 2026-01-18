import React, { useState, useRef, useEffect } from 'react'
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeMode } from '@/store/themeStore'

export interface ThemeSwitcherProps {
  variant?: 'icon' | 'dropdown' | 'segmented'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const themeModes: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Light', icon: Sun },
  { mode: 'dark', label: 'Dark', icon: Moon },
  { mode: 'system', label: 'System', icon: Monitor },
]

const sizeClasses = {
  sm: {
    icon: 'h-4 w-4',
    button: 'p-1.5',
    text: 'text-xs',
    segmentPadding: 'px-2 py-1',
  },
  md: {
    icon: 'h-5 w-5',
    button: 'p-2',
    text: 'text-sm',
    segmentPadding: 'px-3 py-1.5',
  },
  lg: {
    icon: 'h-6 w-6',
    button: 'p-2.5',
    text: 'text-base',
    segmentPadding: 'px-4 py-2',
  },
}

const getCurrentIcon = (mode: ThemeMode, resolvedMode: 'light' | 'dark') => {
  if (mode === 'system') return Monitor
  return resolvedMode === 'dark' ? Moon : Sun
}

const IconVariant: React.FC<{
  size: 'sm' | 'md' | 'lg'
  showLabel: boolean
  className?: string
}> = ({ size, showLabel, className }) => {
  const { mode, resolvedMode, setMode } = useTheme()
  const sizes = sizeClasses[size]

  const cycleMode = () => {
    const currentIndex = themeModes.findIndex((t) => t.mode === mode)
    const nextIndex = (currentIndex + 1) % themeModes.length
    setMode(themeModes[nextIndex].mode)
  }

  const Icon = getCurrentIcon(mode, resolvedMode)
  const currentTheme = themeModes.find((t) => t.mode === mode)

  return (
    <button
      type="button"
      onClick={cycleMode}
      className={cn(
        'inline-flex items-center gap-2 rounded-md transition-colors',
        'bg-surface-secondary hover:bg-surface-tertiary',
        'focus:outline-none focus:ring-2 focus:ring-focus',
        'text-content-secondary hover:text-content-primary',
        sizes.button,
        className
      )}
      aria-label={`Current theme: ${currentTheme?.label}. Click to cycle theme.`}
      title={`Theme: ${currentTheme?.label}`}
    >
      <Icon className={cn(sizes.icon, 'transition-transform')} />
      {showLabel && <span className={sizes.text}>{currentTheme?.label}</span>}
    </button>
  )
}

const DropdownVariant: React.FC<{
  size: 'sm' | 'md' | 'lg'
  showLabel: boolean
  className?: string
}> = ({ size, showLabel, className }) => {
  const { mode, resolvedMode, setMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sizes = sizeClasses[size]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
  }, [isOpen])

  const Icon = getCurrentIcon(mode, resolvedMode)
  const currentTheme = themeModes.find((t) => t.mode === mode)

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 rounded-md transition-colors',
          'bg-surface-secondary hover:bg-surface-tertiary',
          'border border-border',
          'focus:outline-none focus:ring-2 focus:ring-focus',
          'text-content-secondary hover:text-content-primary',
          sizes.button,
          showLabel && 'pr-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Theme: ${currentTheme?.label}`}
      >
        <Icon className={sizes.icon} />
        {showLabel && <span className={sizes.text}>{currentTheme?.label}</span>}
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select theme"
          className={cn(
            'absolute right-0 z-50 mt-1 min-w-[140px] py-1',
            'bg-surface-primary border border-border',
            'rounded-md shadow-lg animate-fadeIn'
          )}
        >
          {themeModes.map(({ mode: themeMode, label, icon: ThemeIcon }) => (
            <button
              key={themeMode}
              type="button"
              role="option"
              aria-selected={mode === themeMode}
              onClick={() => {
                setMode(themeMode)
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                sizes.text,
                mode === themeMode
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                  : 'text-content-secondary hover:bg-surface-tertiary'
              )}
            >
              <ThemeIcon className={sizes.icon} />
              <span className="flex-1">{label}</span>
              {mode === themeMode && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const SegmentedVariant: React.FC<{
  size: 'sm' | 'md' | 'lg'
  showLabel: boolean
  className?: string
}> = ({ size, showLabel, className }) => {
  const { mode, setMode } = useTheme()
  const sizes = sizeClasses[size]

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode"
      className={cn(
        'inline-flex rounded-lg p-1',
        'bg-surface-secondary border border-border',
        className
      )}
    >
      {themeModes.map(({ mode: themeMode, label, icon: ThemeIcon }) => (
        <button
          key={themeMode}
          type="button"
          role="radio"
          aria-checked={mode === themeMode}
          onClick={() => setMode(themeMode)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md transition-all',
            sizes.segmentPadding,
            sizes.text,
            mode === themeMode
              ? 'bg-surface-primary text-content-primary shadow-sm'
              : 'text-content-tertiary hover:text-content-secondary'
          )}
          title={label}
        >
          <ThemeIcon className={sizes.icon} />
          {showLabel && <span>{label}</span>}
        </button>
      ))}
    </div>
  )
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className,
}) => {
  switch (variant) {
    case 'dropdown':
      return <DropdownVariant size={size} showLabel={showLabel} className={className} />
    case 'segmented':
      return <SegmentedVariant size={size} showLabel={showLabel} className={className} />
    case 'icon':
    default:
      return <IconVariant size={size} showLabel={showLabel} className={className} />
  }
}

ThemeSwitcher.displayName = 'ThemeSwitcher'
