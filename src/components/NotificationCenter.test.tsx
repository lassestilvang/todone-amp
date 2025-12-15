import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { NotificationCenter } from '@/components/NotificationCenter'

describe('NotificationCenter', () => {
  it('renders when open', () => {
    const onClose = vi.fn()
    expect(() => {
      render(<NotificationCenter isOpen={true} onClose={onClose} />)
    }).not.toThrow()
  })

  it('renders when closed', () => {
    const onClose = vi.fn()
    expect(() => {
      render(<NotificationCenter isOpen={false} onClose={onClose} />)
    }).not.toThrow()
  })
})
