import { BookOpen } from 'lucide-react'
import { ReviewStep } from './ReviewStep'
import { Button } from '@/components/Button'
import { useDailyReviewStore } from '@/store/dailyReviewStore'
import { cn } from '@/utils/cn'

interface ReflectionInputProps {
  onNext: () => void
}

const REFLECTION_PROMPTS = [
  'What went well today?',
  'What could have gone better?',
  'What did you learn?',
  'What are you grateful for?',
]

export function ReflectionInput({ onNext }: ReflectionInputProps) {
  const { reflection, setReflection } = useDailyReviewStore()

  return (
    <ReviewStep title="Evening Reflection" description="Take a moment to reflect on your day">
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-indigo-500" />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-content-tertiary mb-2">Consider these prompts:</p>
        <ul className="space-y-1">
          {REFLECTION_PROMPTS.map((prompt, index) => (
            <li
              key={index}
              className="text-sm text-content-secondary flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              {prompt}
            </li>
          ))}
        </ul>
      </div>

      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="Write your thoughts here..."
        className={cn(
          'w-full h-40 px-4 py-3 rounded-lg border resize-none',
          'bg-surface-primary',
          'border-border',
          'text-content-primary',
          'placeholder-content-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
        )}
        autoFocus
      />

      <div className="mt-6 pt-4 border-t border-border">
        <Button onClick={onNext} variant="primary" className="w-full">
          {reflection.trim() ? 'Save Reflection & Continue' : 'Skip for Now'}
        </Button>
      </div>
    </ReviewStep>
  )
}
