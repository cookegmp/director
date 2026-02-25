// ============================================================================
// Issue Scoring — Context Assembler
// ============================================================================
// Gathers scoring context from existing stores: charter, scaffolding,
// and existing issues for the parent project.
// ============================================================================

import { useChartersStore } from '@/stores/charters';
import { useScaffoldingStore } from '@/stores/scaffolding';
import { useIssuesStore } from '@/stores/issues';
import { useReportedIssuesStore } from '@/modules/issue-reporter/stores/issues';
import type { Charter, Issue, ScaffoldingDocument } from '@/types';
import type { ReportedIssue } from '@/modules/issue-reporter/types';

export interface ScoringContext {
  charter: Charter | null;
  charterContent: string;
  scaffolding: ScaffoldingDocument[];
  existingIssues: Issue[];
  reportedIssues: ReportedIssue[];
}

export function assembleContext(projectId: string | null): ScoringContext {
  const empty: ScoringContext = {
    charter: null,
    charterContent: '',
    scaffolding: [],
    existingIssues: [],
    reportedIssues: [],
  };

  if (!projectId) return empty;

  const charter = useChartersStore.getState().getCharter(projectId) ?? null;
  const scaffolding = useScaffoldingStore.getState().documents;
  const allIssues = useIssuesStore.getState().issues;
  const reportedIssues = useReportedIssuesStore.getState().getIssuesByProject(projectId);

  const existingIssues = allIssues.filter((i) => i.projectId === projectId);

  let charterContent = '';
  if (charter) {
    const c = charter.content;
    charterContent = [
      `## Project Overview\n${c.projectOverview}`,
      `## Objectives\n${c.objectives.map((o) => `- ${o}`).join('\n')}`,
      `## Technical Approach\n${c.technicalApproach}`,
      `## Acceptance Criteria\n${c.acceptanceCriteria.map((a) => `- ${a}`).join('\n')}`,
      `## Execution Plan\n${c.executionPlan.map((p) => `### ${p.phase}\n${p.tasks.map((t) => `- ${t}`).join('\n')}`).join('\n\n')}`,
    ].join('\n\n');
  }

  return {
    charter,
    charterContent,
    scaffolding,
    existingIssues,
    reportedIssues,
  };
}
