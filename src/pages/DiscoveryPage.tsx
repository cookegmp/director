import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClientsStore } from '@/stores/clients'
import { useEngagementsStore } from '@/stores/engagements'
import { useDiscoveryStore } from '@/stores/discovery'
import SessionList from '@/components/discovery/SessionList'
import SessionDetail from '@/components/discovery/SessionDetail'
import NewSessionForm from '@/components/discovery/NewSessionForm'
import InterviewWizard from '@/components/shared/InterviewWizard'
import { INTERVIEW_FLOWS } from '@/lib/interview-flows'
import { SESSION_TYPE_LABELS } from '@/types'
import type { InterviewStep } from '@/components/shared/InterviewWizard'
import type { DiscoverySession } from '@/types'
import type { FlowStep } from '@/lib/interview-flows'

/** Convert FlowStep[] to InterviewStep[] */
function toInterviewSteps(flow: FlowStep[]): InterviewStep[] {
  return flow.map((s) => ({
    id: s.step_id,
    prompt: s.prompt,
    question: s.suggested_question,
    placeholder: 'Type or dictate the response...',
    required: true,
  }))
}

function DiscoveryPage() {
  const clients = useClientsStore((s) => s.clients)
  const engagements = useEngagementsStore((s) => s.engagements)
  const updateSession = useDiscoveryStore((s) => s.updateSession)

  const defaultEngagement = engagements[0]
  const [selectedEngagementId, setSelectedEngagementId] = useState(defaultEngagement?.id ?? '')
  const [selectedSession, setSelectedSession] = useState<DiscoverySession | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [wizardSession, setWizardSession] = useState<DiscoverySession | null>(null)

  const allSessions = useDiscoveryStore((s) => s.sessions)
  const sessions = useMemo(
    () => allSessions.filter((s) => s.engagement_id === selectedEngagementId),
    [allSessions, selectedEngagementId],
  )

  const engagementOptions = engagements.map((e) => {
    const client = clients.find((c) => c.id === e.client_id)
    return { id: e.id, label: `${client?.name ?? 'Unknown'} — ${e.phase}` }
  })

  const closeWizard = () => {
    setWizardSession(null)
    setSelectedSession(null)
  }

  const handleInterviewComplete = (answers: Record<string, string>) => {
    if (!wizardSession) return

    const flow = INTERVIEW_FLOWS[wizardSession.session_type]
    const transcript = flow
      .map((s) => `Q: ${s.suggested_question}\nA: ${answers[s.step_id] ?? ''}`)
      .filter((line) => !line.endsWith('A: '))
      .join('\n\n')

    updateSession(wizardSession.id, {
      status: 'complete',
      transcript,
      extracted_data: answers,
    })
    closeWizard()
  }

  const handleInterviewSave = (answers: Record<string, string>, _stepIndex: number) => {
    if (!wizardSession) return
    updateSession(wizardSession.id, {
      status: 'in_progress',
      extracted_data: answers,
    })
  }

  // When wizard is active, show it full-page instead of the normal layout
  if (wizardSession) {
    const flow = INTERVIEW_FLOWS[wizardSession.session_type]
    const steps = toInterviewSteps(flow)
    const savedAnswers = (wizardSession.extracted_data ?? {}) as Record<string, string>

    return (
      <InterviewWizard
        title={wizardSession.title}
        subtitle={SESSION_TYPE_LABELS[wizardSession.session_type]}
        steps={steps}
        initialAnswers={savedAnswers}
        onComplete={handleInterviewComplete}
        onSave={handleInterviewSave}
        onClose={closeWizard}
        completeLabel="Finish Interview"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Discovery</h1>
          <p className="text-muted-foreground mt-1">Interview sessions and data extraction.</p>
        </div>
        <Button onClick={() => setShowNewForm(true)} disabled={!selectedEngagementId}>
          <Plus className="w-4 h-4 mr-1" />
          New Session
        </Button>
      </div>

      {/* Engagement selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Engagement:</label>
        <select
          value={selectedEngagementId}
          onChange={(e) => {
            setSelectedEngagementId(e.target.value)
            setSelectedSession(null)
          }}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-1.5 px-1 min-w-[250px]"
        >
          {engagementOptions.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-card">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SessionList
          sessions={sessions}
          selectedId={selectedSession?.id ?? null}
          onSelect={setSelectedSession}
        />

        {selectedSession && (
          <SessionDetail
            session={selectedSession}
            onStartInterview={() => setWizardSession(selectedSession)}
          />
        )}
      </div>

      {selectedEngagementId && (
        <NewSessionForm
          open={showNewForm}
          onOpenChange={setShowNewForm}
          engagementId={selectedEngagementId}
        />
      )}
    </div>
  )
}

export default DiscoveryPage
