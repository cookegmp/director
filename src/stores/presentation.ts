import { create } from 'zustand'

interface PresentationState {
  active: boolean
  enter: () => void
  exit: () => void
  toggle: () => void
}

export const usePresentationStore = create<PresentationState>((set) => ({
  active: false,
  enter: () => set({ active: true }),
  exit: () => set({ active: false }),
  toggle: () => set((s) => ({ active: !s.active })),
}))
