// ============================================================================
// Issue Scoring — Mock Scorer
// ============================================================================
// Deterministic mock scoring for demo/prototype. Returns pre-built scores
// with realistic explanations based on issue severity and type.
// ============================================================================

import type { ReportedIssue } from '@/modules/issue-reporter/types'
import type { IssueScore, BugWeights, FeatureWeights } from '../types'
import { getBugScoreTier, getFeatureScoreTier } from '../types'
import { buildDimensionScore, calculateComposite, clampScore } from './score-calculator'

export function mockScoreBug(issue: ReportedIssue, weights: BugWeights): IssueScore {
  // Map severity to a base score range for realistic spread
  const baseMap: Record<string, number> = { critical: 88, high: 68, medium: 48, low: 28 }
  const base = baseMap[issue.severity] ?? 50

  // Add deterministic variation from issue ID hash
  const hash = issue.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const jitter = (hash % 15) - 7

  const dimensions = [
    buildDimensionScore(
      'severity',
      base + jitter,
      weights.severity,
      `${issue.severity} severity — ${issue.severity === 'critical' ? 'data integrity or availability impact' : issue.severity === 'high' ? 'significant user workflow disruption' : issue.severity === 'medium' ? 'noticeable but contained impact' : 'minor cosmetic or low-frequency issue'}`,
    ),
    buildDimensionScore(
      'blast_radius',
      base + ((hash * 3) % 20) - 10,
      weights.blast_radius,
      issue.affected_area
        ? `Affected area "${issue.affected_area}" impacts ${base > 60 ? 'core functionality' : 'a contained feature'}`
        : 'Affected area not specified — neutral estimate',
    ),
    buildDimensionScore(
      'reproducibility',
      issue.steps_to_reproduce && issue.steps_to_reproduce.length > 0
        ? clampScore(70 + (hash % 25))
        : clampScore(30 + (hash % 20)),
      weights.reproducibility,
      issue.steps_to_reproduce && issue.steps_to_reproduce.length > 0
        ? `${issue.steps_to_reproduce.length} clear reproduction steps provided`
        : 'No steps to reproduce — harder to verify',
    ),
    buildDimensionScore(
      'remediation_confidence',
      clampScore(45 + (hash % 35)),
      weights.remediation_confidence,
      'Estimated from available project documentation and component isolation',
    ),
    buildDimensionScore(
      'recurrence',
      clampScore(20 + (hash % 40)),
      weights.recurrence,
      'Checked against existing issue history for similar reports',
    ),
  ]

  const composite = calculateComposite(dimensions)

  return {
    issue_id: issue.id,
    score_type: 'bug',
    composite_score: clampScore(composite),
    tier: getBugScoreTier(composite),
    dimensions,
    remediation_status: null,
    remediation_session_id: null,
    scored_at: new Date().toISOString(),
    scored_by: 'rules_fallback',
  }
}

export function mockScoreFeature(issue: ReportedIssue, weights: FeatureWeights): IssueScore {
  const hash = issue.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const base = 40 + (hash % 40)

  const dimensions = [
    buildDimensionScore(
      'demand',
      clampScore(base + (hash % 20)),
      weights.demand,
      'Estimated from description signals and existing similar requests',
    ),
    buildDimensionScore(
      'alignment',
      clampScore(base + ((hash * 2) % 25) - 5),
      weights.alignment,
      'Evaluated against project charter objectives',
    ),
    buildDimensionScore(
      'complexity',
      clampScore(50 + (hash % 30)),
      weights.complexity,
      'Inverse score — higher means simpler implementation',
    ),
    buildDimensionScore(
      'impact',
      clampScore(base + ((hash * 5) % 20) - 8),
      weights.impact,
      'Estimated workflow improvement from desired outcome description',
    ),
  ]

  const composite = calculateComposite(dimensions)

  return {
    issue_id: issue.id,
    score_type: 'feature',
    composite_score: clampScore(composite),
    tier: getFeatureScoreTier(composite),
    dimensions,
    remediation_status: null,
    remediation_session_id: null,
    scored_at: new Date().toISOString(),
    scored_by: 'rules_fallback',
  }
}
