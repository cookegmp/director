// ============================================================================
// Issue Reporter — Field Mapper
// ============================================================================
// Maps AI completion response to the issue data model for storage.
// ============================================================================

import { generateId } from '@/lib/utils';
import type { AICompletionResponse, ReportedIssue, IssueReport, BrowserMetadata } from '../types';

export function mapAIResponseToReport(response: AICompletionResponse): IssueReport {
  return {
    classification: response.classification,
    title: response.title,
    description: response.description,
    severity: response.severity,
    steps_to_reproduce: response.steps_to_reproduce,
    expected_behavior: response.expected_behavior,
    actual_behavior: response.actual_behavior,
    desired_outcome: response.desired_outcome,
    affected_area: response.affected_area,
    potential_duplicates: response.potential_duplicates ?? [],
    conversation_summary: response.conversation_summary,
  };
}

export function captureBrowserMetadata(): BrowserMetadata {
  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    devicePixelRatio: window.devicePixelRatio,
    timestamp: new Date().toISOString(),
  };
}

export function mapReportToIssue(
  report: IssueReport,
  options: {
    projectId: string | null;
    screenshot: string | null;
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
    linkedDuplicateId?: string | null;
  }
): ReportedIssue {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    type: report.classification,
    title: report.title,
    description: report.description,
    severity: report.severity,
    status: 'open',
    project_id: options.projectId,
    app_id: null,
    source: 'internal',
    environment: null,
    affected_area: report.affected_area,
    steps_to_reproduce: report.steps_to_reproduce,
    expected_behavior: report.expected_behavior,
    actual_behavior: report.actual_behavior,
    desired_outcome: report.desired_outcome,
    reporter_name: options.userName,
    reporter_email: options.userEmail,
    reporter_user_id: options.userId,
    screenshot: options.screenshot,
    metadata: captureBrowserMetadata(),
    conversation_summary: report.conversation_summary,
    linked_duplicate_id: options.linkedDuplicateId ?? null,
    created_at: now,
    updated_at: now,
  };
}
