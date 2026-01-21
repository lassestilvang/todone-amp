import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { logger } from '@/utils/logger'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAState {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  needsRefresh: boolean
  isUpdating: boolean
}

/**
 * Custom hook for PWA functionality
 * Handles service worker registration, online/offline detection, and install prompts
 */
export const usePWA = () => {
  const [state, setState] = useState<PWAState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstallable: false,
    isInstalled: false,
    needsRefresh: false,
    isUpdating: false,
  })
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      logger.info('[PWA] Service worker registered:', registration)
    },
    onRegisterError(error) {
      logger.error('[PWA] Service worker registration failed:', error)
    },
    onNeedRefresh() {
      logger.info('[PWA] New content available, refresh needed')
      setState((prev) => ({ ...prev, needsRefresh: true }))
    },
    onOfflineReady() {
      logger.info('[PWA] App ready to work offline')
    },
  })

  // Sync needRefresh state
  useEffect(() => {
    setState((prev) => ({ ...prev, needsRefresh: needRefresh }))
  }, [needRefresh])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setState((prev) => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState((prev) => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as InstallPromptEvent)
      setState((prev) => ({ ...prev, isInstallable: true }))
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
      setState((prev) => ({ ...prev, isInstalled: true, isInstallable: false }))
      logger.info('[PWA] App installed')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if app is already installed
    if ('getInstalledRelatedApps' in navigator) {
      const navWithApps = navigator as Navigator & { getInstalledRelatedApps: () => Promise<unknown[]> }
      if (typeof navWithApps.getInstalledRelatedApps === 'function') {
        navWithApps.getInstalledRelatedApps().then((apps: unknown[]) => {
          if (apps && apps.length > 0) {
            setState((prev) => ({ ...prev, isInstalled: true }))
          }
        })
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const install = async () => {
    if (!installPrompt) {
      logger.warn('[PWA] Install prompt not available')
      return
    }

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      logger.info('[PWA] User choice:', outcome)

      if (outcome === 'accepted') {
        setInstallPrompt(null)
        setState((prev) => ({ ...prev, isInstallable: false }))
      }
    } catch (error) {
      logger.error('[PWA] Installation failed:', error)
    }
  }

  const refresh = async () => {
    setState((prev) => ({ ...prev, isUpdating: true }))
    try {
      await updateServiceWorker(true)
      setNeedRefresh(false)
    } finally {
      setState((prev) => ({ ...prev, isUpdating: false, needsRefresh: false }))
    }
  }

  const dismissRefresh = () => {
    setNeedRefresh(false)
    setState((prev) => ({ ...prev, needsRefresh: false }))
  }

  return {
    ...state,
    installPrompt,
    install,
    refresh,
    dismissRefresh,
  }
}
