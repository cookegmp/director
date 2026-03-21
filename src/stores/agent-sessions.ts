import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AgentSession,
  AgentSessionStatus,
  TranslatedEntry,
  RawOutputLine,
  AgentError,
} from '@/types'

interface AgentSessionsState {
  sessions: AgentSession[]
  addSession: (session: AgentSession) => void
  updateSessionStatus: (id: string, status: AgentSessionStatus) => void
  appendTranslatedEntry: (id: string, entry: TranslatedEntry) => void
  appendRawOutput: (id: string, line: RawOutputLine) => void
  appendError: (id: string, error: AgentError) => void
  getSession: (id: string) => AgentSession | undefined
  getSessionByIdeaId: (ideaId: string) => AgentSession | undefined
}

export const useAgentSessionsStore = create<AgentSessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],

      addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),

      updateSessionStatus: (id, status) =>
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== id) return s
            const now = new Date().toISOString()
            return {
              ...s,
              status,
              connectedAt: status === 'connected' && !s.connectedAt ? now : s.connectedAt,
              completedAt: status === 'complete' ? now : s.completedAt,
              stoppedAt: status === 'stopped' ? now : s.stoppedAt,
            }
          }),
        })),

      appendTranslatedEntry: (id, entry) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, translatedEntries: [...s.translatedEntries, entry] } : s,
          ),
        })),

      appendRawOutput: (id, line) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, rawOutput: [...s.rawOutput, line] } : s,
          ),
        })),

      appendError: (id, error) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, errors: [...s.errors, error] } : s,
          ),
        })),

      getSession: (id) => get().sessions.find((s) => s.id === id),

      getSessionByIdeaId: (ideaId) => get().sessions.find((s) => s.ideaId === ideaId),
    }),
    { name: 'control-agent-sessions' },
  ),
)
