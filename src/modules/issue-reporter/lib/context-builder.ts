// ============================================================================
// Issue Reporter — Context Builder
// ============================================================================
// Assembles AI context from scaffolding, charter, and existing issues.
// ============================================================================

import { useScaffoldingStore } from '@/stores/scaffolding';
import { useChartersStore } from '@/stores/charters';
import { useIssuesStore } from '@/stores/issues';
import type { AIContext, ExistingIssueRef } from '../types';

export function buildAIContext(projectId: string | null): AIContext {
  const scaffoldingDocs = useScaffoldingStore.getState().documents;
  const charters = useChartersStore.getState().charters;
  const issues = useIssuesStore.getState().issues;

  // Assemble scaffolding context
  const scaffoldingParts = scaffoldingDocs.map(
    (doc) => `## ${doc.title}\n\n${doc.content}`
  );
  const scaffolding = scaffoldingParts.length > 0 ? scaffoldingParts.join('\n\n---\n\n') : null;

  // Get charter execution plan for the relevant project
  let charterExecutionPlan: string | null = null;
  if (projectId) {
    const charter = charters.find((c) => c.id === projectId);
    if (charter) {
      const plan = charter.content;
      charterExecutionPlan = [
        `# ${charter.title}`,
        `\n## Overview\n${plan.projectOverview}`,
        `\n## Objectives\n${plan.objectives.map((o) => `- ${o}`).join('\n')}`,
        `\n## Technical Approach\n${plan.technicalApproach}`,
        `\n## Acceptance Criteria\n${plan.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}`,
        `\n## Execution Plan\n${plan.executionPlan
          .map(
            (p) =>
              `### ${p.phase} (${p.duration})\n${p.tasks.map((t) => `- ${t}`).join('\n')}`
          )
          .join('\n\n')}`,
      ].join('\n');
    }
  }

  // Build existing issues reference
  const relevantIssues = projectId
    ? issues.filter((i) => i.projectId === projectId)
    : issues;

  const existingIssues: ExistingIssueRef[] = relevantIssues.map((issue) => ({
    id: issue.id,
    type: issue.type,
    title: issue.title,
    status: issue.status,
    severity: issue.severity,
    affected_area: null,
    description: issue.description,
  }));

  return { scaffolding, charterExecutionPlan, existingIssues };
}
