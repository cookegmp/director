import { useNavigate } from 'react-router-dom'
import { X, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useEngagementsStore } from '@/stores/engagements'
import ClientStatusProgression from './ClientStatusProgression'
import { useClientsStore } from '@/stores/clients'
import { ENGAGEMENT_PHASE_LABELS } from '@/types'
import type { Client } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  prospect: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  discovery: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  scaffolding: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  building: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  archived: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
}

interface ClientDetailPanelProps {
  client: Client
  onClose: () => void
}

function ClientDetailPanel({ client, onClose }: ClientDetailPanelProps) {
  const navigate = useNavigate()
  const engagements = useEngagementsStore((s) => s.getEngagementsByClientId(client.id))
  const updateClient = useClientsStore((s) => s.updateClient)

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-light text-foreground">{client.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">{client.industry} &middot; {client.size_range}</p>
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status Progression */}
      <ClientStatusProgression
        currentStatus={client.status}
        onStatusChange={(status) => updateClient(client.id, { status })}
      />

      {/* Contact & Notes */}
      <div className="space-y-2">
        <div>
          <span className="text-xs text-muted-foreground">Primary Contact</span>
          <p className="text-sm text-foreground">{client.primary_contact || '—'}</p>
        </div>
        {client.notes && (
          <div>
            <span className="text-xs text-muted-foreground">Notes</span>
            <p className="text-sm text-foreground/80 line-clamp-4">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Engagements */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Engagements</h3>
        {engagements.length === 0 ? (
          <p className="text-xs text-muted-foreground">No engagements yet.</p>
        ) : (
          <div className="space-y-2">
            {engagements.map((eng) => (
              <div key={eng.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={STATUS_COLORS[eng.phase] ?? ''}>
                    {ENGAGEMENT_PHASE_LABELS[eng.phase]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{eng.status}</span>
                </div>
                <span className="text-xs text-muted-foreground">{eng.start_date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => navigate('/discovery')} className="text-xs">
          View Discovery <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigate('/scaffolding')} className="text-xs">
          View Scaffolding <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigate('/ocai')} className="text-xs">
          View OCAI <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export default ClientDetailPanel
