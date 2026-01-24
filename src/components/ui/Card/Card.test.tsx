import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, mock } from 'bun:test'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders as div by default', () => {
    render(<Card>Content</Card>)
    const card = screen.getByText('Content')
    expect(card.tagName).toBe('DIV')
  })

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>)
    expect(screen.getByText('Content')).toHaveClass('custom-class')
  })

  describe('padding variants', () => {
    it('applies no padding when padding is none', () => {
      render(<Card padding="none">Content</Card>)
      const card = screen.getByText('Content')
      expect(card).not.toHaveClass('p-3', 'p-4', 'p-6')
    })

    it('applies small padding', () => {
      render(<Card padding="sm">Content</Card>)
      expect(screen.getByText('Content')).toHaveClass('p-3')
    })

    it('applies medium padding by default', () => {
      render(<Card>Content</Card>)
      expect(screen.getByText('Content')).toHaveClass('p-4')
    })

    it('applies large padding', () => {
      render(<Card padding="lg">Content</Card>)
      expect(screen.getByText('Content')).toHaveClass('p-6')
    })
  })

  describe('shadow variants', () => {
    it('applies no shadow when shadow is none', () => {
      render(<Card shadow="none">Content</Card>)
      const card = screen.getByText('Content')
      expect(card).not.toHaveClass('shadow-sm', 'shadow-md', 'shadow-lg')
    })

    it('applies small shadow by default', () => {
      render(<Card>Content</Card>)
      expect(screen.getByText('Content')).toHaveClass('shadow-sm')
    })

    it('applies medium shadow', () => {
      render(<Card shadow="md">Content</Card>)
      expect(screen.getByText('Content')).toHaveClass('shadow-md')
    })

    it('applies large shadow', () => {
      render(<Card shadow="lg">Content</Card>)
      expect(screen.getByText('Content')).toHaveClass('shadow-lg')
    })
  })

  describe('hoverable state', () => {
    it('does not apply hover styles by default', () => {
      render(<Card>Content</Card>)
      expect(screen.getByText('Content')).not.toHaveClass('cursor-pointer')
    })

    it('applies hover styles when hoverable', () => {
      render(<Card hoverable>Content</Card>)
      const card = screen.getByText('Content')
      expect(card).toHaveClass('transition-shadow', 'cursor-pointer')
    })
  })

  describe('click handler', () => {
    it('renders as button when onClick is provided', () => {
      const handleClick = mock()
      render(<Card onClick={handleClick}>Clickable</Card>)
      const card = screen.getByRole('button')
      expect(card.tagName).toBe('BUTTON')
    })

    it('calls onClick when clicked', () => {
      const handleClick = mock()
      render(<Card onClick={handleClick}>Clickable</Card>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies button-specific styles when clickable', () => {
      const handleClick = mock()
      render(<Card onClick={handleClick}>Clickable</Card>)
      expect(screen.getByRole('button')).toHaveClass('w-full', 'text-left')
    })
  })
})

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>)
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('applies border styles', () => {
    render(<CardHeader>Header</CardHeader>)
    expect(screen.getByText('Header')).toHaveClass('pb-3', 'border-b')
  })

  it('applies custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>)
    expect(screen.getByText('Header')).toHaveClass('custom-header')
  })
})

describe('CardTitle', () => {
  it('renders children correctly', () => {
    render(<CardTitle>Title text</CardTitle>)
    expect(screen.getByText('Title text')).toBeInTheDocument()
  })

  it('renders as h3', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })

  it('applies text styles', () => {
    render(<CardTitle>Title</CardTitle>)
    expect(screen.getByText('Title')).toHaveClass('text-lg', 'font-semibold')
  })

  it('applies custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>)
    expect(screen.getByText('Title')).toHaveClass('custom-title')
  })
})

describe('CardContent', () => {
  it('renders children correctly', () => {
    render(<CardContent>Content text</CardContent>)
    expect(screen.getByText('Content text')).toBeInTheDocument()
  })

  it('applies padding styles', () => {
    render(<CardContent>Content</CardContent>)
    expect(screen.getByText('Content')).toHaveClass('py-3')
  })

  it('applies custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>)
    expect(screen.getByText('Content')).toHaveClass('custom-content')
  })
})

describe('CardFooter', () => {
  it('renders children correctly', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('applies border styles', () => {
    render(<CardFooter>Footer</CardFooter>)
    expect(screen.getByText('Footer')).toHaveClass('pt-3', 'border-t')
  })

  it('applies custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>)
    expect(screen.getByText('Footer')).toHaveClass('custom-footer')
  })
})

describe('Card composition', () => {
  it('renders all sub-components together', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Card</CardTitle>
        </CardHeader>
        <CardContent>Main content here</CardContent>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    )

    expect(screen.getByRole('heading', { name: 'My Card' })).toBeInTheDocument()
    expect(screen.getByText('Main content here')).toBeInTheDocument()
    expect(screen.getByText('Footer actions')).toBeInTheDocument()
  })
})
