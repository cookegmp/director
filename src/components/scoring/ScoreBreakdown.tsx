import type { ScoreDimensions } from '@/types'
import { getScoreTier, getTierColor } from '@/types'

interface ScoreBreakdownProps {
  scores: ScoreDimensions
  compositeScore: number
}

const DIMENSIONS: { key: keyof ScoreDimensions; label: string; weight: string }[] = [
  { key: 'impact', label: 'Impact', weight: '30%' },
  { key: 'urgency', label: 'Urgency', weight: '25%' },
  { key: 'feasibility', label: 'Feasibility', weight: '25%' },
  { key: 'alignment', label: 'Alignment', weight: '20%' },
]

function ScoreBreakdown({ scores, compositeScore }: ScoreBreakdownProps) {
  const tier = getScoreTier(compositeScore)
  const tierColor = getTierColor(tier)

  return (
    <div className="space-y-6">
      {/* Composite score */}
      <div className="text-center">
        <div className="text-5xl font-light tabular-nums" style={{ color: tierColor }}>
          {Math.round(compositeScore)}
        </div>
        <div className="text-sm text-muted-foreground mt-1 uppercase tracking-wide">
          {tier} priority
        </div>
      </div>

      {/* Dimension bars */}
      <div className="space-y-4">
        {DIMENSIONS.map(({ key, label, weight }) => {
          const score = scores[key]
          const dimTier = getScoreTier(score)
          const color = getTierColor(dimTier)
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-light text-foreground">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{weight}</span>
                  <span className="text-sm tabular-nums" style={{ color }}>
                    {score}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full score-bar-fill"
                  style={
                    {
                      '--score-width': `${score}%`,
                      backgroundColor: color,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScoreBreakdown
