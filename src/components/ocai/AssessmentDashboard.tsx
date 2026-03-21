import { Badge } from '@/components/ui/badge'
import { OCAI_LEVEL_LABELS } from '@/types'
import type { OCAIAssessment, OCAIStatus } from '@/types'

const STATUS_COLORS: Record<OCAIStatus, string> = {
  draft: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  deployed: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  collecting: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  complete: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  analyzed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

interface AssessmentDashboardProps {
  assessments: OCAIAssessment[]
  onSelect: (assessment: OCAIAssessment) => void
  selectedId: string | null
}

function AssessmentDashboard({ assessments, onSelect, selectedId }: AssessmentDashboardProps) {
  const grouped = assessments.reduce<Record<string, OCAIAssessment[]>>((acc, a) => {
    const key = a.level
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  if (assessments.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No assessments for this engagement.</p>
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([level, items]) => (
        <div key={level}>
          <h3 className="text-sm font-medium text-foreground mb-3">
            {OCAI_LEVEL_LABELS[level as keyof typeof OCAI_LEVEL_LABELS] ?? level}
          </h3>
          <div className="space-y-2">
            {items.map((assessment) => (
              <button
                key={assessment.id}
                onClick={() => onSelect(assessment)}
                className={`w-full text-left bg-card/30 rounded-lg border p-3 transition-colors ${
                  selectedId === assessment.id
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border hover:bg-card/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{assessment.target_scope}</span>
                  <Badge variant="outline" className={STATUS_COLORS[assessment.status]}>
                    {assessment.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span>{assessment.questions.length} questions</span>
                  <span>&middot;</span>
                  <span>{assessment.responses.length} responses</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default AssessmentDashboard
