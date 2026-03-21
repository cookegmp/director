import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOcaiStore } from '@/stores/ocai'
import { generateOcaiQuestions } from '@/lib/openrouter'

interface Level1BuilderProps {
  engagementId: string
}

function Level1Builder({ engagementId }: Level1BuilderProps) {
  const addAssessment = useOcaiStore((s) => s.addAssessment)
  const [scope, setScope] = useState('Organization-wide')
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateOcaiQuestions('level1', { scope })
      const questions = (result.questions ?? []) as Record<string, unknown>[]
      addAssessment({
        engagement_id: engagementId,
        level: 'baseline_1',
        target_scope: scope,
        questions,
        responses: [],
        analysis: {},
        status: 'draft',
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-light text-primary">Generate L1 Baseline Assessment</h3>
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm text-muted-foreground">Target Scope</label>
          <input
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground focus:outline-none transition-colors py-2"
          />
        </div>
        <Button onClick={handleGenerate} disabled={generating || !scope.trim()}>
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Generating...</>
          ) : (
            'Generate Questions'
          )}
        </Button>
      </div>
    </div>
  )
}

export default Level1Builder
