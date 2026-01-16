import { Target } from 'lucide-react'
import { ReviewStep } from './ReviewStep'
import { Button } from '@/components/Button'
import { useDailyReviewStore } from '@/store/dailyReviewStore'
import { cn } from '@/utils/cn'

interface DailyIntentionProps {
  onNext: () => void
}

export function DailyIntention({ onNext }: DailyIntentionProps) {
  const { intention, setIntention } = useDailyReviewStore()

  return (
    <ReviewStep
      title="Set Your Intention"
      description="What's your main focus for today?"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Target className="w-8 h-8 text-purple-500" />
        </div>
      </div>
      <div className="space-y-4">
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="e.g., Complete the project proposal, Focus on deep work, Clear my inbox..."
          className={cn(
            'w-full h-32 px-4 py-3 rounded-lg border resize-none',
            'bg-surface-primary',
            'border-border',
            'text-content-primary',
            'placeholder-content-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          )}
          autoFocus
        />
        <p className="text-xs text-content-tertiary text-center">
          Setting a clear intention helps you stay focused throughout the day
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <Button onClick={onNext} variant="primary" className="w-full">
          {intention.trim() ? 'Set Intention & Continue' : 'Skip for Now'}
        </Button>
      </div>
    </ReviewStep>
  )
}
