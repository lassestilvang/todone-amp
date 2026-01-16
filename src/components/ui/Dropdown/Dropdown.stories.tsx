import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
} from './Dropdown'
import { Edit, Trash2, Copy, Share, Archive, MoreHorizontal, Flag } from 'lucide-react'

const meta: Meta<typeof Dropdown> = {
  title: 'Primitives/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Dropdown>

export const Default: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>Options</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem>Option 1</DropdownItem>
        <DropdownItem>Option 2</DropdownItem>
        <DropdownItem>Option 3</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>Actions</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem icon={<Edit className="h-4 w-4" />}>Edit</DropdownItem>
        <DropdownItem icon={<Copy className="h-4 w-4" />}>Duplicate</DropdownItem>
        <DropdownItem icon={<Share className="h-4 w-4" />}>Share</DropdownItem>
        <DropdownDivider />
        <DropdownItem icon={<Archive className="h-4 w-4" />}>Archive</DropdownItem>
        <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

export const AlignRight: Story = {
  render: () => (
    <div className="flex justify-end w-80">
      <Dropdown>
        <DropdownTrigger>Right Aligned</DropdownTrigger>
        <DropdownMenu align="right">
          <DropdownItem>Option 1</DropdownItem>
          <DropdownItem>Option 2</DropdownItem>
          <DropdownItem>Option 3</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  ),
}

export const WithDisabledItem: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>Options</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem>Available Option</DropdownItem>
        <DropdownItem disabled>Disabled Option</DropdownItem>
        <DropdownItem>Another Option</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

export const IconOnlyTrigger: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger showChevron={false} className="px-2">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem icon={<Edit className="h-4 w-4" />}>Edit</DropdownItem>
        <DropdownItem icon={<Copy className="h-4 w-4" />}>Duplicate</DropdownItem>
        <DropdownDivider />
        <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

export const TaskActionsMenu: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger showChevron={false} className="px-2">
        <MoreHorizontal className="h-4 w-4" />
      </DropdownTrigger>
      <DropdownMenu align="right">
        <DropdownItem icon={<Edit className="h-4 w-4" />}>Edit Task</DropdownItem>
        <DropdownItem icon={<Flag className="h-4 w-4" />}>Set Priority</DropdownItem>
        <DropdownItem icon={<Copy className="h-4 w-4" />}>Duplicate</DropdownItem>
        <DropdownItem icon={<Share className="h-4 w-4" />}>Share Task</DropdownItem>
        <DropdownDivider />
        <DropdownItem icon={<Archive className="h-4 w-4" />}>Move to Archive</DropdownItem>
        <DropdownItem icon={<Trash2 className="h-4 w-4" />} danger>
          Delete Task
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}

export const PrioritySelector: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>Set Priority</DropdownTrigger>
      <DropdownMenu>
        <DropdownItem>
          <span className="font-bold text-red-600 mr-2">!!!</span>
          Priority 1
        </DropdownItem>
        <DropdownItem>
          <span className="font-bold text-orange-600 mr-2">!!</span>
          Priority 2
        </DropdownItem>
        <DropdownItem>
          <span className="font-bold text-blue-600 mr-2">!</span>
          Priority 3
        </DropdownItem>
        <DropdownItem>
          <span className="font-bold text-content-tertiary mr-2">-</span>
          Priority 4
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
}
