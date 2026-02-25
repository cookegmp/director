// ============================================================================
// Issue Scoring — Remediation Trigger
// ============================================================================
// Assembles the remediation package and initiates a session.
// In prototype mode, creates a mock session.
// ============================================================================

import { generateId } from '@/lib/utils';
import { useActivityStore } from '@/stores/activity';
import { useIssueScoresStore } from '../stores/issue-scores';
import { useRemediationSessionsStore } from '../stores/remediation-sessions';
import { useRemediationSettingsStore } from '../stores/remediation-settings';
import type { RemediationSession } from '../types';
import type { ReportedIssue } from '@/modules/issue-reporter/types';
import type { ScoringContext } from '../engine/context-assembler';
import { canStartSession } from './session-queue';

export function assembleRemediationPackage(
  issue: ReportedIssue,
  context: ScoringContext
): Record<string, unknown> {
  return {
    bug_report: {
      title: issue.title,
      description: issue.description,
      steps_to_reproduce: issue.steps_to_reproduce,
      expected_behavior: issue.expected_behavior,
      actual_behavior: issue.actual_behavior,
      affected_area: issue.affected_area,
      severity: issue.severity,
    },
    conversation_summary: issue.conversation_summary,
    screenshot: issue.screenshot ? '[screenshot attached]' : null,
    parent_charter: context.charterContent || null,
    scaffolding: context.scaffolding.map((s) => ({ type: s.type, content: s.content })),
    related_issues: context.existingIssues.slice(0, 5).map((i) => ({
      id: i.id,
      type: i.type,
      title: i.title,
      status: i.status,
    })),
  };
}

export function triggerRemediation(
  issueId: string,
  projectId: string,
  environment: 'dsp' | 'development'
): RemediationSession | null {
  const settings = useRemediationSettingsStore.getState().settings;

  if (!canStartSession(settings)) {
    // Queue instead
    useRemediationSessionsStore.getState().addToQueue(issueId);
    return null;
  }

  const sessionId = generateId();
  const now = new Date().toISOString();

  const session: RemediationSession = {
    id: sessionId,
    issue_id: issueId,
    project_id: projectId,
    status: 'triggered',
    environment,
    session_id: null,
    created_at: now,
    started_at: now,
    completed_at: null,
    error_message: null,
  };

  useRemediationSessionsStore.getState().addSession(session);
  useIssueScoresStore.getState().setRemediationStatus(issueId, 'triggered', sessionId);
  useRemediationSessionsStore.getState().removeFromQueue(issueId);

  // Log activity
  useActivityStore.getState().addActivity({
    id: generateId(),
    type: 'remediation-triggered' as never,
    entityId: issueId,
    entityType: 'issue',
    summary: `Auto-fix triggered for issue — building in ${environment}`,
    createdAt: now,
  });

  return session;
}

export function approveRemediation(
  issueId: string,
  projectId: string,
  environment: 'dsp' | 'development'
): RemediationSession | null {
  useIssueScoresStore.getState().setRemediationStatus(issueId, 'approved');

  useActivityStore.getState().addActivity({
    id: generateId(),
    type: 'remediation-approved' as never,
    entityId: issueId,
    entityType: 'issue',
    summary: 'Auto-fix approved — initiating remediation',
    createdAt: new Date().toISOString(),
  });

  return triggerRemediation(issueId, projectId, environment);
}
