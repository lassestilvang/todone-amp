import React, { useState } from 'react'
import {
  Calendar,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { CalendarIntegration } from '@/components/CalendarIntegration'
import { EmailIntegration } from '@/components/EmailIntegration'
import { SlackIntegration } from '@/components/SlackIntegration'
import { cn } from '@/utils/cn'

type IntegrationTab = 'calendar' | 'email' | 'slack'

interface IntegrationSettingsProps {
  defaultTab?: IntegrationTab
  className?: string
}

interface IntegrationSection {
  id: IntegrationTab
  icon: React.ReactNode
  title: string
  description: string
  component: React.ReactNode
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({
  defaultTab = 'calendar',
  className,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<IntegrationTab>>(
    new Set([defaultTab])
  )

  const sections: IntegrationSection[] = [
    {
      id: 'calendar',
      icon: <Calendar className="h-5 w-5" />,
      title: 'Calendar Integration',
      description: 'Sync with Google Calendar and Outlook',
      component: <CalendarIntegration platform="google" />,
    },
    {
      id: 'email',
      icon: <Mail className="h-5 w-5" />,
      title: 'Email Integration',
      description: 'Create tasks from emails and get reminders',
      component: <EmailIntegration />,
    },
    {
      id: 'slack',
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Slack Integration',
      description: 'Get Slack notifications and manage tasks',
      component: <SlackIntegration />,
    },
  ]

  const toggleSection = (id: IntegrationTab) => {
    const newSections = new Set(expandedSections)
    if (newSections.has(id)) {
      newSections.delete(id)
    } else {
      newSections.add(id)
    }
    setExpandedSections(newSections)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-content-primary">Integrations</h1>
        <p className="mt-1 text-content-secondary">
          Connect external services to enhance your productivity
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id)

          return (
            <div
              key={section.id}
              className="rounded-lg border border-border bg-surface-primary"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-surface-tertiary"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="text-content-secondary">{section.icon}</div>
                  <div>
                    <h2 className="font-semibold text-content-primary">{section.title}</h2>
                    <p className="text-sm text-content-secondary">{section.description}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-content-tertiary" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-content-tertiary" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-border px-4 py-4">
                  {section.component}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="font-medium text-semantic-info">Coming Soon</h3>
        <p className="mt-1 text-sm text-semantic-info">
          More integrations like Asana, Monday.com, Zapier, and custom webhooks
        </p>
      </div>
    </div>
  )
}
