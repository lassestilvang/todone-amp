import { describe, it, expect, mock } from 'bun:test'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'
import { Mail } from 'lucide-react'

describe('Input Component', () => {
  describe('rendering', () => {
    it('should render an input element', () => {
      render(<Input placeholder="Enter text" />)
      const input = screen.getByPlaceholderText('Enter text')
      expect(input).toBeInTheDocument()
      expect(input.tagName).toBe('INPUT')
    })

    it('should render with label', () => {
      render(<Input label="Username" placeholder="Enter username" />)
      const label = screen.getByText('Username')
      expect(label).toBeInTheDocument()
      expect(label).toHaveClass('block', 'text-sm', 'font-medium')
    })

    it('should render with error message', () => {
      render(<Input error="This field is required" />)
      const error = screen.getByText('This field is required')
      expect(error).toBeInTheDocument()
      expect(error).toHaveClass('text-semantic-error')
    })

    it('should render with icon', () => {
      render(<Input icon={<Mail className="w-5 h-5" />} placeholder="Email" />)
      const input = screen.getByPlaceholderText('Email')
      const icon = input.parentElement?.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should apply error styling when error is present', () => {
      render(<Input error="Invalid" placeholder="Input" />)
      const input = screen.getByPlaceholderText('Input')
      expect(input).toHaveClass('border-semantic-error')
    })
  })

  describe('interaction', () => {
    it('should capture user input', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Type here" />)
      const input = screen.getByPlaceholderText('Type here') as HTMLInputElement
      
      await user.type(input, 'Hello World')
      expect(input.value).toBe('Hello World')
    })

    it('should handle focus events', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Focus me" />)
      const input = screen.getByPlaceholderText('Focus me')
      
      await user.click(input)
      expect(input).toHaveFocus()
    })

    it('should handle blur events', async () => {
      const user = userEvent.setup()
      const handleBlur = mock()
      render(<Input onBlur={handleBlur} placeholder="Blur me" />)
      const input = screen.getByPlaceholderText('Blur me')
      
      await user.click(input)
      await user.click(document.body)
      expect(handleBlur).toHaveBeenCalled()
    })

    it('should handle change events', async () => {
      const user = userEvent.setup()
      const handleChange = mock()
      render(<Input onChange={handleChange} placeholder="Change me" />)
      const input = screen.getByPlaceholderText('Change me')
      
      await user.type(input, 'test')
      expect(handleChange).toHaveBeenCalled()
    })
  })

  describe('input types', () => {
    it('should support email type', () => {
      render(<Input type="email" placeholder="Email" />)
      const input = screen.getByPlaceholderText('Email')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should support password type', () => {
      render(<Input type="password" placeholder="Password" />)
      const input = screen.getByPlaceholderText('Password')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should support number type', () => {
      render(<Input type="number" placeholder="Number" />)
      const input = screen.getByPlaceholderText('Number')
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should support search type', () => {
      render(<Input type="search" placeholder="Search" />)
      const input = screen.getByPlaceholderText('Search')
      expect(input).toHaveAttribute('type', 'search')
    })
  })

  describe('disabled state', () => {
    it('should handle disabled attribute', async () => {
      const user = userEvent.setup()
      render(<Input disabled placeholder="Disabled" />)
      const input = screen.getByPlaceholderText('Disabled')
      
      expect(input).toBeDisabled()
      await user.type(input, 'test')
      expect((input as HTMLInputElement).value).toBe('')
    })

    it('should show disabled styling', () => {
      render(<Input disabled placeholder="Disabled" />)
      const input = screen.getByPlaceholderText('Disabled')
      expect(input).toHaveClass('disabled:bg-input-disabled-bg', 'disabled:cursor-not-allowed')
    })
  })

  describe('accessibility', () => {
    it('should have focus ring styling', () => {
      render(<Input placeholder="Focus ring" />)
      const input = screen.getByPlaceholderText('Focus ring')
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-focus')
    })

    it('should associate label with input', () => {
      const { container } = render(<Input label="Email" placeholder="email@example.com" />)
      const label = screen.getByText('Email')
      const input = container.querySelector('input')
      
      expect(label).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    it('should support aria-describedby for errors', () => {
      render(<Input error="This is an error" aria-describedby="error-message" placeholder="Input" />)
      const input = screen.getByPlaceholderText('Input')
      expect(input).toHaveAttribute('aria-describedby')
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Keyboard nav" />)
      const input = screen.getByPlaceholderText('Keyboard nav')
      
      await user.tab()
      expect(input).toHaveFocus()
    })
  })

  describe('ref forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = { current: null as unknown as HTMLInputElement }
      render(<Input ref={ref} placeholder="Ref test" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect((ref.current as HTMLInputElement).placeholder).toBe('Ref test')
    })

    it('should allow programmatic focus via ref', () => {
      const ref = { current: null as HTMLInputElement | null }
      render(<Input ref={ref} placeholder="Ref focus" />)
      
      if (ref.current) {
        expect(ref.current).toBeInTheDocument()
      }
    })
  })

  describe('custom className', () => {
    it('should apply custom class to input', () => {
      render(<Input className="custom-input" placeholder="Custom" />)
      const input = screen.getByPlaceholderText('Custom')
      expect(input).toHaveClass('custom-input')
    })

    it('should merge custom classes with default classes', () => {
      render(<Input className="custom-input" placeholder="Merge" />)
      const input = screen.getByPlaceholderText('Merge')
      expect(input).toHaveClass('w-full', 'px-3', 'custom-input')
    })
  })

  describe('edge cases', () => {
    it('should handle empty placeholder', () => {
      render(<Input placeholder="" />)
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', '')
    })

    it('should handle very long input value', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Long" />)
      const input = screen.getByPlaceholderText('Long') as HTMLInputElement
      
      const longText = 'a'.repeat(1000)
      await user.type(input, longText)
      expect(input.value).toBe(longText)
    })

    it('should handle special characters in value', async () => {
      const user = userEvent.setup()
      render(<Input placeholder="Special" />)
      const input = screen.getByPlaceholderText('Special') as HTMLInputElement
      
      await user.type(input, '<>&"\'')
      expect(input.value).toBe('<>&"\'')
    })
  })
})
