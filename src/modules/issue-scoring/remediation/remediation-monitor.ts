// ============================================================================
// Issue Scoring — Remediation Monitor
// ============================================================================
// Watches remediation session state and handles completion/failure.
// In prototype mode, simulates progress through states on a timer.
// ============================================================================

import { generateId } from '@/lib/utils';
import { useActivityStore } from '@/stores/activity';
import { useIssueScoresStore } from '../stores/issue-scores';
import { useRemediationSessionsStore } from '../stores/remediation-sessions';
import { processQueue } from './session-queue';

export function monitorSession(sessionId: string): void {
  const session = useRemediationSessionsStore.getState().sessions.find((s) => s.id === sessionId);
  if (!session) return;

  // In prototype mode, simulate progress
  simulateProgress(sessionId, session.issue_id);
}

function simulateProgress(sessionId: string, issueId: string): void {
  const updateSession = useRemediationSessionsStore.getState().updateSession;
  const setStatus = useIssueScoresStore.getState().setRemediationStatus;

  // Move to in_progress after 2 seconds
  setTimeout(() => {
    updateSession(sessionId, { status: 'in_progress' });
    setStatus(issueId, 'in_progress');
  }, 2000);

  // Randomly succeed or fail after 5-8 seconds
  const duration = 5000 + Math.random() * 3000;
  const willSucceed = Math.random() > 0.25; // 75% success rate in demo

  setTimeout(() => {
    const now = new Date().toISOString();
    if (willSucceed) {
      updateSession(sessionId, {
        status: 'completed',
        completed_at: now,
      });
      setStatus(issueId, 'completed');

      useActivityStore.getState().addActivity({
        id: generateId(),
        type: 'remediation-completed' as never,
        entityId: issueId,
        entityType: 'issue',
        summary: 'Auto-fix completed — staged changes ready for review',
        createdAt: now,
      });
    } else {
      updateSession(sessionId, {
        status: 'failed',
        completed_at: now,
        error_message: 'Mock failure: agent encountered an unresolvable conflict in the affected component',
      });
      setStatus(issueId, 'failed');

      useActivityStore.getState().addActivity({
        id: generateId(),
        type: 'remediation-failed' as never,
        entityId: issueId,
        entityType: 'issue',
        summary: 'Auto-fix failed — manual review needed',
        createdAt: now,
      });
    }

    // Process queue after session completes
    processQueue();
  }, duration);
}
