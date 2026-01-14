import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
}

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
}

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
}

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Completed</Badge>
      <Badge variant="warning">In Progress</Badge>
      <Badge variant="error">Overdue</Badge>
      <Badge variant="info">Scheduled</Badge>
    </div>
  ),
}

export const TaskLabels: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="primary">Work</Badge>
      <Badge variant="success">Personal</Badge>
      <Badge variant="warning">Urgent</Badge>
      <Badge variant="info">Meeting</Badge>
      <Badge variant="error">Blocked</Badge>
    </div>
  ),
}
