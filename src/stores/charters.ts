import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Charter } from '@/types'

interface ChartersState {
  charters: Charter[]
  addCharter: (charter: Charter) => void
  updateCharter: (id: string, updates: Partial<Charter>) => void
  getCharter: (id: string) => Charter | undefined
}

export const useChartersStore = create<ChartersState>()(
  persist(
    (set, get) => ({
      charters: [],
      addCharter: (charter) => set((state) => ({ charters: [...state.charters, charter] })),
      updateCharter: (id, updates) =>
        set((state) => ({
          charters: state.charters.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c,
          ),
        })),
      getCharter: (id) => get().charters.find((c) => c.id === id),
    }),
    { name: 'stagemanager-charters' },
  ),
)
