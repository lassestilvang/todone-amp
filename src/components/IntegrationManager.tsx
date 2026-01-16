import React, { useState } from 'react'
import { Mail, Zap, Chrome, Unlink2, Link as LinkIcon, Settings } from 'lucide-react'
import { Button } from './Button'
import { useIntegrationStore } from '@/store/integrationStore'
import { logger } from '@/utils/logger'

interface Integration {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  isConnected: boolean
  category: 'email' | 'automation' | 'extension'
}

export const IntegrationManager: React.FC = () => {
  const { userIntegrations } = useIntegrationStore()
  const [showSettings, setShowSettings] = useState<string | null>(null)

  const integrations: Integration[] = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: <Mail className="h-6 w-6" />,
      description: 'Forward emails as tasks to Todone',
      isConnected: userIntegrations.some((e) => (e as { service?: string }).service === 'gmail'),
      category: 'email',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      icon: <Zap className="h-6 w-6" />,
      description: 'Connect 1000+ apps with Zapier automation',
      isConnected: false,
      category: 'automation',
    },
    {
      id: 'chrome',
      name: 'Chrome Extension',
      icon: <Chrome className="h-6 w-6" />,
      description: 'Quick add tasks from any webpage',
      isConnected: false,
      category: 'extension',
    },
  ]

  const handleConnect = (integrationId: string) => {
    logger.info(`Connecting ${integrationId}...`)
    // In production, this would initiate OAuth flow or show connection modal
  }

  const handleDisconnect = (integrationId: string) => {
    logger.info(`Disconnecting ${integrationId}...`)
    // In production, this would disconnect and cleanup
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-content-primary">Integrations</h2>
        <p className="text-sm text-content-secondary">
          Connected: {integrations.filter((i) => i.isConnected).length} of {integrations.length}
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={`flex flex-col gap-3 rounded-lg border p-4 ${
              integration.isConnected
                ? 'border-brand-200 bg-brand-50'
                : 'border-border bg-surface-primary'
            }`}
          >
            {/* Icon and Title */}
            <div className="flex items-center justify-between">
              <div className={`${integration.isConnected ? 'text-brand-500' : 'text-content-tertiary'}`}>
                {integration.icon}
              </div>
              {integration.isConnected && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Connected
                </span>
              )}
            </div>

            {/* Name and Description */}
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-content-primary">{integration.name}</h3>
              <p className="text-sm text-content-secondary">{integration.description}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 border-t border-border pt-3">
              {integration.isConnected ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setShowSettings(
                        showSettings === integration.id ? null : integration.id
                      )
                    }
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(integration.id)}
                  >
                    <Unlink2 className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleConnect(integration.id)}
                  className="w-full"
                >
                  <LinkIcon className="h-4 w-4" />
                  Connect
                </Button>
              )}
            </div>

            {/* Settings Panel */}
            {showSettings === integration.id && integration.isConnected && (
              <div className="flex flex-col gap-3 border-t border-border pt-3">
                {integration.id === 'gmail' && (
                  <>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-border text-brand-500"
                      />
                      <span className="text-sm text-content-secondary">Auto-create tasks from emails</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-border text-brand-500"
                      />
                      <span className="text-sm text-content-secondary">Extract due dates</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-border text-brand-500"
                      />
                      <span className="text-sm text-content-secondary">Extract attachments</span>
                    </label>
                    <p className="text-xs text-content-tertiary">
                      Forward emails to: <code>add@todone.app</code>
                    </p>
                  </>
                )}

                {integration.id === 'zapier' && (
                  <>
                    <p className="text-sm text-content-secondary">
                      Create Zaps to connect Todone with your favorite apps
                    </p>
                    <Button variant="secondary" size="sm" className="w-full">
                      Go to Zapier
                    </Button>
                  </>
                )}

                {integration.id === 'chrome' && (
                  <>
                    <p className="text-sm text-content-secondary">Extension version: 1.0.0</p>
                    <Button variant="secondary" size="sm" className="w-full">
                      View in Chrome Web Store
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* API Keys Section */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-primary p-4">
        <h3 className="font-semibold text-content-primary">API & Webhooks</h3>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-content-secondary">API Key</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-surface-tertiary px-3 py-2 font-mono text-xs text-content-secondary">
                todone_api_xxxxxxxxxxxxxxxxxxxxx
              </code>
              <Button variant="ghost" size="sm">
                Copy
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-content-secondary">Webhook URL</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-surface-tertiary px-3 py-2 font-mono text-xs text-content-secondary">
                https://todone.app/webhooks/xxxxx
              </code>
              <Button variant="ghost" size="sm">
                Copy
              </Button>
            </div>
          </div>

          <p className="text-xs text-content-tertiary">
            Use these to build custom integrations or automate Todone workflows.{' '}
            <a href="#" className="text-brand-500 hover:underline">
              View API docs
            </a>
          </p>
        </div>
      </div>

      {/* Upcoming Integrations */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-secondary p-4">
        <h3 className="font-semibold text-content-primary">Coming Soon</h3>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-surface-primary" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-content-secondary">Slack Integration</p>
              <p className="text-xs text-content-tertiary">Manage tasks from Slack</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-surface-primary" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-content-secondary">Microsoft Teams</p>
              <p className="text-xs text-content-tertiary">Sync with Teams channels</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-surface-primary" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-content-secondary">Linear Integration</p>
              <p className="text-xs text-content-tertiary">Sync with Linear issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
