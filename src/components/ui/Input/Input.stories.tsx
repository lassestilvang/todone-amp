import type { Meta, StoryObj } from '@storybook/react-vite'
import { Search, Mail, Lock } from 'lucide-react'
import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'Primitives/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
}

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    error: 'Password must be at least 8 characters',
    defaultValue: '123',
  },
}

export const WithIcon: Story = {
  args: {
    placeholder: 'Search tasks...',
    icon: <Search className="w-4 h-4" />,
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input placeholder="Default input" />
      <Input label="With Label" placeholder="Enter value" />
      <Input icon={<Search className="w-4 h-4" />} placeholder="Search..." />
      <Input icon={<Mail className="w-4 h-4" />} label="Email" type="email" />
      <Input
        icon={<Lock className="w-4 h-4" />}
        label="Password"
        type="password"
        error="Required field"
      />
      <Input disabled defaultValue="Disabled" />
    </div>
  ),
}
