import { useEffect, useState, lazy, Suspense } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import { useSectionStore } from '@/store/sectionStore'
import { useLabelStore } from '@/store/labelStore'
import { useFilterStore } from '@/store/filterStore'
import { useViewStore } from '@/store/viewStore'
import { initializeQuickAddStore } from '@/store/quickAddStore'
import { initializeDyslexiaFont } from '@/utils/dyslexiaFont'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Sidebar } from '@/components/Sidebar'
import { SkipNav } from '@/components/SkipNav'
import { ResponsiveLayout } from '@/components/ResponsiveLayout'
import { MobileNavigation } from '@/components/MobileNavigation'
import { AuthPage } from '@/pages/AuthPage'
import { TaskDetailPanel } from '@/components/TaskDetailPanel'
import { QuickAddModal } from '@/components/QuickAddModal'
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'
import { UndoNotification } from '@/components/UndoNotification'
import { AchievementNotificationCenter } from '@/components/AchievementNotificationCenter'
import { DragDropContextProvider } from '@/components/DragDropContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useDynamicFavicon } from '@/hooks/useDynamicFavicon'
import { FocusModeWidget } from '@/components/FocusMode'
import { DailyReviewModal } from '@/components/DailyReview'

// Lazy-loaded view components for code splitting
const InboxView = lazy(() => import('@/views/InboxView').then((m) => ({ default: m.InboxView })))
const TodayView = lazy(() => import('@/views/TodayView').then((m) => ({ default: m.TodayView })))
const UpcomingView = lazy(() =>
  import('@/views/UpcomingView').then((m) => ({ default: m.UpcomingView }))
)
const EisenhowerView = lazy(() =>
  import('@/views/EisenhowerView').then((m) => ({ default: m.EisenhowerView }))
)
const WeeklyReviewView = lazy(() =>
  import('@/views/WeeklyReviewView').then((m) => ({ default: m.WeeklyReviewView }))
)
const BoardView = lazy(() =>
  import('@/components/BoardView').then((m) => ({ default: m.BoardView }))
)
const CalendarView = lazy(() =>
  import('@/components/CalendarView').then((m) => ({ default: m.CalendarView }))
)

// Loading fallback component for lazy-loaded views
function ViewLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-pulse text-text-secondary">Loading view...</div>
    </div>
  )
}

type ViewIdType = string

function App() {
  const [currentView, setCurrentView] = useState('inbox')
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const loadUser = useAuthStore((state) => state.loadUser)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const loadProjects = useProjectStore((state) => state.loadProjects)
  const loadSections = useSectionStore((state) => state.loadSections)
  const loadLabels = useLabelStore((state) => state.loadLabels)
  const loadFilters = useFilterStore((state) => state.loadFilters)
  const selectedView = useViewStore((state) => state.selectedView)
  const setSelectedView = useViewStore((state) => state.setSelectedView)

  useKeyboardShortcuts(null)
  useDynamicFavicon()

  // Initialize on mount - runs once, loadUser is a stable Zustand action
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (userId) {
      loadUser(userId)
    } else {
      useAuthStore.setState({ isLoading: false })
    }
    
    // Load quick add history
    initializeQuickAddStore()
    
    // Initialize dyslexia font preference
    initializeDyslexiaFont()
  }, [loadUser])

  // Load data when user changes - Zustand actions are stable references
  useEffect(() => {
    if (user) {
      loadTasks()
      loadProjects(user.id)
      loadSections()
      loadLabels(user.id)
      loadFilters(user.id)
    }
  }, [user, loadTasks, loadProjects, loadSections, loadLabels, loadFilters])

  // Handle view changes from sidebar - reset to list view
  const handleViewChange = (view: ViewIdType) => {
    setCurrentView(view)
    // Reset to list view when changing main navigation
    if (view === 'inbox' || view === 'today' || view === 'upcoming' || view === 'eisenhower' || view === 'weekly-review') {
      setSelectedView('list')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-brand-50 to-blue-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            T
          </div>
          <p className="text-gray-600 font-medium">Loading Todone...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  const renderView = () => {
    // For standard views, render based on currentView
    // For board/calendar, render based on selectedView
    if (selectedView === 'board') {
      return <BoardView projectId={currentView === 'inbox' ? undefined : currentView} />
    }

    if (selectedView === 'calendar') {
      return <CalendarView />
    }

    switch (currentView) {
      case 'inbox':
        return <InboxView />
      case 'today':
        return <TodayView />
      case 'upcoming':
        return <UpcomingView />
      case 'eisenhower':
        return <EisenhowerView />
      case 'weekly-review':
        return <WeeklyReviewView />
      default:
        return <InboxView />
    }
  }

  return (
    <ThemeProvider>
      <DragDropContextProvider>
        <SkipNav />
        <ResponsiveLayout
          sidebar={
            <div id="sidebar" role="navigation" aria-label="Main navigation" tabIndex={-1}>
              <Sidebar currentView={currentView} onViewChange={handleViewChange} />
            </div>
          }
          mobileNav={
            <MobileNavigation currentView={currentView} onViewChange={handleViewChange} />
          }
        >
          <main id="main-content" className="flex-1 flex flex-col overflow-hidden" tabIndex={-1}>
            <Suspense fallback={<ViewLoadingFallback />}>{renderView()}</Suspense>
          </main>
        </ResponsiveLayout>
        <TaskDetailPanel />
        <QuickAddModal />
        <KeyboardShortcutsHelp />
        <UndoNotification />
        <AchievementNotificationCenter />
        {user && <FocusModeWidget userId={user.id} />}
        {user && <DailyReviewModal userId={user.id} />}
      </DragDropContextProvider>
    </ThemeProvider>
  )
}

export default App
