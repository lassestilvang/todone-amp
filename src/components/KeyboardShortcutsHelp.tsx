import { X } from 'lucide-react'
import { useKeyboardStore, DEFAULT_SHORTCUTS } from '@/store/keyboardStore'

export function KeyboardShortcutsHelp() {
  const { isHelpOpen, closeHelp } = useKeyboardStore()

  if (!isHelpOpen) {
    return null
  }

  // Group shortcuts by category
  const categories = {
    'General': DEFAULT_SHORTCUTS.filter(s => 
      ['k', '?', 'Escape'].includes(s.key.toLowerCase())
    ),
    'Task Management': DEFAULT_SHORTCUTS.filter(s => 
      ['q', 'Enter', 't', 'm', 'w'].includes(s.key.toLowerCase())
    ),
    'Priority': DEFAULT_SHORTCUTS.filter(s => 
      ['1', '2', '3', '4'].includes(s.key)
    ),
    'Search': DEFAULT_SHORTCUTS.filter(s => 
      ['/'].includes(s.key)
    ),
    'Focus Mode': DEFAULT_SHORTCUTS.filter(s => 
      s.key.toLowerCase() === 'f' && s.ctrlCmd && s.shift
    ),
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeHelp}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-surface-primary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-surface-primary border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-content-primary">Keyboard Shortcuts</h2>
            <button
              onClick={closeHelp}
              className="p-1 text-content-tertiary hover:text-content-secondary rounded-md hover:bg-surface-tertiary"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {Object.entries(categories).map(([category, shortcuts]) => (
              shortcuts.length > 0 && (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-content-primary mb-3">{category}</h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut) => (
                      <div
                        key={`${shortcut.key}-${shortcut.ctrlCmd}-${shortcut.shift}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-tertiary transition-colors"
                      >
                        <span className="text-sm text-content-secondary">{shortcut.description}</span>
                        <div className="flex gap-1">
                          {shortcut.ctrlCmd && (
                            <kbd className="px-2 py-1 text-xs font-semibold text-content-primary bg-interactive-secondary border border-border rounded">
                              Ctrl/Cmd
                            </kbd>
                          )}
                          {shortcut.shift && (
                            <kbd className="px-2 py-1 text-xs font-semibold text-content-primary bg-interactive-secondary border border-border rounded">
                              Shift
                            </kbd>
                          )}
                          {shortcut.alt && (
                            <kbd className="px-2 py-1 text-xs font-semibold text-content-primary bg-interactive-secondary border border-border rounded">
                              Alt
                            </kbd>
                          )}
                          <kbd className="px-2 py-1 text-xs font-semibold text-content-primary bg-interactive-secondary border border-border rounded">
                            {shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase()}
                          </kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-surface-secondary px-6 py-4">
            <p className="text-xs text-content-secondary">
              Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-interactive-secondary border border-border rounded">?</kbd> to toggle this help
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
