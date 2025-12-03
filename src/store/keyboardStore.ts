import { create } from 'zustand'

export interface KeyboardShortcut {
  key: string
  ctrlCmd?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void | Promise<void>
}

export interface KeyboardState {
  shortcuts: Map<string, KeyboardShortcut>
  isHelpOpen: boolean
  
  registerShortcut: (shortcut: KeyboardShortcut) => void
  unregisterShortcut: (key: string) => void
  getShortcut: (key: string) => KeyboardShortcut | undefined
  openHelp: () => void
  closeHelp: () => void
  toggleHelp: () => void
}

// Helper to generate shortcut key
export function getShortcutKey(
  key: string,
  ctrlCmd?: boolean,
  shift?: boolean,
  alt?: boolean
): string {
  const parts: string[] = []
  if (ctrlCmd) parts.push('CtrlCmd')
  if (shift) parts.push('Shift')
  if (alt) parts.push('Alt')
  parts.push(key)
  return parts.join('+')
}

export const useKeyboardStore = create<KeyboardState>((set, get) => ({
  shortcuts: new Map(),
  isHelpOpen: false,

  registerShortcut: (shortcut: KeyboardShortcut) => {
    const { shortcuts } = get()
    const key = getShortcutKey(shortcut.key, shortcut.ctrlCmd, shortcut.shift, shortcut.alt)
    shortcuts.set(key, shortcut)
    set({ shortcuts: new Map(shortcuts) })
  },

  unregisterShortcut: (key: string) => {
    const { shortcuts } = get()
    shortcuts.delete(key)
    set({ shortcuts: new Map(shortcuts) })
  },

  getShortcut: (key: string) => {
    const { shortcuts } = get()
    return shortcuts.get(key)
  },

  openHelp: () => {
    set({ isHelpOpen: true })
  },

  closeHelp: () => {
    set({ isHelpOpen: false })
  },

  toggleHelp: () => {
    set((state) => ({ isHelpOpen: !state.isHelpOpen }))
  },
}))

// Default shortcuts
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrlCmd: true,
    description: 'Quick add / Command palette',
    action: () => {
      // Will be wired by views
    },
  },
  {
    key: 'q',
    description: 'Quick add task',
    action: () => {
      // Will be wired by views
    },
  },
  {
    key: 'Escape',
    description: 'Cancel / Close',
    action: () => {
      // Will be wired by components
    },
  },
  {
    key: 'Enter',
    ctrlCmd: true,
    description: 'Complete task',
    action: () => {
      // Will be wired by views
    },
  },
  {
    key: '1',
    description: 'Set priority P1',
    action: () => {},
  },
  {
    key: '2',
    description: 'Set priority P2',
    action: () => {},
  },
  {
    key: '3',
    description: 'Set priority P3',
    action: () => {},
  },
  {
    key: '4',
    description: 'Set priority P4',
    action: () => {},
  },
  {
    key: 't',
    description: 'Set due date to today',
    action: () => {},
  },
  {
    key: 'm',
    description: 'Set due date to tomorrow',
    action: () => {},
  },
  {
    key: 'w',
    description: 'Set due date to next week',
    action: () => {},
  },
  {
    key: '/',
    description: 'Focus search',
    action: () => {},
  },
  {
    key: '?',
    description: 'Show keyboard shortcuts help',
    action: () => {
      useKeyboardStore.setState({ isHelpOpen: true })
    },
  },
]
