import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import {
  TaskListSkeleton,
  TaskDetailSkeleton,
  BoardViewSkeleton,
  CalendarSkeleton,
  AnalyticsSkeleton,
  CommentThreadSkeleton,
  SearchResultsSkeleton,
} from '@/components/TaskListSkeleton'

describe('TaskListSkeleton', () => {
  it('renders with default count', () => {
    const { container } = render(<TaskListSkeleton />)

    const items = container.querySelectorAll('div[class*="border-b"]')
    expect(items.length).toBe(3)
  })

  it('renders custom count', () => {
    const { container } = render(<TaskListSkeleton count={5} />)

    const items = container.querySelectorAll('div[class*="border-b"]')
    expect(items.length).toBe(5)
  })

  it('applies custom className', () => {
    const { container } = render(
      <TaskListSkeleton className="custom-class" />,
    )

    const wrapper = container.firstChild
    expect(wrapper).toHaveClass('custom-class')
  })

  it('renders with avatar when showAvatar is true', () => {
    const { container } = render(<TaskListSkeleton showAvatar={true} />)

    const avatars = container.querySelectorAll('div[class*="w-5"]')
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('has animate-pulse class for animation', () => {
    const { container } = render(<TaskListSkeleton />)

    const animatedElements = container.querySelectorAll('[class*="animate-pulse"]')
    expect(animatedElements.length).toBeGreaterThan(0)
  })
})

describe('TaskDetailSkeleton', () => {
  it('renders task detail skeleton', () => {
    const { container } = render(<TaskDetailSkeleton />)

    expect(container.querySelector('[class*="space-y-4"]')).toBeInTheDocument()
    const animatedElements = container.querySelectorAll('[class*="animate-pulse"]')
    expect(animatedElements.length).toBeGreaterThan(0)
  })

  it('has placeholder for title', () => {
    const { container } = render(<TaskDetailSkeleton />)

    const titleSkeleton = container.querySelector('div[class*="h-6"]')
    expect(titleSkeleton).toBeInTheDocument()
  })

  it('has placeholder for description', () => {
    const { container } = render(<TaskDetailSkeleton />)

    const descriptionSkeletons = container.querySelectorAll('div[class*="h-4"]')
    expect(descriptionSkeletons.length).toBeGreaterThan(0)
  })
})

describe('BoardViewSkeleton', () => {
  it('renders board skeleton', () => {
    const { container } = render(<BoardViewSkeleton />)

    expect(container.querySelector('[class*="flex"][class*="gap-4"]')).toBeInTheDocument()
  })

  it('renders multiple columns', () => {
    const { container } = render(<BoardViewSkeleton />)

    const columns = container.querySelectorAll('[class*="min-w-72"]')
    expect(columns.length).toBe(3)
  })

  it('each column has skeleton cards', () => {
    const { container } = render(<BoardViewSkeleton />)

    const cards = container.querySelectorAll('[class*="rounded-lg"][class*="bg-surface-primary"]')
    expect(cards.length).toBeGreaterThan(0)
  })
})

describe('CalendarSkeleton', () => {
  it('renders calendar skeleton', () => {
    const { container } = render(<CalendarSkeleton />)

    expect(container.querySelector('[class*="space-y-4"]')).toBeInTheDocument()
  })

  it('has calendar grid', () => {
    const { container } = render(<CalendarSkeleton />)

    const rows = container.querySelectorAll('[class*="flex"][class*="gap-2"]')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('has header controls', () => {
    const { container } = render(<CalendarSkeleton />)

    const controls = container.querySelectorAll('[class*="h-8"]')
    expect(controls.length).toBeGreaterThan(0)
  })
})

describe('AnalyticsSkeleton', () => {
  it('renders analytics skeleton', () => {
    const { container } = render(<AnalyticsSkeleton />)

    expect(container.querySelector('[class*="space-y-4"]')).toBeInTheDocument()
  })

  it('has stat cards', () => {
    const { container } = render(<AnalyticsSkeleton />)

    const stats = container.querySelectorAll('[class*="grid"]')[0]
    expect(stats).toBeInTheDocument()
  })

  it('has chart placeholder', () => {
    const { container } = render(<AnalyticsSkeleton />)

    const chart = container.querySelector('[class*="h-64"]')
    expect(chart).toBeInTheDocument()
  })
})

describe('CommentThreadSkeleton', () => {
  it('renders comment skeleton', () => {
    const { container } = render(<CommentThreadSkeleton />)

    expect(container.querySelector('[class*="space-y-4"]')).toBeInTheDocument()
  })

  it('has comment avatars', () => {
    const { container } = render(<CommentThreadSkeleton />)

    const avatars = container.querySelectorAll('[class*="rounded-full"]')
    expect(avatars.length).toBeGreaterThan(0)
  })

  it('has comment text placeholders', () => {
    const { container } = render(<CommentThreadSkeleton />)

    const textSkeletons = container.querySelectorAll('[class*="h-3"]')
    expect(textSkeletons.length).toBeGreaterThan(0)
  })
})

describe('SearchResultsSkeleton', () => {
  it('renders search results skeleton', () => {
    const { container } = render(<SearchResultsSkeleton />)

    expect(container.querySelector('[class*="space-y-3"]')).toBeInTheDocument()
  })

  it('has multiple result items', () => {
    const { container } = render(<SearchResultsSkeleton />)

    const results = container.querySelectorAll('[class*="border"]')
    expect(results.length).toBe(5)
  })

  it('each result has title and description placeholders', () => {
    const { container } = render(<SearchResultsSkeleton />)

    const skeletonGroups = container.querySelectorAll('[class*="rounded-lg"]')
    expect(skeletonGroups.length).toBeGreaterThan(0)
  })
})
