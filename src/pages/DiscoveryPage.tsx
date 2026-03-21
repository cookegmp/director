import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClientsStore } from '@/stores/clients'
import { useEngagementsStore } from '@/stores/engagements'
import { useDiscoveryStore } from '@/stores/discovery'
import SessionList from '@/components/discovery/SessionList'
import SessionDetail from '@/components/discovery/SessionDetail'
import NewSessionForm from '@/components/discovery/NewSessionForm'
import InterviewWizard from '@/components/discovery/InterviewWizard'
import type { DiscoverySession } from '@/types'

function DiscoveryPage() {
  const clients = useClientsStore((s) => s.clients)
  const engagements = useEngagementsStore((s) => s.engagements)

  // Default to first client's first engagement
  const defaultEngagement = engagements[0]
  const [selectedEngagementId, setSelectedEngagementId] = useState(defaultEngagement?.id ?? '')
  const [selectedSession, setSelectedSession] = useState<DiscoverySession | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [wizardSession, setWizardSession] = useState<DiscoverySession | null>(null)

  const sessions = useDiscoveryStore((s) => s.getSessionsByEngagementId(selectedEngagementId))

  // Build engagement options with client names
  const engagementOptions = engagements.map((e) => {
    const client = clients.find((c) => c.id === e.client_id)
    return { id: e.id, label: `${client?.name ?? 'Unknown'} — ${e.phase}` }
  })

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

      {wizardSession && (
        <InterviewWizard
          open={!!wizardSession}
          onOpenChange={(open) => {
            if (!open) {
              setWizardSession(null)
              setSelectedSession(null)
            }
          }}
          session={wizardSession}
        />
      )}
    </div>
  )
}

export default DiscoveryPage
