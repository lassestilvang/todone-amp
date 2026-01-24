import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import { NotificationCenter } from '@/components/NotificationCenter'

describe('NotificationCenter', () => {
  it('renders when open', () => {
    const onClose = mock()
    expect(() => {
      render(<NotificationCenter isOpen={true} onClose={onClose} />)
    }).not.toThrow()
  })

  it('renders when closed', () => {
    const onClose = mock()
    expect(() => {
      render(<NotificationCenter isOpen={false} onClose={onClose} />)
    }).not.toThrow()
  })
})
