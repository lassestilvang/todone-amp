import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetElement?: string // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: string // Optional CTA text
  onAction?: () => void
}

interface TutorialTooltipProps {
  steps: TutorialStep[]
  onComplete?: () => void
  onSkip?: () => void
  currentStep?: number
  className?: string
}

interface TooltipPosition {
  top: number
  left: number
  arrowPosition: 'top' | 'bottom' | 'left' | 'right'
}

export function TutorialTooltip({
  steps,
  onComplete,
  onSkip,
  currentStep = 0,
  className,
}: TutorialTooltipProps) {
  const [step, setStep] = useState(currentStep)
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    arrowPosition: 'bottom',
  })
  const [highlightBox, setHighlightBox] = useState<DOMRect | null>(null)

  const currentStepData = steps[step]

  // Calculate tooltip position based on target element
  useEffect(() => {
    if (!currentStepData.targetElement) {
      setPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150,
        arrowPosition: 'bottom',
      })
      setHighlightBox(null)
      return
    }

    const targetElement = document.querySelector(currentStepData.targetElement)
    if (!targetElement) return

    const rect = targetElement.getBoundingClientRect()
    setHighlightBox(rect)

    const preferredPosition = currentStepData.position || 'bottom'
    const padding = 16
    const tooltipWidth = 320
    const tooltipHeight = 200

    let top = 0
    let left = 0
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = preferredPosition

    // Calculate position based on preferred location
    switch (preferredPosition) {
      case 'top':
        top = rect.top - tooltipHeight - padding
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowPosition = 'bottom'
        break

      case 'bottom':
        top = rect.bottom + padding
        left = rect.left + rect.width / 2 - tooltipWidth / 2
        arrowPosition = 'top'
        break

      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.left - tooltipWidth - padding
        arrowPosition = 'right'
        break

      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2
        left = rect.right + padding
        arrowPosition = 'left'
        break
    }

    // Adjust if tooltip goes off screen
    if (left < padding) left = padding
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding
    }
    if (top < padding) top = padding
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding
    }

    setPosition({ top, left, arrowPosition })
  }, [step, currentStepData.targetElement, currentStepData.position])

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      onComplete?.()
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    onSkip?.()
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30 transition-opacity duration-300" />

      {/* Highlight Box */}
      {highlightBox && (
        <div
          className="fixed z-40 rounded-lg border-2 border-brand-500 shadow-lg transition-all duration-300"
          style={{
            top: highlightBox.top - 4,
            left: highlightBox.left - 4,
            width: highlightBox.width + 8,
            height: highlightBox.height + 8,
            boxShadow: '0 0 0 2000px rgba(0, 0, 0, 0.3)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={`fixed z-50 w-80 rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-900 ${className}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute h-2 w-2 bg-white dark:bg-gray-900 ${
            position.arrowPosition === 'top' ? 'top-0 -translate-y-1' : ''
          } ${position.arrowPosition === 'bottom' ? 'bottom-0 translate-y-1' : ''} ${
            position.arrowPosition === 'left' ? 'left-0 -translate-x-1' : ''
          } ${position.arrowPosition === 'right' ? 'right-0 translate-x-1' : ''}`}
          style={{
            clipPath:
              position.arrowPosition === 'top'
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                : position.arrowPosition === 'bottom'
                  ? 'polygon(0% 0%, 50% 100%, 100% 0%)'
                  : position.arrowPosition === 'left'
                    ? 'polygon(100% 0%, 100% 100%, 0% 50%)'
                    : 'polygon(0% 0%, 100% 50%, 0% 100%)',
          }}
        />

        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="mb-4">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            {currentStepData.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentStepData.description}
          </p>
        </div>

        {/* Action Button */}
        {currentStepData.action && currentStepData.onAction && (
          <button
            onClick={currentStepData.onAction}
            className="mb-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            {currentStepData.action}
          </button>
        )}

        {/* Progress */}
        <div className="mb-4 flex gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index <= step
                  ? 'bg-brand-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-50 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            {step + 1} of {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
          >
            {step === steps.length - 1 ? 'Finish' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )
}
