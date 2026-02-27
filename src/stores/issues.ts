import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Issue, Comment } from '@/types'

interface IssuesState {
  issues: Issue[]
  addIssue: (issue: Issue) => void
  updateIssue: (id: string, updates: Partial<Issue>) => void
  getIssue: (id: string) => Issue | undefined
  addComment: (issueId: string, comment: Comment) => void
}

export const useIssuesStore = create<IssuesState>()(
  persist(
    (set, get) => ({
      issues: [],
      addIssue: (issue) => set((state) => ({ issues: [...state.issues, issue] })),
      updateIssue: (id, updates) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i,
          ),
        })),
      getIssue: (id) => get().issues.find((i) => i.id === id),
      addComment: (issueId, comment) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === issueId ? { ...i, comments: [...i.comments, comment] } : i,
          ),
        })),
    }),
    { name: 'stagemanager-issues' },
  ),
)
