import React from 'react'
import { cn } from '@/utils/cn'

export interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  onClick?: () => void
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

const shadows = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
  hoverable = false,
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-surface-primary rounded-lg border border-border',
        paddings[padding],
        shadows[shadow],
        hoverable && 'transition-shadow hover:shadow-md cursor-pointer',
        onClick && 'w-full text-left',
        className
      )}
    >
      {children}
    </Component>
  )
}

export interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <div className={cn('pb-3 border-b border-border', className)}>
    {children}
  </div>
)

export interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <h3 className={cn('text-lg font-semibold text-content-primary', className)}>
    {children}
  </h3>
)

export interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('py-3', className)}>{children}</div>
)

export interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn('pt-3 border-t border-border', className)}>
    {children}
  </div>
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'
