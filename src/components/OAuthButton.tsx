import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface OAuthButtonProps {
  service: 'google' | 'outlook'
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({
  service,
  onClick,
  loading = false,
  disabled = false,
  className,
}) => {
  const isGoogle = service === 'google'

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
        isGoogle
          ? 'border border-border bg-surface-primary text-content-primary hover:bg-surface-tertiary'
          : 'border border-semantic-info bg-semantic-info-light text-semantic-info hover:bg-semantic-info-light-hover',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}

      <span>{isGoogle ? 'Google' : 'Outlook'}</span>

      {!loading && (
        <span className="text-xs text-content-tertiary">
          {isGoogle ? 'G' : 'O'}
        </span>
      )}
    </button>
  )
}
