import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColumnCustomizer } from '@/components/ColumnCustomizer'

describe('ColumnCustomizer', () => {
  it('should render customize button', () => {
    render(<ColumnCustomizer />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('should open modal when button is clicked', () => {
    render(<ColumnCustomizer />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Modal should be visible
    const heading = screen.getByText('Customize Columns')
    expect(heading).toBeInTheDocument()
  })

  it('should display all columns in modal', () => {
    render(<ColumnCustomizer />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Default columns should be listed
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('Due Date')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
  })

  it('should have toggle buttons for visibility', () => {
    render(<ColumnCustomizer />)

    const customizeButton = screen.getAllByRole('button')[0]
    fireEvent.click(customizeButton)

    // Should have visibility toggle buttons
    const toggleButtons = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('title') === 'Hide' || btn.getAttribute('title') === 'Show'
    )
    expect(toggleButtons.length).toBeGreaterThan(0)
  })

  it('should have reset button', () => {
    render(<ColumnCustomizer />)

    const customizeButton = screen.getAllByRole('button')[0]
    fireEvent.click(customizeButton)

    const resetButton = screen.getByText('Reset')
    expect(resetButton).toBeInTheDocument()
  })

  it('should show visible column count', () => {
    render(<ColumnCustomizer />)

    const customizeButton = screen.getAllByRole('button')[0]
    fireEvent.click(customizeButton)

    // Should show "X of Y columns visible"
    const countText = screen.getByText(/of \d+ columns visible/)
    expect(countText).toBeInTheDocument()
  })
})
