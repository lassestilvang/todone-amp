import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PrintTasksButton } from './PrintTasksButton'
import { Task } from '@/types'
import * as printUtils from '@/utils/printUtils'

vi.mock('@/utils/printUtils', () => ({
  printTasks: vi.fn(),
  exportTasksAsHTML: vi.fn(),
}))

describe('PrintTasksButton', () => {
  let mockTasks: Task[]

  beforeEach(() => {
    mockTasks = [
      {
        id: '1',
        content: 'Test Task 1',
        completed: false,
        priority: 'p1',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        order: 1,
        labels: [],
        reminders: [],
        attachments: [],
      } as Task,
    ]
  })

  describe('default variant', () => {
    it('should render print and export buttons', () => {
      render(<PrintTasksButton tasks={mockTasks} />)
      expect(screen.getByText('Print')).toBeInTheDocument()
      expect(screen.getByText('Export')).toBeInTheDocument()
    })

    it('should call printTasks when print button clicked', () => {
      render(<PrintTasksButton tasks={mockTasks} title="My Tasks" />)
      const printButton = screen.getByText('Print')
      fireEvent.click(printButton)

      expect(printUtils.printTasks).toHaveBeenCalledWith(
        mockTasks,
        expect.objectContaining({
          title: 'My Tasks',
          includeCompleted: true,
          includeDescriptions: true,
        })
      )
    })

    it('should call exportTasksAsHTML when export button clicked', () => {
      render(<PrintTasksButton tasks={mockTasks} title="My Tasks" />)
      const exportButton = screen.getByText('Export')
      fireEvent.click(exportButton)

      expect(printUtils.exportTasksAsHTML).toHaveBeenCalledWith(
        mockTasks,
        expect.stringContaining('my-tasks'),
        expect.objectContaining({
          title: 'My Tasks',
        })
      )
    })

    it('should use default title if not provided', () => {
      render(<PrintTasksButton tasks={mockTasks} />)
      const printButton = screen.getByText('Print')
      fireEvent.click(printButton)

      expect(printUtils.printTasks).toHaveBeenCalledWith(
        mockTasks,
        expect.objectContaining({
          title: 'Task List',
        })
      )
    })
  })

  describe('icon variant', () => {
    it('should render as icon button', () => {
      const { container } = render(<PrintTasksButton tasks={mockTasks} variant="icon" />)
      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should toggle options menu when clicked', () => {
      render(<PrintTasksButton tasks={mockTasks} variant="icon" />)
      const iconButton = screen.getByRole('button')
      
      expect(screen.queryByText('Print')).not.toBeInTheDocument()

      fireEvent.click(iconButton)
      expect(screen.getByText('Print')).toBeInTheDocument()

      fireEvent.click(iconButton)
      expect(screen.queryByText('Print')).not.toBeInTheDocument()
    })

    it('should call printTasks from dropdown menu', () => {
      render(<PrintTasksButton tasks={mockTasks} variant="icon" />)
      const iconButton = screen.getByRole('button')
      fireEvent.click(iconButton)

      const printOption = screen.getByText('Print')
      fireEvent.click(printOption)

      expect(printUtils.printTasks).toHaveBeenCalled()
    })

    it('should call exportTasksAsHTML from dropdown menu', () => {
      render(<PrintTasksButton tasks={mockTasks} variant="icon" />)
      const iconButton = screen.getByRole('button')
      fireEvent.click(iconButton)

      const exportOption = screen.getByText('Export as HTML')
      fireEvent.click(exportOption)

      expect(printUtils.exportTasksAsHTML).toHaveBeenCalled()
    })

    it('should close menu after print', () => {
      render(<PrintTasksButton tasks={mockTasks} variant="icon" />)
      const iconButton = screen.getByRole('button')
      
      fireEvent.click(iconButton)
      expect(screen.getByText('Print')).toBeInTheDocument()

      const printOption = screen.getByText('Print')
      fireEvent.click(printOption)

      expect(screen.queryByText('Print')).not.toBeInTheDocument()
    })

    it('should close menu after export', () => {
      render(<PrintTasksButton tasks={mockTasks} variant="icon" />)
      const iconButton = screen.getByRole('button')
      
      fireEvent.click(iconButton)
      const exportOption = screen.getByText('Export as HTML')
      fireEvent.click(exportOption)

      expect(screen.queryByText('Export as HTML')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper aria labels for icon button', () => {
      render(<PrintTasksButton tasks={mockTasks} variant="icon" />)
      expect(screen.getByLabelText('Print options')).toBeInTheDocument()
    })

    it('should have proper titles for buttons', () => {
      const { container } = render(<PrintTasksButton tasks={mockTasks} variant="icon" />)
      const button = container.querySelector('button[title]')
      expect(button).toHaveAttribute('title', 'Print tasks')
    })
  })
})
