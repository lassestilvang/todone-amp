import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
} from './Dropdown'

const TestDropdown = ({
  onItemClick,
  disabled = false,
  danger = false,
}: {
  onItemClick?: () => void
  disabled?: boolean
  danger?: boolean
}) => (
  <Dropdown>
    <DropdownTrigger>Menu</DropdownTrigger>
    <DropdownMenu>
      <DropdownItem onClick={onItemClick} disabled={disabled} danger={danger}>
        Item 1
      </DropdownItem>
      <DropdownItem>Item 2</DropdownItem>
    </DropdownMenu>
  </Dropdown>
)

describe('Dropdown', () => {
  it('opens on click', () => {
    render(<TestDropdown />)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Menu'))

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  it('closes on escape', () => {
    render(<TestDropdown />)

    fireEvent.click(screen.getByText('Menu'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes on outside click', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <TestDropdown />
      </div>
    )

    fireEvent.click(screen.getByText('Menu'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('calls item click handler', () => {
    const handleClick = vi.fn()
    render(<TestDropdown onItemClick={handleClick} />)

    fireEvent.click(screen.getByText('Menu'))
    fireEvent.click(screen.getByText('Item 1'))

    expect(handleClick).toHaveBeenCalledOnce()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('does not call handler for disabled items', () => {
    const handleClick = vi.fn()
    render(<TestDropdown onItemClick={handleClick} disabled />)

    fireEvent.click(screen.getByText('Menu'))
    fireEvent.click(screen.getByText('Item 1'))

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies danger variant styles', () => {
    render(<TestDropdown danger />)

    fireEvent.click(screen.getByText('Menu'))
    const item = screen.getByText('Item 1')

    expect(item).toHaveClass('text-semantic-error')
  })

  it('renders divider', () => {
    render(
      <Dropdown>
        <DropdownTrigger>Menu</DropdownTrigger>
        <DropdownMenu>
          <DropdownItem>Item 1</DropdownItem>
          <DropdownDivider />
          <DropdownItem>Item 2</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )

    fireEvent.click(screen.getByText('Menu'))
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('has correct displayNames', () => {
    expect(Dropdown.displayName).toBe('Dropdown')
    expect(DropdownTrigger.displayName).toBe('DropdownTrigger')
    expect(DropdownMenu.displayName).toBe('DropdownMenu')
    expect(DropdownItem.displayName).toBe('DropdownItem')
    expect(DropdownDivider.displayName).toBe('DropdownDivider')
  })
})
