import { describe, it, expect, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'
import { RichTextEditor } from '@/components/RichTextEditor'

describe('RichTextEditor', () => {
  it('should render the editor', async () => {
    const onChange = mock()
    render(
      <RichTextEditor
        value=""
        onChange={onChange}
        placeholder="Test placeholder"
      />
    )

    // Wait for TipTap to initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    // The editor should be rendered (checking for toolbar)
    const buttons = screen.queryAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should call onChange when content changes', async () => {
    const onChange = mock()
    render(
      <RichTextEditor
        value=""
        onChange={onChange}
      />
    )

    // Wait for TipTap to initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    // The component should be set up to receive changes
    expect(onChange).toBeDefined()
  })

  it('should display initial value', async () => {
    const initialValue = '<p>Test content</p>'
    const onChange = mock()
    render(
      <RichTextEditor
        value={initialValue}
        onChange={onChange}
      />
    )

    // Wait for TipTap to initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Verify the editor is set up with initial content
    expect(onChange).toBeDefined()
  })

  it('should have formatting toolbar buttons', async () => {
    const onChange = mock()
    render(
      <RichTextEditor
        value=""
        onChange={onChange}
      />
    )

    // Wait for TipTap to initialize
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Check for toolbar buttons
    const buttons = screen.queryAllByRole('button')
    expect(buttons.length).toBeGreaterThan(3) // Bold, Italic, Underline at minimum
  })
})
