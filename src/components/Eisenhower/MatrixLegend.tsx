import React from 'react'
import { cn } from '@/utils/cn'

interface QuadrantInfo {
  id: string
  title: string
  subtitle: string
  color: string
  bgColor: string
}

const quadrants: QuadrantInfo[] = [
  {
    id: 'do-first',
    title: 'Do First',
    subtitle: 'Urgent & Important',
    color: 'text-semantic-error',
    bgColor: 'bg-semantic-error-light',
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Not Urgent but Important',
    color: 'text-semantic-info',
    bgColor: 'bg-semantic-info-light',
  },
  {
    id: 'delegate',
    title: 'Delegate',
    subtitle: 'Urgent but Not Important',
    color: 'text-semantic-warning',
    bgColor: 'bg-semantic-warning-light',
  },
  {
    id: 'eliminate',
    title: 'Eliminate',
    subtitle: 'Not Urgent & Not Important',
    color: 'text-content-secondary',
    bgColor: 'bg-surface-tertiary',
  },
]

interface MatrixLegendProps {
  className?: string
}

export const MatrixLegend: React.FC<MatrixLegendProps> = ({ className }) => {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {quadrants.map((q) => (
        <div key={q.id} className="flex items-center gap-2">
          <div className={cn('w-3 h-3 rounded', q.bgColor)} />
          <div>
            <span className={cn('text-sm font-medium', q.color)}>{q.title}</span>
            <span className="text-xs text-content-tertiary ml-1">({q.subtitle})</span>
          </div>
        </div>
      ))}
    </div>
  )
}
