import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Star,
  User,
  Settings,
  Bell,
  Inbox,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from './ui/Button/Button'
import { Card } from './ui/Card/Card'
import { Badge } from './ui/Badge/Badge'
import { Input } from './ui/Input/Input'
import { Skeleton } from './ui/Skeleton/Skeleton'

const ThemeShowcase = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Typography</h2>
        <div className="space-y-2">
          <p className="text-content-primary text-lg font-semibold">Primary Text (Headings)</p>
          <p className="text-content-secondary">Secondary Text (Body content)</p>
          <p className="text-content-tertiary text-sm">Tertiary Text (Meta information)</p>
          <p className="text-content-disabled text-sm">Disabled Text</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Surfaces</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-primary rounded-lg border border-border">
            <p className="text-sm text-content-secondary">Primary</p>
          </div>
          <div className="p-4 bg-surface-secondary rounded-lg border border-border">
            <p className="text-sm text-content-secondary">Secondary</p>
          </div>
          <div className="p-4 bg-surface-tertiary rounded-lg border border-border">
            <p className="text-sm text-content-secondary">Tertiary</p>
          </div>
          <div className="p-4 bg-surface-elevated rounded-lg shadow-md border border-border">
            <p className="text-sm text-content-secondary">Elevated</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
          <Button icon={Plus}>With Icon</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
          <Input placeholder="Default input" />
          <Input placeholder="Disabled input" disabled />
          <Input defaultValue="With value" />
          <Input placeholder="With error" className="border-semantic-error" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="p-4">
              <h3 className="font-semibold text-content-primary">Task Card</h3>
              <p className="text-content-secondary text-sm mt-1">This is a sample task card</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="success">Completed</Badge>
                <Badge variant="default">Low Priority</Badge>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <h3 className="font-semibold text-content-primary">Project Card</h3>
              <p className="text-content-secondary text-sm mt-1">A project with multiple tasks</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="warning">In Progress</Badge>
                <Badge variant="info">5 tasks</Badge>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Badges & Status</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="default">Default</Badge>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Priority Colors</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 rounded bg-priority-p1-bg text-priority-p1 text-sm font-medium">
            P1 - Critical
          </span>
          <span className="px-3 py-1 rounded bg-priority-p2-bg text-priority-p2 text-sm font-medium">
            P2 - High
          </span>
          <span className="px-3 py-1 rounded bg-priority-p3-bg text-priority-p3 text-sm font-medium">
            P3 - Medium
          </span>
          <span className="px-3 py-1 rounded bg-priority-p4-bg text-priority-p4 text-sm font-medium">
            P4 - Low
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-semantic-success-light rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-icon-success" />
            <span className="text-semantic-success font-medium">Success</span>
          </div>
          <div className="p-3 bg-semantic-warning-light rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-icon-warning" />
            <span className="text-semantic-warning font-medium">Warning</span>
          </div>
          <div className="p-3 bg-semantic-error-light rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-icon-error" />
            <span className="text-semantic-error font-medium">Error</span>
          </div>
          <div className="p-3 bg-semantic-info-light rounded-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-icon-info" />
            <span className="text-semantic-info font-medium">Info</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Icons</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-1">
            <Calendar className="w-6 h-6 text-content-secondary" />
            <span className="text-xs text-content-tertiary">Secondary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Star className="w-6 h-6 text-icon-warning" />
            <span className="text-xs text-content-tertiary">Warning</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-icon-info" />
            <span className="text-xs text-content-tertiary">Info</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Settings className="w-6 h-6 text-content-tertiary" />
            <span className="text-xs text-content-tertiary">Tertiary</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bell className="w-6 h-6 text-icon-purple" />
            <span className="text-xs text-content-tertiary">Purple</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Inbox className="w-6 h-6 text-icon-teal" />
            <span className="text-xs text-content-tertiary">Teal</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Trash2 className="w-6 h-6 text-icon-error" />
            <span className="text-xs text-content-tertiary">Error</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Shadows</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-primary rounded-lg shadow-sm">
            <p className="text-sm text-content-secondary">Small</p>
          </div>
          <div className="p-4 bg-surface-primary rounded-lg shadow-md">
            <p className="text-sm text-content-secondary">Medium</p>
          </div>
          <div className="p-4 bg-surface-primary rounded-lg shadow-lg">
            <p className="text-sm text-content-secondary">Large</p>
          </div>
          <div className="p-4 bg-surface-primary rounded-lg shadow-elevated">
            <p className="text-sm text-content-secondary">Elevated</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Loading States</h2>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Sidebar Preview</h2>
        <div className="w-64 bg-sidebar-bg rounded-lg p-2 space-y-1">
          <div className="px-3 py-2 rounded-lg bg-sidebar-active text-content-primary font-medium flex items-center gap-2">
            <Inbox className="w-4 h-4" />
            Today
          </div>
          <div className="px-3 py-2 rounded-lg text-sidebar-text hover:bg-sidebar-hover flex items-center gap-2 cursor-pointer">
            <Calendar className="w-4 h-4" />
            Upcoming
          </div>
          <div className="px-3 py-2 rounded-lg text-sidebar-text-muted hover:bg-sidebar-hover flex items-center gap-2 cursor-pointer">
            <Star className="w-4 h-4" />
            Favorites
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Focus States</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-surface-secondary rounded-lg border border-border focus:ring-2 focus:ring-focus focus:outline-none">
            Focus Me
          </button>
          <input
            type="text"
            placeholder="Focus Me"
            className="px-4 py-2 bg-input-bg border border-input-border rounded-lg focus:ring-2 focus:ring-focus focus:border-input-border-focus focus:outline-none"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-content-primary mb-4">Accent Colors</h2>
        <div className="flex flex-wrap gap-4">
          <div className="p-4 bg-accent-purple-subtle rounded-lg">
            <span className="text-accent-purple font-medium">Purple Accent</span>
          </div>
          <div className="p-4 bg-accent-indigo-subtle rounded-lg">
            <span className="text-accent-indigo font-medium">Indigo Accent</span>
          </div>
          <div className="p-4 bg-accent-teal-subtle rounded-lg">
            <span className="text-accent-teal font-medium">Teal Accent</span>
          </div>
        </div>
      </section>
    </div>
  )
}

const meta: Meta<typeof ThemeShowcase> = {
  title: 'Theme/Showcase',
  component: ThemeShowcase,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ThemeShowcase>

export const Default: Story = {}

export const AllElements: Story = {
  render: () => <ThemeShowcase />,
}
