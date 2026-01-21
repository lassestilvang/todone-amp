import { lazy, Suspense } from 'react'
import { cn } from '@/utils/cn'

const RichTextEditor = lazy(() =>
  import('@/components/RichTextEditor').then((mod) => ({ default: mod.RichTextEditor }))
)

interface RichTextEditorLazyProps {
  value?: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

function LoadingFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'border border-border rounded-md overflow-hidden animate-pulse',
        className
      )}
    >
      <div className="h-10 bg-surface-secondary border-b border-border" />
      <div className="h-[120px] bg-surface-primary" />
    </div>
  )
}

export function RichTextEditorLazy(props: RichTextEditorLazyProps) {
  return (
    <Suspense fallback={<LoadingFallback className={props.className} />}>
      <RichTextEditor {...props} />
    </Suspense>
  )
}
