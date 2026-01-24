import { describe, it, expect } from 'bun:test'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('shows tooltip on hover after delay', async () => {
    render(
      <Tooltip content="Tooltip text" delay={50}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
  })

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip text" delay={50}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    fireEvent.mouseLeave(trigger)

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('does not show tooltip if mouse leaves before delay', async () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    // Leave immediately before delay triggers
    fireEvent.mouseLeave(trigger)

    // Wait a bit and confirm tooltip never appeared
    await new Promise((r) => setTimeout(r, 150))

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  describe('positions', () => {
    it('renders with position top', async () => {
      render(
        <Tooltip content="Tooltip text" position="top" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      )
      fireEvent.mouseEnter(screen.getByText('Hover me'))
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
      })
    })

    it('renders with position bottom', async () => {
      render(
        <Tooltip content="Tooltip text" position="bottom" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      )
      fireEvent.mouseEnter(screen.getByText('Hover me'))
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
      })
    })

    it('renders with position left', async () => {
      render(
        <Tooltip content="Tooltip text" position="left" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      )
      fireEvent.mouseEnter(screen.getByText('Hover me'))
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
      })
    })

    it('renders with position right', async () => {
      render(
        <Tooltip content="Tooltip text" position="right" delay={0}>
          <button>Hover me</button>
        </Tooltip>
      )
      fireEvent.mouseEnter(screen.getByText('Hover me'))
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument()
      })
    })
  })

  it('shows tooltip on focus', async () => {
    render(
      <Tooltip content="Tooltip text" delay={50}>
        <button>Focus me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Focus me')
    fireEvent.focus(trigger)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })
  })

  it('hides tooltip on blur', async () => {
    render(
      <Tooltip content="Tooltip text" delay={50}>
        <button>Focus me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Focus me')
    fireEvent.focus(trigger)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument()
    })

    fireEvent.blur(trigger)

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })
  })

  it('applies custom className', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0} className="custom-class">
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveClass('custom-class')
    })
  })
})
