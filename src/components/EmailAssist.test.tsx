import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmailAssist } from './EmailAssist'

describe('EmailAssist', () => {
  it('should render email assist component', () => {
    render(<EmailAssist />)
    expect(screen.getByText(/Email Assist/i)).toBeInTheDocument()
  })

  it('should show Pro badge', () => {
    render(<EmailAssist />)
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  it('should display description', () => {
    render(<EmailAssist />)
    expect(
      screen.getByText(
        /Forward emails or paste email content. AI will extract tasks, due dates, links/i
      )
    ).toBeInTheDocument()
  })

  it('should have textarea for email input', () => {
    render(<EmailAssist />)
    const textarea = screen.getByPlaceholderText(/Paste email content here/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should have textarea for email input', () => {
    render(<EmailAssist />)
    const textarea = screen.getByPlaceholderText(/Paste email content here/i)
    expect(textarea).toBeInTheDocument()
  })

  it('should show setup instructions', () => {
    render(<EmailAssist />)
    expect(screen.getByText(/How to Use/i)).toBeInTheDocument()
    expect(screen.getByText(/add@todone.app/i)).toBeInTheDocument()
  })

  it('should have ordered list of instructions', () => {
    render(<EmailAssist />)
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(list.children.length).toBeGreaterThan(0)
  })

  it('should render with proper styling', () => {
    const { container } = render(<EmailAssist />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex')
    expect(wrapper).toHaveClass('flex-col')
    expect(wrapper).toHaveClass('gap-6')
  })
})
