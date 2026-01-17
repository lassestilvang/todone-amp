import React, { useState } from 'react'
import { Download, X } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import { cn } from '@/utils/cn'

export interface InstallPromptProps {
  className?: string
}

/**
 * Install prompt component for PWA installation
 * Shows on supported browsers and hides after user action
 */
export const InstallPrompt: React.FC<InstallPromptProps> = ({ className }) => {
  const { isInstallable, isInstalled, install } = usePWA()
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show if already installed or dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:max-w-sm',
        'bg-gradient-to-r from-blue-600 to-brand-600 text-white',
        'rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-5',
        'z-40',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Download className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">Install Todone</h3>
          <p className="text-xs text-blue-100 mb-3">
            Get quick access to your tasks with our app
          </p>
          <div className="flex gap-2">
            <button
              onClick={install}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded',
                'bg-white text-brand-600 hover:bg-brand-50',
                'transition-colors'
              )}
            >
              Install
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded',
                'bg-blue-700 text-white hover:bg-blue-800',
                'transition-colors'
              )}
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-blue-100 hover:text-white flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
