import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Primitives/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Avatar>

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?u=john',
    name: 'John Doe',
    size: 'md',
  },
}

export const WithInitials: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
}

export const SingleName: Story = {
  args: {
    name: 'Alice',
    size: 'md',
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Avatar name="XS Size" size="xs" />
      <Avatar name="SM Size" size="sm" />
      <Avatar name="MD Size" size="md" />
      <Avatar name="LG Size" size="lg" />
      <Avatar name="XL Size" size="xl" />
    </div>
  ),
}

export const DifferentColors: Story = {
  render: () => (
    <div className="flex gap-2">
      <Avatar name="Alice" />
      <Avatar name="Bob" />
      <Avatar name="Charlie" />
      <Avatar name="Diana" />
      <Avatar name="Eve" />
      <Avatar name="Frank" />
      <Avatar name="Grace" />
      <Avatar name="Henry" />
    </div>
  ),
}

export const BrokenImage: Story = {
  args: {
    src: 'https://broken-image-url.com/404.jpg',
    name: 'John Doe',
    size: 'lg',
  },
}

export const TeamMembers: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar name="Alice Smith" className="ring-2 ring-white" />
      <Avatar name="Bob Jones" className="ring-2 ring-white" />
      <Avatar name="Charlie Brown" className="ring-2 ring-white" />
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-surface-tertiary text-content-secondary text-sm font-medium ring-2 ring-white">
        +5
      </div>
    </div>
  ),
}
