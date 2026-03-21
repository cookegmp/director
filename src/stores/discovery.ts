import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import type { DiscoverySession } from '@/types'

interface DiscoveryState {
  sessions: DiscoverySession[]
  addSession: (session: Omit<DiscoverySession, 'id'>) => void
  updateSession: (id: string, patch: Partial<DiscoverySession>) => void
  deleteSession: (id: string) => void
  setSessions: (sessions: DiscoverySession[]) => void
  getSessionsByEngagementId: (engagementId: string) => DiscoverySession[]
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, { ...session, id: generateId() }],
        })),

      updateSession: (id, patch) =>
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        })),

      deleteSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        })),

      setSessions: (sessions) => set({ sessions }),

      getSessionsByEngagementId: (engagementId) =>
        get().sessions.filter((s) => s.engagement_id === engagementId),
    }),
    { name: 'director-discovery' },
  ),
)
