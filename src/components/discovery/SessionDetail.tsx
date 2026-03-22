import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SESSION_TYPE_LABELS } from '@/types'
import type { DiscoverySession } from '@/types'

interface SessionDetailProps {
  session: DiscoverySession
  onStartInterview: () => void
  presenting?: boolean
}

function SessionDetail({ session, onStartInterview, presenting = false }: SessionDetailProps) {
  const canStartInterview = session.status === 'scheduled' || session.status === 'in_progress'

  return (
    <div className={`bg-card/50 backdrop-blur-sm border border-border rounded-xl ${presenting ? 'p-10 space-y-6' : 'p-6 space-y-5'}`}>
      <div>
        <h2 className={`font-light text-foreground ${presenting ? 'text-3xl' : 'text-lg'}`}>{session.title}</h2>
        <p className={`text-muted-foreground mt-1 ${presenting ? 'text-lg' : 'text-sm'}`}>{SESSION_TYPE_LABELS[session.session_type]}</p>
      </div>

      <div className={`grid grid-cols-2 gap-4 ${presenting ? 'text-lg' : 'text-sm'}`}>
        <div>
          <span className={`text-muted-foreground ${presenting ? 'text-base' : 'text-xs'}`}>Participants</span>
          <p className="text-foreground">{session.participants.join(', ')}</p>
        </div>
        <div>
          <span className={`text-muted-foreground ${presenting ? 'text-base' : 'text-xs'}`}>Date</span>
          <p className="text-foreground">{new Date(session.session_date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Scaffolding sections affected — hidden in presentation mode */}
      {!presenting && session.scaffolding_sections_affected.length > 0 && (
        <div>
          <span className={`text-muted-foreground ${presenting ? 'text-base' : 'text-xs'}`}>Scaffolding Sections Affected</span>
          <div className={`flex flex-wrap mt-1 ${presenting ? 'gap-2' : 'gap-1.5'}`}>
            {session.scaffolding_sections_affected.map((section) => (
              <Badge key={section} variant="outline" className={`bg-primary/5 text-primary/80 border-primary/20 ${presenting ? 'text-sm' : 'text-[10px]'}`}>
                {section.replace('tier1_', 'T1: ').replace('tier2_', 'T2: ').replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {session.transcript && (
        <div className={presenting ? 'flex-1' : ''}>
          <span className={`text-muted-foreground ${presenting ? 'text-base' : 'text-xs'}`}>Transcript</span>
          <div className={`mt-1 bg-muted/20 rounded-lg overflow-auto feed-scroll ${presenting ? 'p-5 max-h-[60vh]' : 'p-3 max-h-48'}`}>
            <pre className={`text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed ${presenting ? 'text-base' : 'text-xs'}`}>
              {session.transcript}
            </pre>
          </div>
        </div>
      )}

      {/* Extracted Data — hidden in presentation mode */}
      {!presenting && Object.keys(session.extracted_data).length > 0 && (
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
