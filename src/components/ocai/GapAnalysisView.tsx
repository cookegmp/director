import CvfRadarChart from './CvfRadarChart'
import type { OCAIAssessment } from '@/types'

interface GapAnalysisViewProps {
  assessments: OCAIAssessment[]
}

function GapAnalysisView({ assessments }: GapAnalysisViewProps) {
  const analyzed = assessments.filter((a) => a.status === 'analyzed')

  if (analyzed.length < 1) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Need at least one analyzed assessment for gap analysis.</p>
  }

  return (
    <div className="space-y-8">
      <div className={`grid gap-6 ${analyzed.length >= 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
        {analyzed.map((a) => {
          const analysis = a.analysis as { clan?: number; adhocracy?: number; hierarchy?: number; market?: number; gaps?: string[] }
          if (!analysis.clan) return null
          return (
            <div key={a.id} className="bg-card/30 rounded-xl border border-border p-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground text-center">
                {a.target_scope} ({a.level.replace('_', ' ')})
              </h4>
              <CvfRadarChart
                clan={analysis.clan!}
                adhocracy={analysis.adhocracy!}
                hierarchy={analysis.hierarchy!}
                market={analysis.market!}
                size={200}
              />
              {analysis.gaps && (
                <ul className="space-y-1">
                  {analysis.gaps.map((gap, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {gap}</li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GapAnalysisView
