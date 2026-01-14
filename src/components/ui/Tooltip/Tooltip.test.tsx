import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('shows tooltip on hover after delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
  })

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.mouseLeave(trigger)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('does not show tooltip if mouse leaves before delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    fireEvent.mouseLeave(trigger)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  describe('positions', () => {
    it.each(['top', 'bottom', 'left', 'right'] as const)(
      'renders with position %s',
      (position) => {
        render(
          <Tooltip content="Tooltip text" position={position} delay={0}>
            <button>Hover me</button>
          </Tooltip>
        )

        const trigger = screen.getByText('Hover me')
        fireEvent.mouseEnter(trigger)

        act(() => {
          vi.advanceTimersByTime(0)
        })

        expect(screen.getByRole('tooltip')).toBeInTheDocument()
      }
    )
  })

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Focus me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Focus me')
    fireEvent.focus(trigger)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Focus me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Focus me')
    fireEvent.focus(trigger)

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.blur(trigger)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Tooltip content="Tooltip text" delay={0} className="custom-class">
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = screen.getByText('Hover me')
    fireEvent.mouseEnter(trigger)

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(screen.getByRole('tooltip')).toHaveClass('custom-class')
  })
})
