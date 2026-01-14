import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton, SkeletonText, SkeletonAvatar } from './Skeleton'

describe('Skeleton', () => {
  it('renders with default text variant', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('rounded', 'h-4', 'animate-pulse')
  })

  it('has aria-hidden attribute', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  describe('variants', () => {
    it('applies text variant styles', () => {
      const { container } = render(<Skeleton variant="text" />)
      expect(container.firstChild).toHaveClass('rounded', 'h-4')
    })

    it('applies circular variant styles', () => {
      const { container } = render(<Skeleton variant="circular" />)
      expect(container.firstChild).toHaveClass('rounded-full')
    })

    it('applies rectangular variant styles', () => {
      const { container } = render(<Skeleton variant="rectangular" />)
      expect(container.firstChild).toHaveClass('rounded-md')
    })
  })

  describe('dimensions', () => {
    it('applies custom width as number', () => {
      const { container } = render(<Skeleton width={100} />)
      expect(container.firstChild).toHaveStyle({ width: '100px' })
    })

    it('applies custom width as string', () => {
      const { container } = render(<Skeleton width="50%" />)
      expect(container.firstChild).toHaveStyle({ width: '50%' })
    })

    it('applies custom height as number', () => {
      const { container } = render(<Skeleton height={50} />)
      expect(container.firstChild).toHaveStyle({ height: '50px' })
    })

    it('applies custom height as string', () => {
      const { container } = render(<Skeleton height="2rem" />)
      expect(container.firstChild).toHaveStyle({ height: '2rem' })
    })
  })

  describe('animations', () => {
    it('applies pulse animation by default', () => {
      const { container } = render(<Skeleton />)
      expect(container.firstChild).toHaveClass('animate-pulse')
    })

    it('applies wave animation', () => {
      const { container } = render(<Skeleton animation="wave" />)
      expect(container.firstChild).toHaveClass('skeleton-wave')
    })

    it('applies no animation', () => {
      const { container } = render(<Skeleton animation="none" />)
      expect(container.firstChild).not.toHaveClass('animate-pulse', 'skeleton-wave')
    })
  })

  it('applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has correct displayName', () => {
    expect(Skeleton.displayName).toBe('Skeleton')
  })
})

describe('SkeletonText', () => {
  it('renders 3 lines by default', () => {
    const { container } = render(<SkeletonText />)
    const skeletons = container.querySelectorAll('[aria-hidden="true"]')
    expect(skeletons).toHaveLength(3)
  })

  it('renders specified number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const skeletons = container.querySelectorAll('[aria-hidden="true"]')
    expect(skeletons).toHaveLength(5)
  })

  it('last line has 75% width', () => {
    const { container } = render(<SkeletonText lines={3} />)
    const skeletons = container.querySelectorAll('[aria-hidden="true"]')
    expect(skeletons[2]).toHaveStyle({ width: '75%' })
  })

  it('non-last lines have 100% width', () => {
    const { container } = render(<SkeletonText lines={3} />)
    const skeletons = container.querySelectorAll('[aria-hidden="true"]')
    expect(skeletons[0]).toHaveStyle({ width: '100%' })
    expect(skeletons[1]).toHaveStyle({ width: '100%' })
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonText className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has correct displayName', () => {
    expect(SkeletonText.displayName).toBe('SkeletonText')
  })
})

describe('SkeletonAvatar', () => {
  it('renders with circular variant', () => {
    const { container } = render(<SkeletonAvatar />)
    expect(container.firstChild).toHaveClass('rounded-full')
  })

  describe('sizes', () => {
    it('applies small size', () => {
      const { container } = render(<SkeletonAvatar size="sm" />)
      expect(container.firstChild).toHaveClass('h-8', 'w-8')
    })

    it('applies medium size by default', () => {
      const { container } = render(<SkeletonAvatar />)
      expect(container.firstChild).toHaveClass('h-10', 'w-10')
    })

    it('applies large size', () => {
      const { container } = render(<SkeletonAvatar size="lg" />)
      expect(container.firstChild).toHaveClass('h-12', 'w-12')
    })
  })

  it('applies custom className', () => {
    const { container } = render(<SkeletonAvatar className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('has correct displayName', () => {
    expect(SkeletonAvatar.displayName).toBe('SkeletonAvatar')
  })
})
