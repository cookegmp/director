// ============================================================================
// Issue Scoring — Remediation Sessions Store
// ============================================================================
// Tracks active and queued auto-remediation sessions.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RemediationSession, RemediationStatus } from '../types';

interface RemediationSessionsState {
  sessions: RemediationSession[];
  queue: string[];
  addSession: (session: RemediationSession) => void;
  updateSession: (id: string, updates: Partial<RemediationSession>) => void;
  getActiveSessionsCount: () => number;
  getSessionForIssue: (issueId: string) => RemediationSession | undefined;
  getQueuedIssues: () => string[];
  addToQueue: (issueId: string) => void;
  removeFromQueue: (issueId: string) => void;
}

const ACTIVE_STATUSES: RemediationStatus[] = ['approved', 'triggered', 'in_progress'];

export const useRemediationSessionsStore = create<RemediationSessionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      queue: [],

      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      getActiveSessionsCount: () =>
        get().sessions.filter((s) => ACTIVE_STATUSES.includes(s.status)).length,

      getSessionForIssue: (issueId) =>
        get().sessions.find((s) => s.issue_id === issueId),

      getQueuedIssues: () => get().queue,

      addToQueue: (issueId) =>
        set((state) => ({
          queue: state.queue.includes(issueId) ? state.queue : [...state.queue, issueId],
        })),

      removeFromQueue: (issueId) =>
        set((state) => ({
          queue: state.queue.filter((id) => id !== issueId),
        })),
    }),
    { name: 'stagemanager-remediation-sessions' }
  )
);
