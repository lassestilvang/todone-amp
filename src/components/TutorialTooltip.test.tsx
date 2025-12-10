import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TutorialTooltip, type TutorialStep } from '@/components/TutorialTooltip'

const mockSteps: TutorialStep[] = [
  {
    id: 'step1',
    title: 'Welcome',
    description: 'This is the first step',
  },
  {
    id: 'step2',
    title: 'Second Step',
    description: 'This is the second step',
  },
  {
    id: 'step3',
    title: 'Final Step',
    description: 'This is the final step',
    action: 'Complete',
    onAction: vi.fn(),
  },
]

describe('TutorialTooltip', () => {
  it('renders tooltip with current step title', () => {
    render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={0}
      />,
    )

    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('This is the first step')).toBeInTheDocument()
  })

  it('displays step counter', () => {
    render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={0}
      />,
    )

    expect(screen.getByText('1 of 3')).toBeInTheDocument()
  })

  it('navigates to next step', () => {
    render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={0}
      />,
    )

    const nextButton = screen.getByText('Next')
    fireEvent.click(nextButton)

    expect(screen.getByText('Second Step')).toBeInTheDocument()
  })

  it('navigates to previous step', () => {
    render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={1}
      />,
    )

    const backButton = screen.getByText('Back')
    fireEvent.click(backButton)

    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  it('disables back button on first step', () => {
    render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={0}
      />,
    )

    const backButton = screen.getByText('Back')
    expect(backButton).toBeDisabled()
  })

  it('shows finish button on last step', () => {
    render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={2}
      />,
    )

    expect(screen.getByText('Finish')).toBeInTheDocument()
  })

  it('calls onComplete when finishing', () => {
    const onComplete = vi.fn()

    render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={2}
        onComplete={onComplete}
      />,
    )

    const finishButton = screen.getByText('Finish')
    fireEvent.click(finishButton)

    expect(onComplete).toHaveBeenCalled()
  })

  it('calls onSkip when closing', () => {
    const onSkip = vi.fn()

    const { container } = render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={0}
        onSkip={onSkip}
      />,
    )

    const closeButton = container.querySelector('button[class*="absolute"]')
    if (closeButton) {
      fireEvent.click(closeButton)
    }

    expect(onSkip).toHaveBeenCalled()
  })

  it('renders action button when provided', () => {
    render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={2}
      />,
    )

    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('calls action callback when clicked', () => {
    const actionCallback = vi.fn()
    const stepsWithAction: TutorialStep[] = [
      {
        id: 'step1',
        title: 'Action Step',
        description: 'Click the action',
        action: 'Do Something',
        onAction: actionCallback,
      },
    ]

    render(
      <TutorialTooltip
        steps={stepsWithAction}
        currentStep={0}
      />,
    )

    const actionButton = screen.getByText('Do Something')
    fireEvent.click(actionButton)

    expect(actionCallback).toHaveBeenCalled()
  })

  it('shows progress bar', () => {
    const { container } = render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={0}
      />,
    )

    const progressBars = container.querySelectorAll('div[class*="h-1"]')
    expect(progressBars.length).toBeGreaterThan(0)
  })

  it('renders overlay', () => {
    const { container } = render(
      <TutorialTooltip
        steps={mockSteps}
        currentStep={0}
      />,
    )

    const overlay = container.querySelector('div[class*="fixed"][class*="inset-0"]')
    expect(overlay).toBeInTheDocument()
  })
})
