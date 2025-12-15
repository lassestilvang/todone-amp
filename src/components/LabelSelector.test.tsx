import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { LabelSelector } from '@/components/LabelSelector'

describe('LabelSelector', () => {
  it('renders without crashing', () => {
    const onAdd = vi.fn()
    const onRemove = vi.fn()
    expect(() => {
      render(
        <LabelSelector
          selectedLabelIds={[]}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      )
    }).not.toThrow()
  })

  it('accepts props correctly', () => {
    const onAdd = vi.fn()
    const onRemove = vi.fn()
    const { container } = render(
      <LabelSelector
        selectedLabelIds={['1', '2']}
        onAdd={onAdd}
        onRemove={onRemove}
      />
    )
    expect(container.firstChild).toBeTruthy()
  })
})
