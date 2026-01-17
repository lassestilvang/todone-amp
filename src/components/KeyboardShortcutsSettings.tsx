import { useState } from 'react'
import { Keyboard, RotateCcw, Save, X } from 'lucide-react'
import { Button } from '@/components/Button'
import { cn } from '@/utils/cn'
import type { KeyboardShortcut } from '@/store/keyboardStore'

const DEFAULT_SHORTCUTS: Array<KeyboardShortcut & { id: string }> = [
  {
    id: 'quick-add',
    key: 'k',
    ctrlCmd: true,
    description: 'Quick add / Command palette',
    action: () => {},
  },
  {
    id: 'quick-add-alt',
    key: 'q',
    description: 'Quick add task',
    action: () => {},
  },
  {
    id: 'escape',
    key: 'Escape',
    description: 'Cancel / Close',
    action: () => {},
  },
  {
    id: 'complete',
    key: 'Enter',
    ctrlCmd: true,
    description: 'Complete task',
    action: () => {},
  },
  {
    id: 'priority-1',
    key: '1',
    description: 'Set priority P1',
    action: () => {},
  },
  {
    id: 'priority-2',
    key: '2',
    description: 'Set priority P2',
    action: () => {},
  },
  {
    id: 'priority-3',
    key: '3',
    description: 'Set priority P3',
    action: () => {},
  },
  {
    id: 'priority-4',
    key: '4',
    description: 'Set priority P4',
    action: () => {},
  },
  {
    id: 'today',
    key: 't',
    description: 'Set due date to today',
    action: () => {},
  },
  {
    id: 'tomorrow',
    key: 'm',
    description: 'Set due date to tomorrow',
    action: () => {},
  },
  {
    id: 'next-week',
    key: 'w',
    description: 'Set due date to next week',
    action: () => {},
  },
  {
    id: 'search',
    key: '/',
    description: 'Focus search',
    action: () => {},
  },
  {
    id: 'help',
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts help',
    action: () => {},
  },
  {
    id: 'delete',
    key: 'Delete',
    description: 'Delete task',
    action: () => {},
  },
  {
    id: 'duplicate',
    key: 'd',
    ctrlCmd: true,
    description: 'Duplicate task',
    action: () => {},
  },
  {
    id: 'select-toggle',
    key: 'a',
    description: 'Toggle multi-select mode',
    action: () => {},
  },
  {
    id: 'select-all',
    key: 'A',
    shift: true,
    description: 'Select all visible tasks',
    action: () => {},
  },
  {
    id: 'move-up',
    key: 'ArrowUp',
    ctrlCmd: true,
    description: 'Move task up',
    action: () => {},
  },
  {
    id: 'move-down',
    key: 'ArrowDown',
    ctrlCmd: true,
    description: 'Move task down',
    action: () => {},
  },
  {
    id: 'indent',
    key: ']',
    ctrlCmd: true,
    description: 'Indent task (make subtask)',
    action: () => {},
  },
  {
    id: 'outdent',
    key: '[',
    ctrlCmd: true,
    description: 'Outdent task',
    action: () => {},
  },
]

interface ShortcutConfig {
  [key: string]: {
    key: string
    ctrlCmd?: boolean
    shift?: boolean
    alt?: boolean
  }
}

interface KeyboardShortcutsSettingsProps {
  onClose?: () => void
}

export function KeyboardShortcutsSettings({ onClose }: KeyboardShortcutsSettingsProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutConfig>(() => {
    const stored = localStorage.getItem('keyboard-shortcuts')
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize from defaults
    const config: ShortcutConfig = {}
    DEFAULT_SHORTCUTS.forEach((s) => {
      config[s.id] = {
        key: s.key,
        ctrlCmd: s.ctrlCmd,
        shift: s.shift,
        alt: s.alt,
      }
    })
    return config
  })

  const [recordingId, setRecordingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStartRecording = (id: string) => {
    setRecordingId(id)
    setError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!recordingId) return
    e.preventDefault()

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const isCtrlCmd = isMac ? e.metaKey : e.ctrlKey

    const newShortcut = {
      key: e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toLowerCase() : e.key,
      ctrlCmd: isCtrlCmd,
      shift: e.shiftKey,
      alt: e.altKey,
    }

    // Validate: at least one modifier or non-letter key required (except for single letters)
    if (
      !newShortcut.ctrlCmd &&
      !newShortcut.shift &&
      !newShortcut.alt &&
      newShortcut.key.length === 1 &&
      newShortcut.key !== 'Escape'
    ) {
      setError('Shortcuts require a modifier key (Ctrl/Cmd, Shift, or Alt) for single keys')
      return
    }

    // Check for duplicates (excluding current shortcut)
    const isDuplicate = Object.entries(shortcuts).some(
      ([key, shortcut]) =>
        key !== recordingId &&
        shortcut.key === newShortcut.key &&
        shortcut.ctrlCmd === newShortcut.ctrlCmd &&
        shortcut.shift === newShortcut.shift &&
        shortcut.alt === newShortcut.alt
    )

    if (isDuplicate) {
      setError('This shortcut is already assigned')
      return
    }

    setShortcuts((prev) => ({
      ...prev,
      [recordingId]: newShortcut,
    }))
    setRecordingId(null)
    setError(null)
  }

  const handleResetDefaults = () => {
    const config: ShortcutConfig = {}
    DEFAULT_SHORTCUTS.forEach((s) => {
      config[s.id] = {
        key: s.key,
        ctrlCmd: s.ctrlCmd,
        shift: s.shift,
        alt: s.alt,
      }
    })
    setShortcuts(config)
    setError(null)
  }

  const handleSave = () => {
    localStorage.setItem('keyboard-shortcuts', JSON.stringify(shortcuts))
    onClose?.()
  }

  const formatShortcut = (config: ShortcutConfig[string]): string => {
    const parts: string[] = []
    if (config.ctrlCmd) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      parts.push(isMac ? '⌘' : 'Ctrl')
    }
    if (config.shift) parts.push('Shift')
    if (config.alt) parts.push('Alt')
    parts.push(config.key === ' ' ? 'Space' : config.key)
    return parts.join(' + ')
  }

  return (
    <div className="flex flex-col h-full bg-surface-primary rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Keyboard className="w-6 h-6 text-brand-600" />
          <h2 className="text-xl font-bold text-content-primary">Keyboard Shortcuts</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-content-secondary" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-4">
            {DEFAULT_SHORTCUTS.map((shortcut) => {
              const config = shortcuts[shortcut.id]
              const isRecording = recordingId === shortcut.id

              return (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-4 bg-surface-secondary rounded-lg border border-border hover:border-content-tertiary transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-content-primary">{shortcut.description}</p>
                    <p className="text-xs text-content-tertiary mt-1">ID: {shortcut.id}</p>
                  </div>

                  <button
                    onKeyDown={handleKeyDown}
                    onClick={() => handleStartRecording(shortcut.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg font-mono text-sm font-medium transition-all',
                      isRecording
                        ? 'bg-brand-600 text-white animate-pulse'
                        : 'bg-surface-primary border border-border text-content-primary hover:border-brand-300'
                    )}
                  >
                    {isRecording ? 'Press key...' : formatShortcut(config)}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-6 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={handleResetDefaults} icon={RotateCcw}>
          Reset to Defaults
        </Button>
        <div className="flex gap-3">
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} icon={Save}>
            Save Shortcuts
          </Button>
        </div>
      </div>
    </div>
  )
}
