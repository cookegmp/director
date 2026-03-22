import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SESSION_TYPE_LABELS } from '@/types'
import type { DiscoverySession } from '@/types'

interface SessionDetailProps {
  session: DiscoverySession
  onStartInterview: () => void
}

function SessionDetail({ session, onStartInterview }: SessionDetailProps) {
  const canStartInterview = session.status === 'scheduled' || session.status === 'in_progress'

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 space-y-5">
      <div>
        <h2 className="text-lg font-light text-foreground">{session.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{SESSION_TYPE_LABELS[session.session_type]}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-xs text-muted-foreground">Participants</span>
          <p className="text-foreground">{session.participants.join(', ')}</p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Date</span>
          <p className="text-foreground">{new Date(session.session_date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Scaffolding sections affected */}
      {session.scaffolding_sections_affected.length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground">Scaffolding Sections Affected</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {session.scaffolding_sections_affected.map((section) => (
              <Badge key={section} variant="outline" className="text-[10px] bg-primary/5 text-primary/80 border-primary/20">
                {section.replace('tier1_', 'T1: ').replace('tier2_', 'T2: ').replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {session.transcript && (
        <div>
          <span className="text-xs text-muted-foreground">Transcript</span>
          <div className="mt-1 bg-muted/20 rounded-lg p-3 max-h-48 overflow-auto feed-scroll">
            <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
              {session.transcript}
            </pre>
          </div>
        </div>
      )}

      {/* Extracted Data */}
      {Object.keys(session.extracted_data).length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground">Extracted Data</span>
          <div className="mt-1 bg-muted/20 rounded-lg p-3 max-h-48 overflow-auto feed-scroll">
            <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono">
              {JSON.stringify(session.extracted_data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {canStartInterview && (
        <Button onClick={onStartInterview}>
          {session.status === 'in_progress' ? 'Resume Interview' : 'Start Interview'}
        </Button>
      )}
    </div>
  )
}

export default SessionDetail
