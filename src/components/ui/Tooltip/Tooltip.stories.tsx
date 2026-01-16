import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tooltip } from './Tooltip'
import { Button } from '../Button'
import { HelpCircle, Info } from 'lucide-react'

const meta: Meta<typeof Tooltip> = {
  title: 'Primitives/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    delay: {
      control: 'number',
    },
  },
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <Button>Hover me</Button>,
  },
}

export const Positions: Story = {
  render: () => (
    <div className="flex gap-8">
      <Tooltip content="Tooltip on top" position="top">
        <Button>Top</Button>
      </Tooltip>
      <Tooltip content="Tooltip on bottom" position="bottom">
        <Button>Bottom</Button>
      </Tooltip>
      <Tooltip content="Tooltip on left" position="left">
        <Button>Left</Button>
      </Tooltip>
      <Tooltip content="Tooltip on right" position="right">
        <Button>Right</Button>
      </Tooltip>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="text-content-secondary">Karma Points</span>
      <Tooltip content="Points earned by completing tasks">
        <button type="button" className="text-gray-400 hover:text-gray-600">
          <HelpCircle className="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  ),
}

export const LongContent: Story = {
  args: {
    content:
      'This is a longer tooltip that provides more detailed information about the element.',
    children: <Button variant="ghost">More Info</Button>,
  },
}

export const NoDelay: Story = {
  args: {
    content: 'Instant tooltip',
    delay: 0,
    children: <Button>Instant</Button>,
  },
}

export const SlowDelay: Story = {
  args: {
    content: 'Slow tooltip (1 second delay)',
    delay: 1000,
    children: <Button>Slow</Button>,
  },
}

export const WithInfoIcon: Story = {
  render: () => (
    <Tooltip content="Click to learn more about this feature" position="right">
      <button
        type="button"
        className="p-2 rounded-full hover:bg-surface-tertiary"
      >
        <Info className="h-5 w-5 text-blue-500" />
      </button>
    </Tooltip>
  ),
}
