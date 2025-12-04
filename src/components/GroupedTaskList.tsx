import { useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useViewStore } from '@/store/viewStore'
import { useLabelStore } from '@/store/labelStore'
import { useProjectStore } from '@/store/projectStore'
import { TaskList } from '@/components/TaskList'
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns'
import type { Task } from '@/types'

interface GroupedTaskListProps {
  tasks: Task[]
  selectedTaskId: string | null
  onToggle: (id: string) => Promise<void>
  onSelect: (id: string) => void
}

type GroupKey = string

export function GroupedTaskList({
  tasks,
  selectedTaskId,
  onToggle,
  onSelect,
}: GroupedTaskListProps) {
  const listGroupBy = useViewStore((state) => state.listGroupBy)
  const listSortBy = useViewStore((state) => state.listSortBy)
  const collapsedGroups = useViewStore((state) => state.collapsedGroups)
  const toggleGroupCollapsed = useViewStore((state) => state.toggleGroupCollapsed)

  const labels = useLabelStore((state) => state.labels)
  const projects = useProjectStore((state) => state.projects)

  // Group tasks
  const groupedTasks = useMemo(() => {
    if (listGroupBy === 'none') {
      return [{ key: 'all', label: 'All Tasks', tasks }]
    }

    const groups: Record<GroupKey, Task[]> = {}

    tasks.forEach((task) => {
      let groupKey: GroupKey

      switch (listGroupBy) {
        case 'date': {
          if (!task.dueDate) {
            groupKey = 'no-date'
          } else {
            const date = new Date(task.dueDate)
            if (isToday(date)) {
              groupKey = 'today'
            } else if (isTomorrow(date)) {
              groupKey = 'tomorrow'
            } else if (isThisWeek(date)) {
              groupKey = `week-${format(date, 'EEEE')}`
            } else {
              groupKey = format(date, 'yyyy-MM-dd')
            }
          }
          break
        }

        case 'project': {
          if (!task.projectId) {
            groupKey = 'no-project'
          } else {
            groupKey = task.projectId
          }
          break
        }

        case 'priority': {
          groupKey = task.priority || 'p4'
          break
        }

        case 'label': {
          if (!task.labels || task.labels.length === 0) {
            groupKey = 'no-label'
          } else {
            groupKey = task.labels[0]
          }
          break
        }

        default:
          groupKey = 'all'
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(task)
    })

    return Object.entries(groups).map(([key, groupTasks]) => {
      // Get label for this group
      const groupLabel =
        listGroupBy === 'date'
          ? getDateGroupLabel(key)
          : listGroupBy === 'project'
            ? projects.find((p) => p.id === key)?.name || 'Inbox'
            : listGroupBy === 'priority'
              ? getPriorityLabel(key)
              : listGroupBy === 'label'
                ? labels.find((l) => l.id === key)?.name || 'No Labels'
                : 'All Tasks'

      return { key, label: groupLabel, tasks: groupTasks }
    })
  }, [tasks, listGroupBy, labels, projects])

  // Sort tasks within groups
  const sortedGroupedTasks = useMemo(
    () =>
      groupedTasks.map((group) => ({
        ...group,
        tasks: sortTasks(group.tasks, listSortBy),
      })),
    [groupedTasks, listSortBy]
  )

  return (
    <div className="space-y-4">
      {sortedGroupedTasks.map((group) => (
        <div key={group.key}>
          {/* Group Header */}
          <button
            onClick={() => toggleGroupCollapsed(group.key)}
            className="w-full px-6 py-3 flex items-center gap-2 bg-gray-100 hover:bg-gray-150 transition-colors sticky top-0 z-5"
          >
            {collapsedGroups.has(group.key) ? (
              <ChevronRight size={16} className="text-gray-600" />
            ) : (
              <ChevronDown size={16} className="text-gray-600" />
            )}
            <span className="font-semibold text-gray-900">{group.label}</span>
            <span className="ml-auto text-sm text-gray-600">({group.tasks.length})</span>
          </button>

          {/* Group Tasks */}
          {!collapsedGroups.has(group.key) && (
            <div>
              <TaskList
                tasks={group.tasks}
                selectedTaskId={selectedTaskId}
                onToggle={onToggle}
                onSelect={onSelect}
                emptyMessage={`No tasks in ${group.label.toLowerCase()}`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Helper functions
function getDateGroupLabel(key: string): string {
  if (key === 'today') return 'Today'
  if (key === 'tomorrow') return 'Tomorrow'
  if (key === 'no-date') return 'No Due Date'
  if (key.startsWith('week-')) {
    return key.replace('week-', '')
  }
  return key
}

function getPriorityLabel(priority: string): string {
  const map: Record<string, string> = {
    p1: 'P1 - Urgent',
    p2: 'P2 - High',
    p3: 'P3 - Medium',
    p4: 'P4 - Low',
  }
  return map[priority] || 'Unknown'
}

function sortTasks(tasks: Task[], sortBy: string | undefined): Task[] {
  const sorted = [...tasks]

  switch (sortBy) {
    case 'due-date': {
      sorted.sort((a, b) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
      break
    }

    case 'priority': {
      const priorityOrder = { p1: 0, p2: 1, p3: 2, p4: 3 }
      sorted.sort(
        (a, b) =>
          (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3)
      )
      break
    }

    case 'created': {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      break
    }

    case 'alphabetical': {
      sorted.sort((a, b) => a.content.localeCompare(b.content))
      break
    }

    case 'custom':
    default: {
      sorted.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      break
    }
  }

  return sorted
}
