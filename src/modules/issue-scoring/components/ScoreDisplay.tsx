// ============================================================================
// Issue Scoring — Score Display
// ============================================================================
// Full dimension breakdown for issue detail view. Shows composite score
// prominently with tier badge and horizontal bars for each dimension.
// ============================================================================

import { Badge } from '@/components/ui/badge'
import type { IssueScore } from '../types'
import {
  getTierClasses,
  getTierLabel,
  BUG_DIMENSION_LABELS,
  FEATURE_DIMENSION_LABELS,
} from '../types'

interface ScoreDisplayProps {
  score: IssueScore
}

const DIMENSION_LABELS: Record<string, string> = {
  ...BUG_DIMENSION_LABELS,
  ...FEATURE_DIMENSION_LABELS,
}

function ScoreDisplay({ score }: ScoreDisplayProps) {
  const tierClasses = getTierClasses(score)
  const tierLabel = getTierLabel(score.tier)

  // Bar color based on individual score value
  const getBarColor = (value: number): string => {
    if (score.score_type === 'bug') {
      if (value >= 80) return 'bg-red-500'
      if (value >= 60) return 'bg-amber-500'
      if (value >= 40) return 'bg-blue-500'
      return 'bg-gray-500'
    }
    // Feature: green scale
    if (value >= 75) return 'bg-green-500'
    if (value >= 50) return 'bg-blue-500'
    if (value >= 25) return 'bg-gray-400'
    return 'bg-gray-500'
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 space-y-5">
      {/* Header: composite + tier */}
      <div className="flex items-center gap-4">
        <div className="text-3xl font-light text-foreground tabular-nums">
          {Math.round(score.composite_score)}
        </div>
        <div className="space-y-1">
          <Badge variant="outline" className={`${tierClasses} text-xs`}>
            {tierLabel}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {score.score_type === 'bug' ? 'Bug Score' : 'Feature Score'}
            {' \u00b7 '}
            {score.scored_by === 'ai' ? 'AI scored' : 'Rules-based'}
          </p>
        </div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-3">
        {score.dimensions.map((dim) => (
          <div key={dim.dimension} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {DIMENSION_LABELS[dim.dimension] ?? dim.dimension}
                <span className="text-muted-foreground/50 ml-1">
                  ({Math.round(dim.weight * 100)}%)
                </span>
              </span>
              <span className="text-xs text-foreground tabular-nums font-medium">
                {Math.round(dim.score)}
              </span>
            </div>
            <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(dim.score)}`}
                style={{ width: `${Math.min(100, dim.score)}%` }}
              />
            </div>
            {dim.explanation && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed pl-0.5">
                {dim.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScoreDisplay
