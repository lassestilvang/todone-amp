import { useState, useEffect } from 'react'
import { Trophy, Sparkles, Star } from 'lucide-react'
import { ReviewStep } from './ReviewStep'
import { Button } from '@/components/Button'
import { useTaskStore } from '@/store/taskStore'
import { cn } from '@/utils/cn'

interface CompletedTasksCelebrationProps {
  onNext: () => void
}

export function CompletedTasksCelebration({ onNext }: CompletedTasksCelebrationProps) {
  const [completedToday, setCompletedToday] = useState<number>(0)
  const [karmaEarned, setKarmaEarned] = useState<number>(0)
  const tasks = useTaskStore((state) => state.tasks)

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const completedTasks = tasks.filter((task) => {
      if (!task.completed || !task.completedAt) return false
      const completedDate = new Date(task.completedAt)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    })

    setCompletedToday(completedTasks.length)

    const karma = completedTasks.reduce((total, task) => {
      const basePoints = 10
      const priorityMultiplier: Record<string, number> = {
        p1: 2,
        p2: 1.5,
        p3: 1.25,
        p4: 1,
      }
      return total + basePoints * (priorityMultiplier[task.priority ?? 'p4'] ?? 1)
    }, 0)

    setKarmaEarned(Math.round(karma))
  }, [tasks])

  const celebrationLevel =
    completedToday >= 10 ? 'amazing' : completedToday >= 5 ? 'great' : completedToday >= 1 ? 'good' : 'start'

  const messages: Record<string, { title: string; subtitle: string }> = {
    amazing: {
      title: 'Incredible Day!',
      subtitle: "You're on fire! Keep up the amazing momentum!",
    },
    great: {
      title: 'Great Progress!',
      subtitle: "You've made solid progress today!",
    },
    good: {
      title: 'Well Done!',
      subtitle: 'Every completed task is a step forward!',
    },
    start: {
      title: 'A New Opportunity',
      subtitle: 'Tomorrow is a fresh start to achieve more!',
    },
  }

  return (
    <ReviewStep title="Today's Accomplishments" description="Let's celebrate what you achieved today">
      <div className="flex flex-col items-center py-6">
        <div
          className={cn(
            'relative w-24 h-24 mb-6 rounded-full flex items-center justify-center',
            completedToday >= 5 ? 'bg-accent-yellow-subtle' : 'bg-semantic-info-light'
          )}
        >
          <Trophy
            className={cn(
              'w-12 h-12',
              completedToday >= 5 ? 'text-icon-yellow' : 'text-icon-info'
            )}
          />
          {completedToday >= 5 && (
            <>
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-icon-yellow animate-pulse" />
              <Star className="absolute -bottom-1 -left-1 w-5 h-5 text-icon-yellow animate-pulse" />
            </>
          )}
        </div>

        <h4 className="text-2xl font-bold text-content-primary mb-2">
          {messages[celebrationLevel].title}
        </h4>
        <p className="text-content-tertiary text-center mb-8">
          {messages[celebrationLevel].subtitle}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="text-center p-4 rounded-lg bg-surface-tertiary">
            <p className="text-3xl font-bold text-content-primary">{completedToday}</p>
            <p className="text-xs text-content-tertiary mt-1">Tasks Completed</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent-purple-subtle">
            <p className="text-3xl font-bold text-accent-purple">+{karmaEarned}</p>
            <p className="text-xs text-content-tertiary mt-1">Karma Earned</p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <Button onClick={onNext} variant="primary" className="w-full">
          Continue
        </Button>
      </div>
    </ReviewStep>
  )
}
