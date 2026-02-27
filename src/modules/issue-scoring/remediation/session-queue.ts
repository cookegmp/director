// ============================================================================
// Issue Scoring — Session Queue
// ============================================================================
// Manages concurrent session limits and processes queued issues.
// ============================================================================

import type { RemediationSettings } from '../types'
import { useRemediationSessionsStore } from '../stores/remediation-sessions'
import { useRemediationSettingsStore } from '../stores/remediation-settings'
import { useIssueScoresStore } from '../stores/issue-scores'
import { triggerRemediation } from './remediation-trigger'
import { monitorSession } from './remediation-monitor'

export function canStartSession(settings: RemediationSettings): boolean {
  const activeCount = useRemediationSessionsStore.getState().getActiveSessionsCount()
  return activeCount < settings.max_concurrent_sessions
}

export function processQueue(): void {
  const settings = useRemediationSettingsStore.getState().settings
  if (!settings.enabled) return
  if (!canStartSession(settings)) return

  const queue = useRemediationSessionsStore.getState().getQueuedIssues()
  if (queue.length === 0) return

  const nextIssueId = queue[0]
  if (!nextIssueId) return

  const score = useIssueScoresStore.getState().getScore(nextIssueId)
  if (!score) {
    useRemediationSessionsStore.getState().removeFromQueue(nextIssueId)
    return
  }

  // Use a placeholder project ID derived from the issue's context
  const session = triggerRemediation(nextIssueId, 'unknown', settings.auto_trigger_environment)

  if (session) {
    monitorSession(session.id)
  }
}

export function getQueuePosition(issueId: string): number | null {
  const queue = useRemediationSessionsStore.getState().getQueuedIssues()
  const index = queue.indexOf(issueId)
  return index >= 0 ? index + 1 : null
}
