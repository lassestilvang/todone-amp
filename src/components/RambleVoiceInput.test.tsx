import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RambleVoiceInput } from './RambleVoiceInput'

describe('RambleVoiceInput', () => {
  it('should render with proper structure', () => {
    const { container } = render(<RambleVoiceInput />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex')
    expect(wrapper).toHaveClass('flex-col')
    expect(wrapper).toHaveClass('gap-6')
  })

  it('should show tips for best results', () => {
    render(<RambleVoiceInput />)
    expect(screen.getByText(/Tips for Best Results/i)).toBeInTheDocument()
  })

  it('should have microphone icon', () => {
    const { container } = render(<RambleVoiceInput />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('should render with proper structure', () => {
    const { container } = render(<RambleVoiceInput />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex')
    expect(wrapper).toHaveClass('flex-col')
    expect(wrapper).toHaveClass('gap-6')
  })

  it('should have tips in list format', () => {
    render(<RambleVoiceInput />)
    const lists = screen.getAllByRole('list')
    expect(lists.length).toBeGreaterThan(0)
  })

  it('should display recording section', () => {
    render(<RambleVoiceInput />)
    const section = screen.getByText(/Click to start talking/).closest('div')
    expect(section).toBeInTheDocument()
  })
})
