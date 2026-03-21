import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import type { TerminologyEntry } from '@/types'

interface TerminologyState {
  entries: TerminologyEntry[]
  addEntry: (entry: Omit<TerminologyEntry, 'id'>) => void
  updateEntry: (id: string, patch: Partial<TerminologyEntry>) => void
  deleteEntry: (id: string) => void
  setEntries: (entries: TerminologyEntry[]) => void
  getEntriesByScaffoldingId: (scaffoldingId: string) => TerminologyEntry[]
}

export const useTerminologyStore = create<TerminologyState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) =>
        set((state) => ({
          entries: [...state.entries, { ...entry, id: generateId() }],
        })),

      updateEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      setEntries: (entries) => set({ entries }),

      getEntriesByScaffoldingId: (scaffoldingId) =>
        get().entries.filter((e) => e.scaffolding_id === scaffoldingId),
    }),
    { name: 'director-terminology' },
  ),
)
