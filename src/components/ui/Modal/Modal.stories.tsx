import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Modal } from './Modal'
import { Button } from '../Button'
import { Input } from '../Input'

const meta: Meta<typeof Modal> = {
  title: 'Primitives/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Modal>

const ModalWrapper = ({
  title,
  size,
  children,
}: {
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children?: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={title} size={size}>
        {children || <p className="text-gray-600 dark:text-gray-300">Modal content goes here.</p>}
      </Modal>
    </>
  )
}

export const Default: Story = {
  render: () => <ModalWrapper title="Default Modal" />,
}

export const SmallSize: Story = {
  render: () => <ModalWrapper title="Small Modal" size="sm" />,
}

export const LargeSize: Story = {
  render: () => <ModalWrapper title="Large Modal" size="lg" />,
}

export const ExtraLargeSize: Story = {
  render: () => <ModalWrapper title="Extra Large Modal" size="xl" />,
}

export const FullSize: Story = {
  render: () => <ModalWrapper title="Full Width Modal" size="full" />,
}

export const WithForm: Story = {
  render: () => {
    const FormModal = () => {
      const [isOpen, setIsOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Add Task</Button>
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Task">
            <div className="flex flex-col gap-4">
              <Input label="Task Title" placeholder="What needs to be done?" />
              <Input label="Due Date" type="date" />
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary">Add Task</Button>
              </div>
            </div>
          </Modal>
        </>
      )
    }
    return <FormModal />
  },
}

export const ConfirmDialog: Story = {
  render: () => {
    const ConfirmModal = () => {
      const [isOpen, setIsOpen] = useState(false)
      return (
        <>
          <Button variant="danger" onClick={() => setIsOpen(true)}>
            Delete Task
          </Button>
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Task?" size="sm">
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This action cannot be undone. Are you sure you want to delete this task?
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => setIsOpen(false)}>
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )
    }
    return <ConfirmModal />
  },
}

export const NoCloseButton: Story = {
  render: () => {
    const NoCloseModal = () => {
      const [isOpen, setIsOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="No Close Button"
            showCloseButton={false}
          >
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This modal has no X button. Press Escape or click overlay to close.
              </p>
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          </Modal>
        </>
      )
    }
    return <NoCloseModal />
  },
}
