import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Lightbulb,
  FileText,
  Bug,
  Play,
  Pause,
  Square,
  CheckCircle,
  Rocket,
  TrendingUp,
  Target,
  Wrench,
  Zap,
  XCircle,
  Clock,
} from 'lucide-react'
import useIdeaTimeline from '@/hooks/useIdeaTimeline'
import type { Idea, TimelineEvent, TimelineEventCategory } from '@/types'

const CATEGORY_COLORS: Record<TimelineEventCategory, string> = {
  creation: 'bg-blue-500',
  scoring: 'bg-blue-400',
  charter: 'bg-purple-500',
  development: 'bg-teal-500',
  production: 'bg-green-500',
  issue: 'bg-orange-500',
}

const ACTIVITY_ICONS: Record<string, typeof Lightbulb> = {
  'idea-created': Lightbulb,
  'idea-scored': Lightbulb,
  'charter-generated': FileText,
  'issue-filed': Bug,
  'issue-scored': Target,
  'status-changed': TrendingUp,
  'build-started': Play,
  'build-paused': Pause,
  'build-stopped': Square,
  'build-complete': CheckCircle,
  'moved-to-production': Rocket,
  'remediation-recommended': Wrench,
  'remediation-approved': Zap,
  'remediation-triggered': Zap,
  'remediation-completed': CheckCircle,
  'remediation-failed': XCircle,
}

function formatTimelineDate(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTimelineTime(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getDurationLabel(events: TimelineEvent[]): string {
  if (events.length === 0) return ''
  const first = new Date(events[0].timestamp).getTime()
  const last = new Date(events[events.length - 1].timestamp).getTime()
  const diffDays = Math.round((last - first) / 86400000)
  const dayLabel = diffDays === 0 ? 'same day' : diffDays === 1 ? '1 day' : `${diffDays} days`
  return `${events.length} event${events.length === 1 ? '' : 's'} over ${dayLabel}`
}

interface IdeaTimelineDialogProps {
  idea: Idea
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TimelineEntry({ event }: { event: TimelineEvent }) {
  const Icon = (event.activityType && ACTIVITY_ICONS[event.activityType]) || Clock

  return (
    <div className="flex gap-3 relative">
      {/* Dot — sits on top of the continuous line */}
      <div className="flex items-start pt-1.5 w-3 shrink-0 justify-center">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-background ${CATEGORY_COLORS[event.category]}`} />
      </div>

      {/* Content */}
      <div className="pb-5 min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">
            {formatTimelineDate(event.timestamp)} at {formatTimelineTime(event.timestamp)}
          </span>
        </div>
        <p className="text-sm text-foreground font-light leading-relaxed">{event.title}</p>
        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
        )}
      </div>
    </div>
  )
}

function IdeaTimelineDialog({ idea, open, onOpenChange }: IdeaTimelineDialogProps) {
  const events = useIdeaTimeline(idea)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-light text-base">History</DialogTitle>
          <DialogDescription className="truncate">{idea.title}</DialogDescription>
        </DialogHeader>

        {events.length > 0 && (
          <p className="text-xs text-muted-foreground">{getDurationLabel(events)}</p>
        )}

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No history events recorded yet.</p>
          ) : (
            <div className="relative pt-1">
              {/* Continuous vertical line behind all dots */}
              <div className="absolute left-[5px] top-4 bottom-5 w-px bg-border" />
              {events.map((event) => (
                <TimelineEntry key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default IdeaTimelineDialog
