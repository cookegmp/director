import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import type { Engagement } from '@/types'

interface EngagementsState {
  engagements: Engagement[]
  addEngagement: (engagement: Omit<Engagement, 'id'>) => void
  updateEngagement: (id: string, patch: Partial<Engagement>) => void
  deleteEngagement: (id: string) => void
  setEngagements: (engagements: Engagement[]) => void
  getEngagementsByClientId: (clientId: string) => Engagement[]
}

export const useEngagementsStore = create<EngagementsState>()(
  persist(
    (set, get) => ({
      engagements: [],

      addEngagement: (engagement) =>
        set((state) => ({
          engagements: [...state.engagements, { ...engagement, id: generateId() }],
        })),

      updateEngagement: (id, patch) =>
        set((state) => ({
          engagements: state.engagements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteEngagement: (id) =>
        set((state) => ({
          engagements: state.engagements.filter((e) => e.id !== id),
        })),

      setEngagements: (engagements) => set({ engagements }),

      getEngagementsByClientId: (clientId) =>
        get().engagements.filter((e) => e.client_id === clientId),
    }),
    { name: 'director-engagements' },
  ),
)
