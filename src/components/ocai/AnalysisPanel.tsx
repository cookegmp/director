import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOcaiStore } from '@/stores/ocai'
import { generateOcaiQuestions } from '@/lib/openrouter'
import CvfRadarChart from './CvfRadarChart'
import type { OCAIAssessment } from '@/types'

interface AnalysisPanelProps {
  assessment: OCAIAssessment
}

function AnalysisPanel({ assessment }: AnalysisPanelProps) {
  const updateAssessment = useOcaiStore((s) => s.updateAssessment)
  const [analyzing, setAnalyzing] = useState(false)

  const analysis = assessment.analysis as {
    clan?: number
    adhocracy?: number
    hierarchy?: number
    market?: number
    gaps?: string[]
    summary?: string
  }

  const hasAnalysis = analysis.clan !== undefined

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const result = await generateOcaiQuestions('analysis', {
        questions: assessment.questions,
        responses: assessment.responses,
      })
      updateAssessment(assessment.id, { analysis: result, status: 'analyzed' })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {!hasAnalysis && (
        <Button onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Analyzing...</>
          ) : (
            'Analyze Responses'
          )}
        </Button>
      )}

      {hasAnalysis && (
        <>
          <CvfRadarChart
            clan={analysis.clan!}
            adhocracy={analysis.adhocracy!}
            hierarchy={analysis.hierarchy!}
            market={analysis.market!}
          />

          {analysis.summary && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">{analysis.summary}</p>
            </div>
          )}

          {analysis.gaps && analysis.gaps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Gap Analysis</h4>
              <ul className="space-y-2">
                {analysis.gaps.map((gap, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex gap-2">
                    <span className="text-amber-400 shrink-0">•</span>
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AnalysisPanel
