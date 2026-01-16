import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton, SkeletonText, SkeletonAvatar } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Primitives/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', 'none'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Text: Story = {
  args: {
    variant: 'text',
    width: 200,
  },
}

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 40,
    height: 40,
  },
}

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: 200,
    height: 100,
  },
}

export const TextLines: Story = {
  render: () => (
    <div className="w-80">
      <SkeletonText lines={4} />
    </div>
  ),
}

export const AvatarSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <SkeletonAvatar size="sm" />
      <SkeletonAvatar size="md" />
      <SkeletonAvatar size="lg" />
    </div>
  ),
}

export const TaskSkeleton: Story = {
  render: () => (
    <div className="w-96 p-4 bg-surface-primary rounded-lg border border-border">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={20} height={20} />
        <div className="flex-1">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" className="mt-2" />
        </div>
        <Skeleton variant="text" width={60} />
      </div>
    </div>
  ),
}

export const TaskListSkeleton: Story = {
  render: () => (
    <div className="w-96 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-surface-primary rounded-lg border border-border"
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={20} height={20} />
            <div className="flex-1">
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" className="mt-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const CardSkeleton: Story = {
  render: () => (
    <div className="w-80 p-4 bg-surface-primary rounded-lg border border-border">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar size="md" />
        <div className="flex-1">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="40%" className="mt-1" />
        </div>
      </div>
      <Skeleton variant="rectangular" width="100%" height={120} className="mb-4" />
      <SkeletonText lines={2} />
    </div>
  ),
}

export const NoAnimation: Story = {
  args: {
    variant: 'text',
    width: 200,
    animation: 'none',
  },
}
