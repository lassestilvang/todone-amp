import type { Meta, StoryObj } from '@storybook/react-vite'
import { TaskItem } from './TaskItem'
import type { Task } from '@/types'

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  content: 'Complete project report',
  priority: 'p2',
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 0,
  reminders: [],
  labels: [],
  attachments: [],
  ...overrides,
})

const meta: Meta<typeof TaskItem> = {
  title: 'Task Components/TaskItem',
  component: TaskItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof TaskItem>

export const Default: Story = {
  args: {
    task: createMockTask(),
  },
}

export const Completed: Story = {
  args: {
    task: createMockTask({
      completed: true,
      completedAt: new Date(),
    }),
  },
}

export const HighPriority: Story = {
  args: {
    task: createMockTask({
      content: 'Urgent: Fix production bug',
      priority: 'p1',
    }),
  },
}

export const MediumPriority: Story = {
  args: {
    task: createMockTask({
      content: 'Review PR changes',
      priority: 'p2',
    }),
  },
}

export const LowPriority: Story = {
  args: {
    task: createMockTask({
      content: 'Update documentation',
      priority: 'p3',
    }),
  },
}

export const NoPriority: Story = {
  args: {
    task: createMockTask({
      content: 'Optional task',
      priority: null,
    }),
  },
}

export const WithDueDate: Story = {
  args: {
    task: createMockTask({
      content: 'Submit quarterly report',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
    }),
  },
}

export const Overdue: Story = {
  args: {
    task: createMockTask({
      content: 'Overdue task',
      priority: 'p1',
      dueDate: new Date(Date.now() - 86400000), // Yesterday
    }),
  },
}

export const WithRecurrence: Story = {
  args: {
    task: createMockTask({
      content: 'Daily standup meeting',
      recurrence: {
        frequency: 'daily',
        interval: 1,
        startDate: new Date(),
        exceptions: [],
      },
    }),
  },
}

export const Selected: Story = {
  args: {
    task: createMockTask(),
    isSelected: true,
  },
}

export const LongContent: Story = {
  args: {
    task: createMockTask({
      content:
        'This is a very long task title that should be truncated properly when it exceeds the available space in the task item component',
    }),
  },
}

export const AllPriorities: Story = {
  render: () => (
    <div className="max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
      <TaskItem task={createMockTask({ id: '1', content: 'Priority 1 - Critical', priority: 'p1' })} />
      <TaskItem task={createMockTask({ id: '2', content: 'Priority 2 - High', priority: 'p2' })} />
      <TaskItem task={createMockTask({ id: '3', content: 'Priority 3 - Medium', priority: 'p3' })} />
      <TaskItem task={createMockTask({ id: '4', content: 'Priority 4 - Low', priority: 'p4' })} />
      <TaskItem task={createMockTask({ id: '5', content: 'No Priority', priority: null })} />
    </div>
  ),
}

export const TaskList: Story = {
  render: () => (
    <div className="max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
      <TaskItem
        task={createMockTask({
          id: '1',
          content: 'Review pull request',
          priority: 'p1',
          dueDate: new Date(),
        })}
      />
      <TaskItem
        task={createMockTask({
          id: '2',
          content: 'Update API documentation',
          priority: 'p2',
        })}
      />
      <TaskItem
        task={createMockTask({
          id: '3',
          content: 'Weekly team sync',
          priority: 'p3',
          recurrence: {
            frequency: 'weekly',
            interval: 1,
            startDate: new Date(),
            exceptions: [],
          },
        })}
      />
      <TaskItem
        task={createMockTask({
          id: '4',
          content: 'Completed migration task',
          completed: true,
          completedAt: new Date(),
        })}
      />
    </div>
  ),
}
