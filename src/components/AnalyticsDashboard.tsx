import React, { useState } from 'react'
import { BarChart3, Users, TrendingUp, FileText } from 'lucide-react'
import { CompletionStats } from './CompletionStats'
import { ProductivityChart } from './ProductivityChart'
import { AtRiskTasks } from './AtRiskTasks'
import { TeamAnalytics } from './TeamAnalytics'
import { ComparisonAnalytics } from './ComparisonAnalytics'
import { ReportGenerator } from './ReportGenerator'
import { cn } from '@/utils/cn'

type TabType = 'personal' | 'team' | 'comparison' | 'reports'

interface AnalyticsDashboardProps {
  teamId?: string
  className?: string
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ teamId, className }) => {
  const [activeTab, setActiveTab] = useState<TabType>('personal')

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'personal', label: 'Personal Analytics', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'team', label: 'Team Analytics', icon: <Users className="h-4 w-4" /> },
    { id: 'comparison', label: 'Comparison', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
        <p className="mt-1 text-sm text-gray-600">Track your productivity and team performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Personal Analytics */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <CompletionStats />
            <ProductivityChart granularity="weekly" />
            <AtRiskTasks />
          </div>
        )}

        {/* Team Analytics */}
        {activeTab === 'team' && teamId && <TeamAnalytics teamId={teamId} />}

        {/* Comparison Analytics */}
        {activeTab === 'comparison' && <ComparisonAnalytics />}

        {/* Reports */}
        {activeTab === 'reports' && <ReportGenerator />}
      </div>
    </div>
  )
}
