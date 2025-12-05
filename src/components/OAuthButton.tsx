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
          ? 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
          : 'border border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}

      <span>{isGoogle ? 'Google' : 'Outlook'}</span>

      {!loading && (
        <span className="text-xs text-gray-500">
          {isGoogle ? 'G' : 'O'}
        </span>
      )}
    </button>
  )
}
