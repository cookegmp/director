import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useOcaiStore } from '@/stores/ocai'
import type { OCAIAssessment } from '@/types'

interface ResponseCollectionProps {
  assessment: OCAIAssessment
}

function ResponseCollection({ assessment }: ResponseCollectionProps) {
  const updateAssessment = useOcaiStore((s) => s.updateAssessment)
  const [responses, setResponses] = useState<Record<string, number>>(
    Object.fromEntries(
      (assessment.responses as { question_id: string; score: number }[]).map((r) => [r.question_id, r.score]),
    ),
  )

  const questions = assessment.questions as { id: string; text: string }[]

  const handleSave = () => {
    const responseArray = Object.entries(responses).map(([qId, score]) => ({
      question_id: qId,
      respondent_group: 'staff',
      score,
    }))
    updateAssessment(assessment.id, { responses: responseArray, status: 'collecting' })
  }

  const handleComplete = () => {
    const responseArray = Object.entries(responses).map(([qId, score]) => ({
      question_id: qId,
      respondent_group: 'staff',
      score,
    }))
    updateAssessment(assessment.id, { responses: responseArray, status: 'complete' })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Response Collection</h3>
      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.id} className="bg-card/30 rounded-lg border border-border p-3">
            <p className="text-sm text-foreground mb-2">{q.text}</p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={responses[q.id] ?? 50}
                onChange={(e) => setResponses({ ...responses, [q.id]: parseInt(e.target.value) })}
                className="flex-1 accent-[hsl(38,92%,50%)]"
              />
              <span className="text-sm text-foreground w-10 text-right">{responses[q.id] ?? 50}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleSave}>Save Responses</Button>
        <Button variant="ghost" onClick={handleComplete}>Mark Complete</Button>
      </div>
    </div>
  )
}

export default ResponseCollection
