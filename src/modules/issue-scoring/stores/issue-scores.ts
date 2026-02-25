// ============================================================================
// Issue Scoring — Issue Scores Store
// ============================================================================
// Stores computed scores for each issue.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IssueScore, RemediationStatus } from '../types';

interface IssueScoresState {
  scores: IssueScore[];
  addScore: (score: IssueScore) => void;
  updateScore: (issueId: string, updates: Partial<IssueScore>) => void;
  getScore: (issueId: string) => IssueScore | undefined;
  getScoresByProject: (projectId: string, issueIds: string[]) => IssueScore[];
  removeScore: (issueId: string) => void;
  setRemediationStatus: (issueId: string, status: RemediationStatus | null, sessionId?: string | null) => void;
}

export const useIssueScoresStore = create<IssueScoresState>()(
  persist(
    (set, get) => ({
      scores: [],

      addScore: (score) =>
        set((state) => {
          // Replace existing score for the same issue
          const filtered = state.scores.filter((s) => s.issue_id !== score.issue_id);
          return { scores: [...filtered, score] };
        }),

      updateScore: (issueId, updates) =>
        set((state) => ({
          scores: state.scores.map((s) =>
            s.issue_id === issueId ? { ...s, ...updates } : s
          ),
        })),

      getScore: (issueId) => get().scores.find((s) => s.issue_id === issueId),

      getScoresByProject: (_projectId, issueIds) =>
        get().scores.filter((s) => issueIds.includes(s.issue_id)),

      removeScore: (issueId) =>
        set((state) => ({
          scores: state.scores.filter((s) => s.issue_id !== issueId),
        })),

      setRemediationStatus: (issueId, status, sessionId) =>
        set((state) => ({
          scores: state.scores.map((s) =>
            s.issue_id === issueId
              ? {
                  ...s,
                  remediation_status: status,
                  ...(sessionId !== undefined ? { remediation_session_id: sessionId } : {}),
                }
              : s
          ),
        })),
    }),
    { name: 'stagemanager-issue-scores' }
  )
);
