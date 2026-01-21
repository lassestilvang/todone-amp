import React from 'react'
import { cn } from '@/utils/cn'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const variants = {
  default: 'bg-surface-tertiary text-content-secondary',
  primary: 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300',
  success: 'bg-semantic-success-light text-semantic-success',
  warning: 'bg-semantic-warning-light text-semantic-warning',
  error: 'bg-semantic-error-light text-semantic-error',
  info: 'bg-semantic-info-light text-semantic-info',
}

const sizes = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-sm',
  lg: 'px-2.5 py-1 text-sm',
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

Badge.displayName = 'Badge'
