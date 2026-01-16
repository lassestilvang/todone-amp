import React, { useId } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-content-secondary mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-tertiary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-3 py-2 border border-input-border rounded-md',
              'bg-input-bg',
              'text-base text-content-primary',
              'placeholder-input-placeholder',
              'focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent',
              'disabled:bg-input-disabled-bg disabled:text-content-disabled disabled:cursor-not-allowed',
              error && 'border-semantic-error focus:ring-semantic-error',
              icon && 'pl-10',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-semantic-error">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
