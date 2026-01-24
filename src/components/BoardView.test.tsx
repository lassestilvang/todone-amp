import { describe, it, expect } from 'bun:test'
import { render } from '@testing-library/react'
import { BoardView } from '@/components/BoardView'

describe('BoardView', () => {
  it('renders without crashing', () => {
    expect(() => {
      render(<BoardView />)
    }).not.toThrow()
  })

  it('has proper structure', () => {
    const { container } = render(<BoardView />)
    expect(container.firstChild).toBeTruthy()
  })
})
