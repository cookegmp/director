import { Badge } from '@/components/ui/badge'
import { ENGAGEMENT_PHASE_LABELS } from '@/types'
import type { Engagement, EngagementPhase } from '@/types'

const PHASE_COLORS: Record<EngagementPhase, string> = {
  discovery: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  scaffolding: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  first_build: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  handoff: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
  subscription: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

interface EngagementListProps {
  engagements: Engagement[]
  selectedId: string | null
  onSelect: (engagement: Engagement) => void
}

function EngagementList({ engagements, selectedId, onSelect }: EngagementListProps) {
  if (engagements.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No engagements for this client.</p>
  }

  return (
    <div className="bg-card/30 rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Phase</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Start Date</th>
            <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Target End</th>
          </tr>
        </thead>
        <tbody>
          {engagements.map((eng) => (
            <tr
              key={eng.id}
              onClick={() => onSelect(eng)}
              className={`border-b border-border/50 cursor-pointer transition-colors ${
                selectedId === eng.id ? 'bg-primary/5' : 'hover:bg-card/50'
              }`}
            >
              <td className="px-4 py-3">
                <Badge variant="outline" className={PHASE_COLORS[eng.phase]}>
                  {ENGAGEMENT_PHASE_LABELS[eng.phase]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <Badge
                  variant="outline"
                  className={
                    eng.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : eng.status === 'paused'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                  }
                >
                  {eng.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{eng.start_date}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{eng.target_end_date ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EngagementList
