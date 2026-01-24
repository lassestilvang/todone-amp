import { describe, it, expect, mock, beforeEach } from 'bun:test'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: mock(),
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
  })

  it('renders when open', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes on escape key', () => {
    const onClose = mock()
    render(<Modal {...defaultProps} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on escape key when closeOnEscape is false', () => {
    const onClose = mock()
    render(<Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on overlay click', () => {
    const onClose = mock()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const overlay = screen.getByRole('dialog').parentElement?.querySelector('[aria-hidden="true"]')
    expect(overlay).toBeInTheDocument()
    fireEvent.click(overlay!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on overlay click when closeOnOverlayClick is false', () => {
    const onClose = mock()
    render(<Modal {...defaultProps} onClose={onClose} closeOnOverlayClick={false} />)

    const overlay = screen.getByRole('dialog').parentElement?.querySelector('[aria-hidden="true"]')
    fireEvent.click(overlay!)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders title when provided', () => {
    render(<Modal {...defaultProps} title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('shows close button by default', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument()
  })

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />)
    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = mock()
    render(<Modal {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-class" />)
    expect(screen.getByRole('dialog')).toHaveClass('custom-class')
  })

  it('applies correct size class', () => {
    render(<Modal {...defaultProps} size="lg" />)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-lg')
  })
})
