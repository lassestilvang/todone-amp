import React, { useEffect, useState } from 'react'
import {
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  RefreshCw,
  Settings,
} from 'lucide-react'
import { useIntegrationStore } from '@/store/integrationStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'
import type { CalendarIntegration as CalendarIntegrationType } from '@/types'

interface CalendarIntegrationProps {
  className?: string
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  className,
}) => {
  const user = useAuthStore((state) => state.user)
  const {
    calendarIntegrations,
    getCalendarIntegrations,
    removeCalendarIntegration,
    syncCalendarEvents,
    isLoading,
    error,
    disconnectCalendar,
  } = useIntegrationStore()

  const [selectedService, setSelectedService] = useState<'google' | 'outlook' | null>(null)

  useEffect(() => {
    if (user?.id) {
      getCalendarIntegrations(user.id)
    }
  }, [user?.id, getCalendarIntegrations])

  const handleOAuthClick = async (service: 'google' | 'outlook') => {
    setSelectedService(service)
    // Simulate OAuth flow - in production, redirect to OAuth provider
    const redirectUri = `${window.location.origin}/auth/callback`

    // Stub: Log OAuth flow
    console.log(`OAuth flow for ${service}:`, { redirectUri })

    // For demo purposes, create a mock integration
    if (user?.id) {
      const mockIntegration: CalendarIntegrationType = {
        id: `cal-${Date.now()}`,
        userId: user.id,
        service,
        accessToken: 'mock_token_' + Date.now(),
        refreshToken: 'mock_refresh_token',
        expiresAt: new Date(Date.now() + 3600000),
        calendarId: `${service}-calendar-${Date.now()}`,
        calendarName: `My ${service.charAt(0).toUpperCase() + service.slice(1)} Calendar`,
        displayColor: '#0ea5e9',
        selectedCalendars: [`primary-${service}`],
        syncEnabled: true,
        syncDirection: 'two-way',
        syncFrequency: 'realtime',
        showExternalEvents: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connectedAt: new Date(),
        syncStatus: 'idle',
      }

      await useIntegrationStore.getState().addCalendarIntegration(mockIntegration)
      setSelectedService(null)
    }
  }

  const handleDisconnect = async (id: string, service: string) => {
    if (window.confirm(`Disconnect ${service}? Synced events will remain in Todone.`)) {
      await removeCalendarIntegration(id)
      if (user?.id) {
        await disconnectCalendar(user.id, service)
      }
    }
  }

  const handleSync = async (integration: CalendarIntegrationType) => {
    if (user?.id) {
      await syncCalendarEvents(user.id, integration.service)
    }
  }

  const googleIntegration = calendarIntegrations.find((i) => i.service === 'google')
  const outlookIntegration = calendarIntegrations.find((i) => i.service === 'outlook')

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">Calendar Integration</h2>
      </div>

      {error && (
        <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Google Calendar */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <span className="text-lg font-bold text-blue-600">G</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Google Calendar</h3>
                {googleIntegration ? (
                  <p className="text-xs text-gray-500">Connected to {googleIntegration.calendarName}</p>
                ) : (
                  <p className="text-xs text-gray-500">Not connected</p>
                )}
              </div>
            </div>
            {googleIntegration ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Connected</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleOAuthClick('google')}
                disabled={isLoading && selectedService === 'google'}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading && selectedService === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Connect
              </button>
            )}
          </div>

          {googleIntegration && (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Sync Status</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {googleIntegration.syncStatus === 'syncing' ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Syncing...
                        </span>
                      ) : googleIntegration.lastSyncAt ? (
                        `Last synced ${new Date(googleIntegration.lastSyncAt).toLocaleDateString()}`
                      ) : (
                        'Never synced'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSync(googleIntegration)}
                    disabled={isLoading || googleIntegration.syncStatus === 'syncing'}
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleDisconnect(googleIntegration.id, 'google')}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Outlook Calendar */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Outlook Calendar</h3>
                {outlookIntegration ? (
                  <p className="text-xs text-gray-500">Connected to {outlookIntegration.calendarName}</p>
                ) : (
                  <p className="text-xs text-gray-500">Not connected</p>
                )}
              </div>
            </div>
            {outlookIntegration ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Connected</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleOAuthClick('outlook')}
                disabled={isLoading && selectedService === 'outlook'}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading && selectedService === 'outlook' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                Connect
              </button>
            )}
          </div>

          {outlookIntegration && (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-700">Sync Status</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {outlookIntegration.syncStatus === 'syncing' ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Syncing...
                        </span>
                      ) : outlookIntegration.lastSyncAt ? (
                        `Last synced ${new Date(outlookIntegration.lastSyncAt).toLocaleDateString()}`
                      ) : (
                        'Never synced'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSync(outlookIntegration)}
                    disabled={isLoading || outlookIntegration.syncStatus === 'syncing'}
                    className="rounded-lg border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleDisconnect(outlookIntegration.id, 'outlook')}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Sync Settings</h3>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Show External Events</label>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Sync Direction</label>
            <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="one-way">One-way (Read-only)</option>
              <option value="two-way">Two-way (Bidirectional)</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Sync Frequency</label>
            <select className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
