import { cn } from '@/utils/cn'

interface ReviewStepProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ReviewStep({ title, description, children, className }: ReviewStepProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-content-primary">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-content-tertiary">{description}</p>
        )}
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
