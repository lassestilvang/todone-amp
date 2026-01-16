import React, { useEffect } from 'react'
import { ChevronDown, X, Edit2 } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboardStore'
import { CompletionStats } from './CompletionStats'
import { ProductivityChart } from './ProductivityChart'
import { AtRiskTasks } from './AtRiskTasks'
import { TeamAnalytics } from './TeamAnalytics'
import { cn } from '@/utils/cn'

interface DashboardLayoutProps {
  userId: string
  teamId?: string
  className?: string
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  userId,
  teamId,
  className,
}) => {
  const dashboardStore = useDashboardStore()

  useEffect(() => {
    dashboardStore.loadLayouts(userId)
  }, [userId, dashboardStore])

  const activeLayout = dashboardStore.getActiveLayout()

  if (!activeLayout) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="rounded-lg border border-border bg-surface-secondary p-8 text-center">
          <p className="text-content-secondary">No dashboard layout found. Create one to get started.</p>
          <button
            onClick={() => dashboardStore.createLayout(userId, 'My Dashboard')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create Dashboard
          </button>
        </div>
      </div>
    )
  }

  const renderWidget = (type: string) => {
    switch (type) {
      case 'completion-stats':
        return <CompletionStats />
      case 'productivity-chart':
        return <ProductivityChart granularity="weekly" />
      case 'at-risk-tasks':
        return <AtRiskTasks />
      case 'team-analytics':
        return teamId ? <TeamAnalytics teamId={teamId} /> : null
      default:
        return null
    }
  }

  const sortedWidgets = [...activeLayout.widgets].sort((a, b) => a.position - b.position)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-content-primary">{activeLayout.name}</h1>
          <p className="mt-1 text-sm text-content-secondary">Customize your dashboard layout</p>
        </div>

        <div className="flex gap-2">
          {dashboardStore.editMode ? (
            <button
              onClick={() => dashboardStore.setEditMode(false)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Done Editing
            </button>
          ) : (
            <button
              onClick={() => dashboardStore.setEditMode(true)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary hover:bg-surface-tertiary"
            >
              <Edit2 className="h-4 w-4" />
              Edit Layout
            </button>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {sortedWidgets.map((widget) => (
          <div
            key={widget.id}
            className={cn(
              'rounded-lg border border-border bg-surface-primary overflow-hidden',
              dashboardStore.editMode && 'ring-2 ring-blue-400'
            )}
          >
            {/* Widget Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface-secondary px-6 py-4">
              <h3 className="font-semibold text-content-primary">
                {widget.type === 'completion-stats' && 'Completion Stats'}
                {widget.type === 'productivity-chart' && 'Productivity Chart'}
                {widget.type === 'at-risk-tasks' && 'At-Risk Tasks'}
                {widget.type === 'team-analytics' && 'Team Analytics'}
              </h3>

              <div className="flex gap-2">
                {dashboardStore.editMode && (
                  <>
                    <button
                      onClick={() =>
                        dashboardStore.toggleWidgetMinimize(activeLayout.id, widget.id)
                      }
                      className="p-1 text-content-secondary hover:text-content-primary"
                      title="Minimize"
                    >
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition',
                          widget.minimized && '-rotate-90'
                        )}
                      />
                    </button>

                    <button
                      onClick={() => dashboardStore.removeWidget(activeLayout.id, widget.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Remove widget"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Widget Content */}
            {!widget.minimized && (
              <div className="p-6">
                {renderWidget(widget.type)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Widget Button (Edit Mode) */}
      {dashboardStore.editMode && (
        <div className="rounded-lg border-2 border-dashed border-border bg-surface-secondary p-8 text-center">
          <p className="text-sm font-medium text-content-secondary mb-4">Add a new widget</p>

          <div className="flex flex-wrap justify-center gap-2">
            {[
              { type: 'completion-stats' as const, label: 'Completion Stats' },
              { type: 'productivity-chart' as const, label: 'Productivity Chart' },
              { type: 'at-risk-tasks' as const, label: 'At-Risk Tasks' },
              ...(teamId ? [{ type: 'team-analytics' as const, label: 'Team Analytics' }] : []),
            ].map((widget) => (
              <button
                key={widget.type}
                onClick={() =>
                  dashboardStore.addWidget(activeLayout.id, {
                    type: widget.type,
                    position: sortedWidgets.length,
                    minimized: false,
                  })
                }
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                + {widget.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
