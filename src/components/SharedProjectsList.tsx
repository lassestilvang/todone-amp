import { useShareStore } from '@/store/shareStore'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface SharedProjectsListProps {
  className?: string
}

export function SharedProjectsList({ className }: SharedProjectsListProps) {
  const { user } = useAuthStore()
  const { projectShares } = useShareStore()
  const { projects } = useProjectStore()

  // Note: Loading shares for current user should be done by parent component
  // This component displays shares already loaded in the store

  if (!user) return null

  // Get projects shared with current user
  const sharedWithMe = projectShares
    .filter((s) => s.userId === user.id)
    .map((s) => projects.find((p) => p.id === s.projectId))
    .filter((p) => p !== undefined)

  if (sharedWithMe.length === 0) {
    return (
      <div
        className={cn('rounded border border-dashed border-border p-4 text-center', className)}
      >
        <p className="text-sm text-content-tertiary">No projects shared with you yet</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-medium text-content-secondary">Shared With Me</h3>
      <div className="space-y-2">
        {sharedWithMe.map((project) => {
          if (!project) return null
          const share = projectShares.find(
            (s) => s.projectId === project.id && s.userId === user.id
          )
          return (
            <div
              key={project.id}
              className="flex items-center justify-between rounded border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                <div>
                  <p className="font-medium text-content-primary">{project.name}</p>
                  <p className="text-xs text-content-tertiary">
                    {share?.role === 'owner' && 'Owner'}
                    {share?.role === 'admin' && 'Admin'}
                    {share?.role === 'member' && 'Member'}
                  </p>
                </div>
              </div>
              <div className="text-xs text-content-tertiary">
                Shared at {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
