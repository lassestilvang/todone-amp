import { render, screen } from '@testing-library/react'
import { describe, it, expect, mock } from 'bun:test'
import { SkipNav } from './SkipNav'

describe('SkipNav Component', () => {
  it('should render skip links', () => {
    render(<SkipNav />)

    expect(screen.getByText('Skip to main content')).toBeInTheDocument()
    expect(screen.getByText('Skip to sidebar navigation')).toBeInTheDocument()
    expect(screen.getByText('Skip to search')).toBeInTheDocument()
  })

  it('should have sr-only class for hidden links', () => {
    const { container } = render(<SkipNav />)
    const links = container.querySelectorAll('a')

    links.forEach((link) => {
      expect(link).toHaveClass('sr-only')
    })
  })

  it('should focus and scroll to main content when clicked', () => {
    const { container } = render(
      <>
        <SkipNav />
        <main id="main-content" tabIndex={-1}>
          Main content
        </main>
      </>
    )

    const mainElement = container.querySelector('#main-content') as HTMLElement
    const skipLink = screen.getByText('Skip to main content') as HTMLAnchorElement

    // Mock scrollIntoView
    mainElement.scrollIntoView = mock()

    skipLink.click()

    expect(mainElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('should focus and scroll to sidebar when clicked', () => {
    const { container } = render(
      <>
        <SkipNav />
        <div id="sidebar" tabIndex={-1}>
          Sidebar
        </div>
      </>
    )

    const sidebarElement = container.querySelector('#sidebar') as HTMLElement
    const skipLink = screen.getByText('Skip to sidebar navigation') as HTMLAnchorElement

    sidebarElement.scrollIntoView = mock()

    skipLink.click()

    expect(sidebarElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('should focus and scroll to search when clicked', () => {
    const { container } = render(
      <>
        <SkipNav />
        <input id="search-bar" type="text" />
      </>
    )

    const searchElement = container.querySelector('#search-bar') as HTMLElement
    const skipLink = screen.getByText('Skip to search') as HTMLAnchorElement

    searchElement.scrollIntoView = mock()

    skipLink.click()

    expect(searchElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })
  })

  it('should handle missing target elements gracefully', () => {
    render(<SkipNav />)

    const skipLink = screen.getByText('Skip to main content') as HTMLAnchorElement

    // Should not throw error when target doesn't exist
    expect(() => skipLink.click()).not.toThrow()
  })

  it('should have proper semantic HTML', () => {
    const { container } = render(<SkipNav />)
    const links = container.querySelectorAll('a[href]')

    expect(links.length).toBeGreaterThan(0)
    links.forEach((link) => {
      expect(link.textContent).toBeTruthy()
    })
  })

  it('should have correct href attributes', () => {
    const { container } = render(<SkipNav />)
    const mainLink = container.querySelector('a[href="#main-content"]')
    const sidebarLink = container.querySelector('a[href="#sidebar"]')
    const searchLink = container.querySelector('a[href="#search-bar"]')

    expect(mainLink).toBeInTheDocument()
    expect(sidebarLink).toBeInTheDocument()
    expect(searchLink).toBeInTheDocument()
  })
})
