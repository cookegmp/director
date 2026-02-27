// ============================================================================
// Issue Reporter — Submitted Issues Store
// ============================================================================
// Stores submitted issues with BackStage-ready interfaces.
// Independent from the main issues store in src/stores/issues.ts.
// When BackStage is implemented, only the data-fetching functions change.
// ============================================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ReportedIssue, IssueComment } from '../types'

interface ReportedIssuesState {
  issues: ReportedIssue[]
  addIssue: (issue: ReportedIssue) => void
  updateIssue: (id: string, updates: Partial<ReportedIssue>) => void
  getIssue: (id: string) => ReportedIssue | undefined
  addComment: (issueId: string, comment: IssueComment) => void
  getIssuesByProject: (projectId: string) => ReportedIssue[]
}

export const useReportedIssuesStore = create<ReportedIssuesState>()(
  persist(
    (set, get) => ({
      issues: [],

      addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),

      updateIssue: (id, updates) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i,
          ),
        })),

      getIssue: (id) => get().issues.find((i) => i.id === id),

      addComment: (_issueId, _comment) => {
        // Comments will be stored when BackStage is ready
        // For now, this is a no-op placeholder
      },

      getIssuesByProject: (projectId) => get().issues.filter((i) => i.project_id === projectId),
    }),
    { name: 'stagemanager-reported-issues' },
  ),
)
