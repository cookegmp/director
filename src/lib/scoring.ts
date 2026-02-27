import type { ScoreDimensions } from '@/types'

/**
 * Rules-based scoring engine.
 * Analyzes intake answers across four dimensions: impact, urgency, feasibility, alignment.
 * Each dimension scores 0-100.
 */

const URGENCY_SCORES: Record<string, number> = {
  'Blocking other work': 95,
  'Causing daily friction': 75,
  'Would improve efficiency': 50,
  'Exploring for the future': 25,
}

const HIGH_IMPACT_KEYWORDS = [
  'everyone',
  'all',
  'entire',
  'company-wide',
  'daily',
  'constantly',
  'critical',
  'revenue',
  'customer',
  'safety',
  'compliance',
  'production',
  'floor',
  'delivery',
  'quality',
  'error',
  'waste',
  'downtime',
]

const COMPLEXITY_KEYWORDS = [
  'complex',
  'difficult',
  'legacy',
  'integration',
  'migrate',
  'compliance',
  'security',
  'regulation',
  'multiple systems',
  'erp',
  'database',
]

const ALIGNMENT_KEYWORDS = [
  'automation',
  'efficiency',
  'visibility',
  'real-time',
  'data-driven',
  'reduce cost',
  'improve quality',
  'customer satisfaction',
  'streamline',
  'digital',
  'modernize',
  'ai',
  'machine learning',
]

function countKeywordHits(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()
  return keywords.filter((kw) => lower.includes(kw)).length
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function scoreIdea(answers: Record<string, string>): ScoreDimensions {
  const problem = answers.problem ?? ''
  const impact = answers.impact ?? ''
  const currentState = answers['current-state'] ?? ''
  const desiredOutcome = answers['desired-outcome'] ?? ''
  const constraints = answers.constraints ?? ''
  const urgency = answers.urgency ?? ''

  const allText = `${problem} ${impact} ${currentState} ${desiredOutcome} ${constraints}`

  // --- Impact (0-100) ---
  // Based on breadth of affected parties, frequency, and severity signals
  const impactHits = countKeywordHits(`${problem} ${impact}`, HIGH_IMPACT_KEYWORDS)
  const textLength = impact.length
  let impactScore = 30 + impactHits * 8 + Math.min(textLength / 10, 20)
  // Boost for mentions of multiple teams or high frequency
  if (/daily|hourly|constant|every\s+day/i.test(impact)) impactScore += 10
  if (/team|department|group/i.test(impact)) impactScore += 5

  // --- Urgency (0-100) ---
  // Primarily from the urgency selector, boosted by problem severity signals
  let urgencyScore = URGENCY_SCORES[urgency] ?? 50
  if (/block|stop|halt|prevent|can't proceed/i.test(problem)) urgencyScore += 10
  if (/deadline|due date|time-sensitive/i.test(allText)) urgencyScore += 5

  // --- Feasibility (0-100) ---
  // Inverse complexity: simpler = higher score
  const complexityHits = countKeywordHits(allText, COMPLEXITY_KEYWORDS)
  let feasibilityScore = 80 - complexityHits * 10
  // Constraints reduce feasibility
  if (constraints.length > 100) feasibilityScore -= 10
  if (/limited|budget|resource constraint/i.test(constraints)) feasibilityScore -= 5
  // Clear desired outcome boosts feasibility (well-defined = more feasible)
  if (desiredOutcome.length > 50) feasibilityScore += 10

  // --- Alignment (0-100) ---
  // Match with organizational modernization/efficiency goals
  const alignmentHits = countKeywordHits(allText, ALIGNMENT_KEYWORDS)
  let alignmentScore = 30 + alignmentHits * 12
  // Current state being manual/outdated signals strong alignment with digital transformation
  if (/manual|spreadsheet|paper|outdated|legacy/i.test(currentState)) alignmentScore += 15
  if (/no current solution|nothing|no system/i.test(currentState)) alignmentScore += 10

  return {
    impact: clampScore(impactScore),
    urgency: clampScore(urgencyScore),
    feasibility: clampScore(feasibilityScore),
    alignment: clampScore(alignmentScore),
  }
}
