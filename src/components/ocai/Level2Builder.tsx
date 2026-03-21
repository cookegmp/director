import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOcaiStore } from '@/stores/ocai'
import { useScaffoldingStore } from '@/stores/scaffolding'
import { generateOcaiQuestions } from '@/lib/openrouter'

interface Level2BuilderProps {
  engagementId: string
}

function Level2Builder({ engagementId }: Level2BuilderProps) {
  const addAssessment = useOcaiStore((s) => s.addAssessment)
  const scaffolding = useScaffoldingStore((s) => s.getPackageByEngagementId(engagementId))

  const [generating, setGenerating] = useState(false)
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([])

  // Parse workflow names from scaffolding process & workflow section
  const processData = scaffolding?.tier1_process_workflow ?? {}
  const workflowNames = Object.keys(processData).filter(
    (k) => k !== 'decision_points' && k !== 'handoff_points',
  )

  const toggleWorkflow = (name: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(name) ? prev.filter((w) => w !== name) : [...prev, name].slice(0, 3),
    )
  }

  const handleGenerate = async () => {
    if (selectedWorkflows.length === 0) return
    setGenerating(true)
    try {
      const result = await generateOcaiQuestions('level2', {
        workflows: selectedWorkflows,
        processData,
      })
      const questions = (result.questions ?? []) as Record<string, unknown>[]
      addAssessment({
        engagement_id: engagementId,
        level: 'workflow_2',
        target_scope: selectedWorkflows.join(', '),
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
      <h3 className="text-lg font-light text-primary">Generate L2 Workflow Assessment</h3>
      {workflowNames.length === 0 ? (
        <p className="text-sm text-muted-foreground">No workflows found in scaffolding. Populate the Process & Workflow section first.</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Select 1–3 workflows:</p>
          <div className="flex flex-wrap gap-2">
            {workflowNames.map((name) => (
              <button
                key={name}
                onClick={() => toggleWorkflow(name)}
                className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                  selectedWorkflows.includes(name)
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}
              >
                {name.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <Button onClick={handleGenerate} disabled={generating || selectedWorkflows.length === 0}>
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Generating...</>
            ) : (
              `Generate for ${selectedWorkflows.length} Workflow${selectedWorkflows.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </>
      )}
    </div>
  )
}

export default Level2Builder
