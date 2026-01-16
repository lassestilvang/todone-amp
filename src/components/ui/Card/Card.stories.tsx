import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card'
import { Button } from '../Button'

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Card>

export const Default: Story = {
  args: {
    children: <p className="text-content-secondary">This is a basic card.</p>,
  },
}

export const WithHeader: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-content-secondary">Card content goes here.</p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Action</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-content-secondary">
          Are you sure you want to complete this task?
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Confirm</Button>
        </div>
      </CardFooter>
    </Card>
  ),
}

export const Hoverable: Story = {
  args: {
    hoverable: true,
    children: <p className="text-content-secondary">Hover over me!</p>,
  },
}

export const Clickable: Story = {
  args: {
    hoverable: true,
    onClick: () => alert('Card clicked!'),
    children: <p className="text-content-secondary">Click me!</p>,
  },
}

export const Padding: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card padding="none">
        <p className="p-4 text-content-secondary">No padding</p>
      </Card>
      <Card padding="sm">
        <p className="text-content-secondary">Small padding</p>
      </Card>
      <Card padding="md">
        <p className="text-content-secondary">Medium padding (default)</p>
      </Card>
      <Card padding="lg">
        <p className="text-content-secondary">Large padding</p>
      </Card>
    </div>
  ),
}

export const Shadow: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card shadow="none">
        <p className="text-content-secondary">No shadow</p>
      </Card>
      <Card shadow="sm">
        <p className="text-content-secondary">Small shadow (default)</p>
      </Card>
      <Card shadow="md">
        <p className="text-content-secondary">Medium shadow</p>
      </Card>
      <Card shadow="lg">
        <p className="text-content-secondary">Large shadow</p>
      </Card>
    </div>
  ),
}

export const TaskCard: Story = {
  render: () => (
    <Card hoverable>
      <div className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300" />
        <div className="flex-1">
          <h4 className="font-medium text-content-primary">Complete project report</h4>
          <p className="text-sm text-content-tertiary mt-1">
            Due tomorrow • Work project
          </p>
        </div>
        <span className="text-xs font-semibold text-red-600">!!!</span>
      </div>
    </Card>
  ),
}
