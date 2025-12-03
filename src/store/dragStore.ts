import { create } from 'zustand'

export interface DragState {
  activeId: string | null
  overId: string | null
  isDragging: boolean

  setActiveId: (id: string | null) => void
  setOverId: (id: string | null) => void
  setIsDragging: (isDragging: boolean) => void
  reset: () => void
}

export const useDragStore = create<DragState>((set) => ({
  activeId: null,
  overId: null,
  isDragging: false,

  setActiveId: (id: string | null) => {
    set({ activeId: id, isDragging: id !== null })
  },

  setOverId: (id: string | null) => {
    set({ overId: id })
  },

  setIsDragging: (isDragging: boolean) => {
    set({ isDragging })
  },

  reset: () => {
    set({
      activeId: null,
      overId: null,
      isDragging: false,
    })
  },
}))
