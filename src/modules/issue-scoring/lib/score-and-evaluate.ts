// ============================================================================
// Issue Scoring — Score & Evaluate Orchestrator
// ============================================================================
// Entry point: scores an issue, stores the result, evaluates thresholds,
// and triggers remediation if appropriate.
// ============================================================================

import { generateId } from '@/lib/utils';
import { useActivityStore } from '@/stores/activity';
import type { ReportedIssue } from '@/modules/issue-reporter/types';
import { useIssueScoresStore } from '../stores/issue-scores';
import { useRemediationSettingsStore } from '../stores/remediation-settings';
import { assembleContext } from '../engine/context-assembler';
import { scoreBug } from '../engine/bug-scorer';
import { scoreFeature } from '../engine/feature-scorer';
import { evaluateThreshold } from '../remediation/threshold-evaluator';
import { triggerRemediation } from '../remediation/remediation-trigger';
import { monitorSession } from '../remediation/remediation-monitor';
import type { IssueScore } from '../types';

export async function scoreAndEvaluate(issue: ReportedIssue): Promise<IssueScore | null> {
  // Issues must have a parent project for scoring context
  if (!issue.project_id) return null;

  const settings = useRemediationSettingsStore.getState().settings;
  const context = assembleContext(issue.project_id);

  let score: IssueScore;

  try {
    if (issue.type === 'bug') {
      score = await scoreBug(issue, context, settings.bug_weights);
    } else {
      score = await scoreFeature(issue, context, settings.feature_weights);
    }
  } catch (err) {
    console.error('Scoring failed:', err);
    return null;
  }

  // Store the score
  useIssueScoresStore.getState().addScore(score);

  // Log scoring activity
  useActivityStore.getState().addActivity({
    id: generateId(),
    type: 'issue-scored' as never,
    entityId: issue.id,
    entityType: 'issue',
    summary: `Issue scored: ${Math.round(score.composite_score)} (${score.tier})`,
    createdAt: new Date().toISOString(),
  });

  // Evaluate remediation threshold (bugs only)
  if (issue.type === 'bug') {
    const action = evaluateThreshold(score, settings);

    if (action === 'auto_trigger') {
      score.remediation_status = 'triggered';
      useIssueScoresStore.getState().updateScore(issue.id, { remediation_status: 'triggered' });
      const session = triggerRemediation(
        issue.id,
        issue.project_id,
        settings.auto_trigger_environment
      );
      if (session) {
        monitorSession(session.id);
      }
    } else if (action === 'recommend_fix') {
      score.remediation_status = 'recommended';
      useIssueScoresStore.getState().updateScore(issue.id, { remediation_status: 'recommended' });

      useActivityStore.getState().addActivity({
        id: generateId(),
        type: 'remediation-recommended' as never,
        entityId: issue.id,
        entityType: 'issue',
        summary: `Auto-fix recommended for "${issue.title}"`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return score;
}
