import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClientsStore } from '@/stores/clients'
import { useEngagementsStore } from '@/stores/engagements'
import EngagementList from '@/components/engagements/EngagementList'
import EngagementDetail from '@/components/engagements/EngagementDetail'
import NewEngagementForm from '@/components/engagements/NewEngagementForm'
import type { Engagement } from '@/types'

function EngagementsPage() {
  const clients = useClientsStore((s) => s.clients)
  const allEngagements = useEngagementsStore((s) => s.engagements)

  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id ?? '')
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)

  const engagements = useMemo(
    () => allEngagements.filter((e) => e.client_id === selectedClientId),
    [allEngagements, selectedClientId],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Engagements</h1>
          <p className="text-muted-foreground mt-1">Manage client engagement phases.</p>
        </div>
        <Button onClick={() => setShowNewForm(true)} disabled={!selectedClientId}>
          <Plus className="w-4 h-4 mr-1" />
          New Engagement
        </Button>
      </div>

      {/* Client selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground">Client:</label>
        <select
          value={selectedClientId}
          onChange={(e) => {
            setSelectedClientId(e.target.value)
            setSelectedEngagement(null)
          }}
          className="bg-transparent border-b border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors py-1.5 px-1 min-w-[200px]"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="bg-card">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementList
          engagements={engagements}
          selectedId={selectedEngagement?.id ?? null}
          onSelect={setSelectedEngagement}
        />

        {selectedEngagement && <EngagementDetail engagement={selectedEngagement} />}
      </div>

      {selectedClientId && (
        <NewEngagementForm
          open={showNewForm}
          onOpenChange={setShowNewForm}
          clientId={selectedClientId}
        />
      )}
    </div>
  )
}

export default EngagementsPage
