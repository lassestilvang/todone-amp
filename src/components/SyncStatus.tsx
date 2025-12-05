import React from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { CalendarIntegration } from '@/types'

interface SyncStatusProps {
  integration: CalendarIntegration
  className?: string
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ integration, className }) => {
  const getStatusIcon = () => {
    switch (integration.syncStatus) {
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'idle':
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (integration.syncStatus) {
      case 'syncing':
        return 'text-blue-600'
      case 'error':
        return 'text-red-600'
      case 'idle':
      default:
        return 'text-green-600'
    }
  }

  const getStatusText = () => {
    switch (integration.syncStatus) {
      case 'syncing':
        return 'Syncing...'
      case 'error':
        return `Error: ${integration.syncError || 'Unknown error'}`
      case 'idle':
      default:
        return integration.lastSyncAt
          ? `Last synced ${getRelativeTime(integration.lastSyncAt)}`
          : 'Ready to sync'
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
        integration.syncStatus === 'syncing' && 'bg-blue-50 text-blue-700',
        integration.syncStatus === 'error' && 'bg-red-50 text-red-700',
        integration.syncStatus === 'idle' && 'bg-green-50 text-green-700',
        className
      )}
    >
      <div className={cn('flex-shrink-0', getStatusColor())}>
        {getStatusIcon()}
      </div>
      <div className="flex-1">
        <p className="font-medium">{getStatusText()}</p>
      </div>
    </div>
  )
}
