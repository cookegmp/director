// ============================================================================
// Issue Scoring — Threshold Evaluator
// ============================================================================
// Evaluates a scored bug against configured thresholds to determine
// the remediation tier action.
// ============================================================================

import type { IssueScore, RemediationSettings } from '../types'

export type ThresholdAction = 'file_only' | 'recommend_fix' | 'auto_trigger'

export function evaluateThreshold(
  score: IssueScore,
  settings: RemediationSettings,
): ThresholdAction {
  // Only bugs qualify for remediation
  if (score.score_type !== 'bug') return 'file_only'

  // Master toggle must be enabled
  if (!settings.enabled) return 'file_only'

  const composite = score.composite_score

  // Check confidence floor — if remediation_confidence is below floor, cap at recommend
  const confidenceDimension = score.dimensions.find((d) => d.dimension === 'remediation_confidence')
  const confidenceScore = confidenceDimension?.score ?? 0
  const belowConfidenceFloor = confidenceScore < settings.confidence_floor

  // Auto-trigger tier
  if (composite >= settings.auto_trigger_threshold && !belowConfidenceFloor) {
    return 'auto_trigger'
  }

  // Recommend tier (confidence floor doesn't block recommendations)
  if (composite >= settings.recommend_threshold) {
    return 'recommend_fix'
  }

  return 'file_only'
}
