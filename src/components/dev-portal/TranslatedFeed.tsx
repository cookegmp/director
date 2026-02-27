import { useEffect, useRef, useState } from 'react'
import { Activity, CheckCircle, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react'
import type { TranslatedEntry, TranslatedEntryType } from '@/types'

const TYPE_ICONS: Record<TranslatedEntryType, typeof Activity> = {
  progress: Activity,
  milestone: CheckCircle,
  error: AlertCircle,
  recovery: RefreshCw,
  complete: CheckCircle2,
}

const TYPE_COLORS: Record<TranslatedEntryType, string> = {
  progress: 'text-muted-foreground',
  milestone: 'text-green-400',
  error: 'text-red-400',
  recovery: 'text-amber-400',
  complete: 'text-green-400',
}

interface TranslatedFeedProps {
  entries: TranslatedEntry[]
  onEntryClick?: (rawLineIndex: number) => void
}

function TranslatedFeed({ entries, onEntryClick }: TranslatedFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length, autoScroll])

  // Detect user scroll-up to disable auto-scroll
  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 40
    setAutoScroll(isNearBottom)
  }

  // Group entries by phase
  const grouped: { phase: string; entries: TranslatedEntry[] }[] = []
  let currentPhase = ''
  for (const entry of entries) {
    if (entry.phase !== currentPhase) {
      currentPhase = entry.phase
      grouped.push({ phase: currentPhase, entries: [entry] })
    } else {
      grouped[grouped.length - 1]!.entries.push(entry)
    }
  }

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="h-[400px] overflow-y-auto feed-scroll">
      {entries.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground">Waiting for build output...</p>
        </div>
      ) : (
        <div className="space-y-1 p-1">
          {grouped.map((group, gi) => (
            <div key={gi}>
              {/* Phase divider */}
              <div className="flex items-center gap-2 py-2 mt-1">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                  {group.phase}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {group.entries.map((entry) => {
                const Icon = TYPE_ICONS[entry.type]
                const iconColor = TYPE_COLORS[entry.type]
                const isError = entry.type === 'error'

                return (
                  <div
                    key={entry.id}
                    className={`feed-entry flex items-start gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isError ? 'bg-red-500/10 border-l-2 border-red-500' : 'hover:bg-accent/30'
                    } ${onEntryClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onEntryClick?.(entry.rawLineIndex)}
                  >
                    <div className="mt-0.5 shrink-0">
                      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground/90 font-light leading-relaxed">
                        {entry.summary}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Scroll lock indicator */}
      {!autoScroll && entries.length > 0 && (
        <button
          onClick={() => {
            setAutoScroll(true)
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
          }}
          className="sticky bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs backdrop-blur-sm border border-primary/30 hover:bg-primary/30 transition-colors"
        >
          Scroll to latest
        </button>
      )}
    </div>
  )
}

export default TranslatedFeed
