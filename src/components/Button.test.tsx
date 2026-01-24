import { describe, it, expect, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'
import { Heart } from 'lucide-react'

describe('Button Component', () => {
  describe('rendering', () => {
    it('should render with text content', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should render with all variant styles', () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>)
      let button = screen.getByText('Primary')
      expect(button).toHaveClass('bg-interactive-primary')

      rerender(<Button variant="secondary">Secondary</Button>)
      button = screen.getByText('Secondary')
      expect(button).toHaveClass('bg-interactive-secondary')

      rerender(<Button variant="ghost">Ghost</Button>)
      button = screen.getByText('Ghost')
      expect(button).toHaveClass('text-content-secondary')

      rerender(<Button variant="danger">Danger</Button>)
      button = screen.getByText('Danger')
      expect(button).toHaveClass('bg-semantic-error')
    })

    it('should render with all size variants', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      let button = screen.getByText('Small')
      expect(button).toHaveClass('px-2', 'py-1', 'text-sm')

      rerender(<Button size="md">Medium</Button>)
      button = screen.getByText('Medium')
      expect(button).toHaveClass('px-4', 'py-2', 'text-base')

      rerender(<Button size="lg">Large</Button>)
      button = screen.getByText('Large')
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
    })

    it('should render with icon', () => {
      render(<Button icon={Heart}>Like</Button>)
      const button = screen.getByText('Like')
      const icon = button.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByText('Custom')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('interaction', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup()
      const handleClick = mock()
      render(<Button onClick={handleClick}>Click</Button>)

      await user.click(screen.getByText('Click'))
      expect(handleClick).toHaveBeenCalled()
    })

    it('should not handle click when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = mock()
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      )

      await user.click(screen.getByText('Disabled'))
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not handle click when loading', async () => {
      const user = userEvent.setup()
      const handleClick = mock()
      render(
        <Button onClick={handleClick} isLoading>
          Loading
        </Button>
      )

      await user.click(screen.getByText('Loading'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('should show spinner when loading', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByText('Loading')
      const spinner = button.querySelector('svg')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin')
    })

    it('should have disabled appearance when loading', () => {
      render(<Button isLoading>Loading</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('should have focus visible ring', () => {
      render(<Button>Focusable</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-focus')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      const handleClick = mock()
      render(<Button onClick={handleClick}>Keyboard</Button>)

      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalled()
    })

    it('should have proper ARIA attributes when disabled', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should work with form submission', async () => {
      const user = userEvent.setup()
      const handleSubmit = mock((e: React.FormEvent) => e.preventDefault())
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </form>
      )

      await user.click(screen.getByText('Submit'))
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  describe('ref forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = { current: null }
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('edge cases', () => {
    it('should handle empty children', () => {
      render(<Button>{''}</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with multiple children', () => {
      render(
        <Button>
          <span>Part 1</span>
          <span>Part 2</span>
        </Button>
      )
      expect(screen.getByText('Part 1')).toBeInTheDocument()
      expect(screen.getByText('Part 2')).toBeInTheDocument()
    })
  })
})
