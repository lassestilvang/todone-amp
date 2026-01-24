import { describe, it, expect, mock } from 'bun:test'
import { render } from '@testing-library/react'
import { LabelSelector } from '@/components/LabelSelector'

describe('LabelSelector', () => {
  it('renders without crashing', () => {
    const onAdd = mock()
    const onRemove = mock()
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
    const onAdd = mock()
    const onRemove = mock()
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
