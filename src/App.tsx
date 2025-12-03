import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTaskStore } from '@/store/taskStore'
import { useProjectStore } from '@/store/projectStore'
import { initializeQuickAddStore } from '@/store/quickAddStore'
import { Sidebar } from '@/components/Sidebar'
import { InboxView } from '@/views/InboxView'
import { TodayView } from '@/views/TodayView'
import { UpcomingView } from '@/views/UpcomingView'
import { AuthPage } from '@/pages/AuthPage'
import { TaskDetailPanel } from '@/components/TaskDetailPanel'
import { QuickAddModal } from '@/components/QuickAddModal'
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'
import { DragDropContextProvider } from '@/components/DragDropContext'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

function App() {
  const [currentView, setCurrentView] = useState('inbox')
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const loadUser = useAuthStore((state) => state.loadUser)
  const loadTasks = useTaskStore((state) => state.loadTasks)
  const loadProjects = useProjectStore((state) => state.loadProjects)
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  // Initialize on mount
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (userId) {
      loadUser(userId)
    } else {
      useAuthStore.setState({ isLoading: false })
    }
    
    // Load quick add history
    initializeQuickAddStore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadTasks()
      loadProjects(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

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
    switch (currentView) {
      case 'inbox':
        return <InboxView />
      case 'today':
        return <TodayView />
      case 'upcoming':
        return <UpcomingView />
      default:
        return <InboxView />
    }
  }

  return (
    <DragDropContextProvider>
      <div className="flex h-screen bg-white">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderView()}
        </main>
        <TaskDetailPanel />
        <QuickAddModal />
        <KeyboardShortcutsHelp />
      </div>
    </DragDropContextProvider>
  )
}

export default App
