// ============================================================================
// Issue Scoring — Score Calculator
// ============================================================================
// Shared utilities for weighted average calculation and tier assignment.
// ============================================================================

import type { DimensionScore } from '../types'

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function calculateComposite(dimensions: DimensionScore[]): number {
  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0)
  if (totalWeight === 0) return 0
  const weightedSum = dimensions.reduce((sum, d) => sum + d.weighted_score, 0)
  return clampScore(weightedSum / totalWeight)
}

export function buildDimensionScore(
  dimension: string,
  score: number,
  weight: number,
  explanation: string,
): DimensionScore {
  const clamped = clampScore(score)
  return {
    dimension: dimension as DimensionScore['dimension'],
    score: clamped,
    weight,
    weighted_score: clamped * weight,
    explanation,
  }
}
