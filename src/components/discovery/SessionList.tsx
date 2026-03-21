import { Badge } from '@/components/ui/badge'
import { SESSION_TYPE_LABELS } from '@/types'
import type { DiscoverySession, DiscoverySessionType, DiscoverySessionStatus } from '@/types'

const STATUS_COLORS: Record<DiscoverySessionStatus, string> = {
  scheduled: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  complete: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  reviewed: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
}

interface SessionListProps {
  sessions: DiscoverySession[]
  selectedId: string | null
  onSelect: (session: DiscoverySession) => void
}

function SessionList({ sessions, selectedId, onSelect }: SessionListProps) {
  const grouped = sessions.reduce<Record<DiscoverySessionType, DiscoverySession[]>>((acc, s) => {
    if (!acc[s.session_type]) acc[s.session_type] = []
    acc[s.session_type].push(s)
    return acc
  }, {} as Record<DiscoverySessionType, DiscoverySession[]>)

  const types = Object.keys(grouped) as DiscoverySessionType[]

  if (types.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No discovery sessions yet.</p>
  }

  return (
    <div className="space-y-6">
      {types.map((type) => (
        <div key={type}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-foreground">{SESSION_TYPE_LABELS[type]}</h3>
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {grouped[type]!.length}
            </span>
          </div>
          <div className="space-y-2">
            {grouped[type]!.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelect(session)}
                className={`w-full text-left bg-card/30 rounded-lg border p-3 transition-colors ${
                  selectedId === session.id
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border hover:border-border/80 hover:bg-card/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground font-medium">{session.title}</span>
                  <Badge variant="outline" className={STATUS_COLORS[session.status]}>
                    {session.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{session.participants.join(', ')}</span>
                  <span>&middot;</span>
                  <span>{new Date(session.session_date).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default SessionList
