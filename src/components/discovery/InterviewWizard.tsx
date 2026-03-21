import { useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDiscoveryStore } from '@/stores/discovery'
import { INTERVIEW_FLOWS } from '@/lib/interview-flows'
import { extractFromResponse } from '@/lib/openrouter'
import type { DiscoverySession } from '@/types'

interface InterviewWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: DiscoverySession
}

function InterviewWizard({ open, onOpenChange, session }: InterviewWizardProps) {
  const updateSession = useDiscoveryStore((s) => s.updateSession)
  const flow = INTERVIEW_FLOWS[session.session_type]

  const [currentStep, setCurrentStep] = useState(0)
  const [response, setResponse] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [turns, setTurns] = useState<{ question: string; answer: string }[]>([])
  const [accumulatedData, setAccumulatedData] = useState<Record<string, unknown>>({})

  const step = flow[currentStep]
  const isLastStep = currentStep === flow.length - 1

  const handleNext = async () => {
    if (!step || !response.trim()) return

    setExtracting(true)
    try {
      const extracted = await extractFromResponse(step, response)
      const newData = { ...accumulatedData, ...extracted }
      const newTurns = [...turns, { question: step.suggested_question, answer: response }]

      setAccumulatedData(newData)
      setTurns(newTurns)

      if (isLastStep) {
        // Complete the session
        const transcript = newTurns
          .map((t) => `Q: ${t.question}\nA: ${t.answer}`)
          .join('\n\n')

        const sectionsAffected = [...new Set(
          flow.flatMap((s) => s.extraction_keys)
            .filter((k) => k in newData)
            .map((k) => {
              if (k.includes('system') || k.includes('tool') || k.includes('integration')) return 'tier1_data_systems'
              if (k.includes('workflow') || k.includes('process') || k.includes('step')) return 'tier1_process_workflow'
              if (k.includes('culture') || k.includes('change') || k.includes('org')) return 'tier1_culture_profile'
              if (k.includes('brand') || k.includes('visual') || k.includes('tone')) return 'tier2_brand_standards'
              return 'tier2_company_context'
            }),
        )]

        updateSession(session.id, {
          status: 'complete',
          transcript,
          extracted_data: newData,
          scaffolding_sections_affected: sectionsAffected,
        })
        onOpenChange(false)
      } else {
        setCurrentStep((s) => s + 1)
        setResponse('')
      }
    } finally {
      setExtracting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
      const prevTurn = turns[currentStep - 1]
      setResponse(prevTurn?.answer ?? '')
    }
  }

  if (!step) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="font-light">
            Interview: {session.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Step {currentStep + 1} of {flow.length}
            </Badge>
            <div className="flex-1 bg-muted/30 rounded-full h-1.5">
              <div
                className="bg-primary rounded-full h-1.5 transition-all"
                style={{ width: `${((currentStep + 1) / flow.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-muted/20 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2">{step.prompt}</p>
            <p className="text-sm text-foreground font-medium">{step.suggested_question}</p>
          </div>

          {/* Response */}
          <div>
            <label className="text-xs text-muted-foreground">Interviewee Response</label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type or paste the response..."
              rows={5}
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none py-2 mt-1"
              autoFocus
              disabled={extracting}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 0 || extracting}
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {extracting && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              <Button
                onClick={handleNext}
                disabled={!response.trim() || extracting}
              >
                {extracting
                  ? 'Extracting...'
                  : isLastStep
                    ? 'Finish Interview'
                    : 'Next'}
                {!extracting && !isLastStep && <ArrowRight className="w-3 h-3 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InterviewWizard
