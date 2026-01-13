import React, { useEffect, useState } from 'react'
import { Plus, Target, Archive, Trash2, Edit, ArrowLeft, Flame } from 'lucide-react'
import { useHabitStore } from '@/store/habitStore'
import { useAuthStore } from '@/store/authStore'
import { HabitList, HabitForm, HabitStreakCalendar, HabitStats, HabitReminder } from '@/components/Habits'
import type { Habit } from '@/types'
import clsx from 'clsx'

export const HabitsView: React.FC = () => {
  const user = useAuthStore((state) => state.user)
  const habits = useHabitStore((state) => state.habits)
  const loading = useHabitStore((state) => state.loading)
  const loadHabits = useHabitStore((state) => state.loadHabits)
  const addHabit = useHabitStore((state) => state.addHabit)
  const updateHabit = useHabitStore((state) => state.updateHabit)
  const archiveHabit = useHabitStore((state) => state.archiveHabit)
  const deleteHabit = useHabitStore((state) => state.deleteHabit)
  const getStreak = useHabitStore((state) => state.getStreak)

  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadHabits(user.id)
    }
  }, [user?.id, loadHabits])

  const activeHabits = habits.filter((h) => !h.archivedAt)
  const totalStreaks = activeHabits.reduce((sum, h) => sum + getStreak(h.id), 0)
  const habitsWithStreaks = activeHabits.filter((h) => getStreak(h.id) > 0).length

  const handleSubmit = async (data: Omit<Habit, 'id' | 'createdAt'>) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data)
    } else {
      await addHabit(data)
    }
    setShowForm(false)
    setEditingHabit(null)
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowForm(true)
    setSelectedHabit(null)
  }

  const handleArchive = async (habit: Habit) => {
    if (habit.archivedAt) {
      await updateHabit(habit.id, { archivedAt: undefined })
    } else {
      await archiveHabit(habit.id)
    }
    setSelectedHabit(null)
  }

  const handleDelete = async (habit: Habit) => {
    if (window.confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      await deleteHabit(habit.id)
      setSelectedHabit(null)
    }
  }

  const handleReminderChange = async (time: string | undefined) => {
    if (selectedHabit) {
      await updateHabit(selectedHabit.id, { reminderTime: time })
      setSelectedHabit({ ...selectedHabit, reminderTime: time })
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">Please sign in to view habits</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedHabit ? (
              <button
                onClick={() => setSelectedHabit(null)}
                className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            ) : (
              <Target className="w-6 h-6 text-brand-600" />
            )}
            <div>
              {selectedHabit ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedHabit.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedHabit.name}
                    </h2>
                  </div>
                  {selectedHabit.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedHabit.description}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Habits</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {activeHabits.length} habit{activeHabits.length !== 1 ? 's' : ''}
                    {habitsWithStreaks > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-orange-500">
                        <Flame className="w-4 h-4" />
                        {totalStreaks} total streak days
                      </span>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedHabit ? (
              <>
                <button
                  onClick={() => handleEdit(selectedHabit)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Edit habit"
                >
                  <Edit className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => handleArchive(selectedHabit)}
                  className={clsx(
                    'p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors',
                    selectedHabit.archivedAt && 'text-brand-600'
                  )}
                  title={selectedHabit.archivedAt ? 'Unarchive habit' : 'Archive habit'}
                >
                  <Archive className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(selectedHabit)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                  title="Delete habit"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Habit
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          </div>
        ) : selectedHabit ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <HabitStreakCalendar habit={selectedHabit} />
            <HabitStats habit={selectedHabit} />
            <HabitReminder
              reminderTime={selectedHabit.reminderTime}
              onChange={handleReminderChange}
            />
          </div>
        ) : habits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No habits yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
              Start building positive habits by creating your first one. Track your progress and maintain streaks!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first habit
            </button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <HabitList habits={habits} onSelectHabit={setSelectedHabit} />
          </div>
        )}
      </div>

      {showForm && (
        <HabitForm
          habit={editingHabit || undefined}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false)
            setEditingHabit(null)
          }}
          userId={user.id}
        />
      )}
    </div>
  )
}
