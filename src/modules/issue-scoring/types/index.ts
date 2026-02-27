// ============================================================================
// Issue Scoring Module — TypeScript Types
// ============================================================================
// Independent type definitions for the issue scoring and auto-remediation
// module. These do NOT import from the main types or issue reporter types.
// ============================================================================

// --- Enums ---

export type BugScoreDimension =
  | 'severity'
  | 'blast_radius'
  | 'reproducibility'
  | 'remediation_confidence'
  | 'recurrence'

export type FeatureScoreDimension = 'demand' | 'alignment' | 'complexity' | 'impact'

export type ScoreDimension = BugScoreDimension | FeatureScoreDimension

export type BugScoreTier = 'critical' | 'high' | 'medium' | 'low'
export type FeatureScoreTier = 'high_value' | 'moderate_value' | 'low_value' | 'minimal_value'
export type ScoreTier = BugScoreTier | FeatureScoreTier

export type ScoreType = 'bug' | 'feature'
export type ScoredBy = 'ai' | 'rules_fallback'

export type RemediationStatus =
  | 'recommended'
  | 'approved'
  | 'triggered'
  | 'in_progress'
  | 'completed'
  | 'failed'

// --- Data Structures ---

export interface DimensionScore {
  dimension: ScoreDimension
  score: number
  weight: number
  weighted_score: number
  explanation: string
}

export interface IssueScore {
  issue_id: string
  score_type: ScoreType
  composite_score: number
  tier: ScoreTier
  dimensions: DimensionScore[]
  remediation_status: RemediationStatus | null
  remediation_session_id: string | null
  scored_at: string
  scored_by: ScoredBy
}

export interface IdeaWeights {
  impact: number
  urgency: number
  feasibility: number
  alignment: number
}

export interface BugWeights {
  severity: number
  blast_radius: number
  reproducibility: number
  remediation_confidence: number
  recurrence: number
}

export interface FeatureWeights {
  demand: number
  alignment: number
  complexity: number
  impact: number
}

export interface RemediationSettings {
  enabled: boolean
  recommend_threshold: number
  auto_trigger_threshold: number
  auto_trigger_environment: 'dsp' | 'development'
  confidence_floor: number
  max_concurrent_sessions: number
  bug_weights: BugWeights
  feature_weights: FeatureWeights

  // Idea scoring settings
  idea_weights: IdeaWeights
  idea_review_threshold: number
  idea_auto_charter_enabled: boolean
  idea_auto_charter_threshold: number

  // Feature scoring settings
  feature_high_value_threshold: number
  feature_auto_prioritize_enabled: boolean
  feature_auto_prioritize_threshold: number
}

export interface RemediationSession {
  id: string
  issue_id: string
  project_id: string
  status: RemediationStatus
  environment: 'dsp' | 'development'
  session_id: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
  error_message: string | null
}

// --- Tier Helpers ---

export function getBugScoreTier(score: number): BugScoreTier {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

export function getFeatureScoreTier(score: number): FeatureScoreTier {
  if (score >= 75) return 'high_value'
  if (score >= 50) return 'moderate_value'
  if (score >= 25) return 'low_value'
  return 'minimal_value'
}

export function getBugTierClasses(tier: BugScoreTier): string {
  switch (tier) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'high':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'medium':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'low':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

export function getFeatureTierClasses(tier: FeatureScoreTier): string {
  switch (tier) {
    case 'high_value':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'moderate_value':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'low_value':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    case 'minimal_value':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

export function getTierClasses(score: IssueScore): string {
  if (score.score_type === 'bug') {
    return getBugTierClasses(score.tier as BugScoreTier)
  }
  return getFeatureTierClasses(score.tier as FeatureScoreTier)
}

export function getTierLabel(tier: ScoreTier): string {
  switch (tier) {
    case 'critical':
      return 'Critical'
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    case 'high_value':
      return 'High Value'
    case 'moderate_value':
      return 'Moderate Value'
    case 'low_value':
      return 'Low Value'
    case 'minimal_value':
      return 'Minimal Value'
  }
}

// --- Default Weights ---

export const DEFAULT_IDEA_WEIGHTS: IdeaWeights = {
  impact: 0.3,
  urgency: 0.25,
  feasibility: 0.25,
  alignment: 0.2,
}

export const DEFAULT_BUG_WEIGHTS: BugWeights = {
  severity: 0.25,
  blast_radius: 0.25,
  reproducibility: 0.2,
  remediation_confidence: 0.2,
  recurrence: 0.1,
}

export const DEFAULT_FEATURE_WEIGHTS: FeatureWeights = {
  demand: 0.3,
  alignment: 0.3,
  complexity: 0.2,
  impact: 0.2,
}

export const DEFAULT_REMEDIATION_SETTINGS: RemediationSettings = {
  enabled: true,
  recommend_threshold: 60,
  auto_trigger_threshold: 80,
  auto_trigger_environment: 'dsp',
  confidence_floor: 40,
  max_concurrent_sessions: 1,
  bug_weights: { ...DEFAULT_BUG_WEIGHTS },
  feature_weights: { ...DEFAULT_FEATURE_WEIGHTS },

  idea_weights: { ...DEFAULT_IDEA_WEIGHTS },
  idea_review_threshold: 60,
  idea_auto_charter_enabled: false,
  idea_auto_charter_threshold: 80,

  feature_high_value_threshold: 75,
  feature_auto_prioritize_enabled: false,
  feature_auto_prioritize_threshold: 85,
}

// --- Dimension Labels ---

export type IdeaScoreDimension = 'impact' | 'urgency' | 'feasibility' | 'alignment'

export const IDEA_DIMENSION_LABELS: Record<IdeaScoreDimension, string> = {
  impact: 'Impact',
  urgency: 'Urgency',
  feasibility: 'Feasibility',
  alignment: 'Alignment',
}

export const BUG_DIMENSION_LABELS: Record<BugScoreDimension, string> = {
  severity: 'Severity',
  blast_radius: 'Blast Radius',
  reproducibility: 'Reproducibility',
  remediation_confidence: 'Remediation Confidence',
  recurrence: 'Recurrence',
}

export const FEATURE_DIMENSION_LABELS: Record<FeatureScoreDimension, string> = {
  demand: 'Demand',
  alignment: 'Alignment',
  complexity: 'Complexity',
  impact: 'Impact',
}
