import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeSwitcher } from './ThemeSwitcher'

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'Components/ThemeSwitcher',
  component: ThemeSwitcher,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['icon', 'dropdown', 'segmented'],
      description: 'The visual style of the theme switcher',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'The size of the component',
    },
    showLabel: {
      control: 'boolean',
      description: 'Whether to show the theme label text',
    },
  },
}

export default meta
type Story = StoryObj<typeof ThemeSwitcher>

export const Icon: Story = {
  args: {
    variant: 'icon',
    size: 'md',
    showLabel: false,
  },
}

export const IconWithLabel: Story = {
  args: {
    variant: 'icon',
    size: 'md',
    showLabel: true,
  },
}

export const Dropdown: Story = {
  args: {
    variant: 'dropdown',
    size: 'md',
    showLabel: false,
  },
}

export const DropdownWithLabel: Story = {
  args: {
    variant: 'dropdown',
    size: 'md',
    showLabel: true,
  },
}

export const Segmented: Story = {
  args: {
    variant: 'segmented',
    size: 'md',
    showLabel: false,
  },
}

export const SegmentedWithLabels: Story = {
  args: {
    variant: 'segmented',
    size: 'md',
    showLabel: true,
  },
}

export const SmallSize: Story = {
  args: {
    variant: 'icon',
    size: 'sm',
    showLabel: true,
  },
}

export const LargeSize: Story = {
  args: {
    variant: 'icon',
    size: 'lg',
    showLabel: true,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 items-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-content-tertiary text-sm">Icon (cycles on click)</span>
        <ThemeSwitcher variant="icon" showLabel />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-content-tertiary text-sm">Dropdown (click to select)</span>
        <ThemeSwitcher variant="dropdown" showLabel />
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-content-tertiary text-sm">Segmented control</span>
        <ThemeSwitcher variant="segmented" showLabel />
      </div>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 items-center">
      <div className="flex items-center gap-4">
        <span className="text-content-tertiary text-sm w-12">sm</span>
        <ThemeSwitcher variant="icon" size="sm" showLabel />
        <ThemeSwitcher variant="dropdown" size="sm" />
        <ThemeSwitcher variant="segmented" size="sm" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-content-tertiary text-sm w-12">md</span>
        <ThemeSwitcher variant="icon" size="md" showLabel />
        <ThemeSwitcher variant="dropdown" size="md" />
        <ThemeSwitcher variant="segmented" size="md" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-content-tertiary text-sm w-12">lg</span>
        <ThemeSwitcher variant="icon" size="lg" showLabel />
        <ThemeSwitcher variant="dropdown" size="lg" />
        <ThemeSwitcher variant="segmented" size="lg" />
      </div>
    </div>
  ),
}
