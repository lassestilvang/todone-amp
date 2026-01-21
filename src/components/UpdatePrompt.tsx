import { RefreshCw, X } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export function UpdatePrompt() {
  const { needsRefresh, isUpdating, refresh, dismissRefresh } = usePWA()

  if (!needsRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="rounded-lg bg-surface-elevated p-4 shadow-lg border border-border-default">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-accent-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-text-primary">Update available</h3>
            <p className="mt-1 text-sm text-text-secondary">
              A new version of Todone is available. Refresh to update.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={refresh}
                disabled={isUpdating}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
              <button
                onClick={dismissRefresh}
                disabled={isUpdating}
                className="inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={dismissRefresh}
            disabled={isUpdating}
            className="flex-shrink-0 text-text-muted hover:text-text-secondary disabled:opacity-50"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
