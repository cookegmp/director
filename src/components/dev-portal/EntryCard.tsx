import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Check,
  Settings,
  Server,
  Code,
  Globe,
  Sparkles,
  Hexagon,
  Cpu,
} from 'lucide-react'
import GradientButton from '@/components/shared/GradientButton'
import DictationButton from '@/components/DictationButton'
import SegmentedToggle from '@/components/shared/SegmentedToggle'
import { useDevSettingsStore } from '@/stores/dev-settings'
import type { Environment, Model } from '@/stores/dev-settings'
import type { TranslatedEntry, TranslatedEntryType, AgentSessionStatus } from '@/types'

const ENV_OPTIONS = [
  { value: 'dsp', label: 'DSP', icon: Server },
  { value: 'development', label: 'Dev', icon: Code },
  { value: 'production', label: 'Prod', icon: Globe },
] as const

const MODEL_OPTIONS = [
  { value: 'claude', label: 'Claude', icon: Sparkles },
  { value: 'gemini', label: 'Gemini', icon: Hexagon },
  { value: 'codex', label: 'Codex', icon: Cpu },
] as const

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

function getSuggestions(
  entryType: TranslatedEntryType | undefined,
  sessionStatus: AgentSessionStatus | undefined,
): string[] {
  if (sessionStatus === 'paused') {
    return ['Resume building', "Show me what's done so far", 'Change the approach']
  }
  if (sessionStatus === 'complete') {
    return ['Run the tests', 'Show me a summary', 'Deploy it']
  }
  if (sessionStatus === 'error') {
    return ['What went wrong?', 'Try a different approach', 'Show the error details']
  }
  if (sessionStatus === 'connected' || !entryType) {
    return [
      'Start with the database schema',
      'Begin with the UI components',
      'Set up the project structure first',
    ]
  }

  // Building — vary by current entry type
  switch (entryType) {
    case 'error':
      return [
        'What went wrong?',
        'Try a different approach',
        'Show the error details',
        'Skip and continue',
      ]
    case 'milestone':
      return ['Looks good continue', 'Let me review this first', 'Can you explain what you built?']
    case 'recovery':
      return ['Good fix keep going', "That's not right try again"]
    default:
      return ["What's the current status?", 'Skip this step', 'Show me the code']
  }
}

interface EntryCardProps {
  entries: TranslatedEntry[]
  onEntryClick?: (rawLineIndex: number) => void
  onSendMessage?: (message: string) => void
  sessionStatus?: AgentSessionStatus
}

const DOT_WINDOW_SIZE = 30

function EntryCard({ entries, onEntryClick, onSendMessage, sessionStatus }: EntryCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userNavigated, setUserNavigated] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [selectedChip, setSelectedChip] = useState<string | null>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const dictationBaseRef = useRef('')
  const settingsRef = useRef<HTMLDivElement>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { environment, model, setEnvironment, setModel } = useDevSettingsStore()

  // Close settings popover on outside click
  useEffect(() => {
    if (!settingsOpen) return
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [settingsOpen])

  // Auto-advance to latest entry when new entries arrive (unless user navigated away)
  const autoIndex = !userNavigated && entries.length > 0 ? entries.length - 1 : currentIndex
  if (autoIndex !== currentIndex) {
    setCurrentIndex(autoIndex)
  }

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      // If user navigated to the latest entry, resume auto-advance
      if (index === entries.length - 1) {
        setUserNavigated(false)
      } else {
        setUserNavigated(true)
      }
    },
    [entries.length],
  )

  const goBack = useCallback(() => {
    if (currentIndex > 0) goTo(currentIndex - 1)
  }, [currentIndex, goTo])

  const goForward = useCallback(() => {
    if (currentIndex < entries.length - 1) goTo(currentIndex + 1)
  }, [currentIndex, entries.length, goTo])

  // Keyboard navigation (disabled when chat input is focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (chatInputRef.current === document.activeElement) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goBack()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goForward()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goBack, goForward])

  const handleSendMessage = useCallback(() => {
    const trimmed = chatMessage.trim()
    if (!trimmed || !onSendMessage) return
    onSendMessage(trimmed)
    setChatMessage('')
    setSelectedChip(null)
  }, [chatMessage, onSendMessage])

  const entry = entries[currentIndex]

  const suggestions = useMemo(
    () => getSuggestions(entry?.type, sessionStatus),
    [entry?.type, sessionStatus],
  )

  const handleChipClick = useCallback((chip: string) => {
    setChatMessage(chip)
    setSelectedChip(chip)
  }, [])

  // Sliding window for dots when entries > DOT_WINDOW_SIZE
  const dotRange = useMemo(() => {
    const total = entries.length
    if (total <= DOT_WINDOW_SIZE) {
      return { start: 0, end: total }
    }
    const half = Math.floor(DOT_WINDOW_SIZE / 2)
    let start = currentIndex - half
    let end = currentIndex + half
    if (start < 0) {
      start = 0
      end = DOT_WINDOW_SIZE
    }
    if (end > total) {
      end = total
      start = total - DOT_WINDOW_SIZE
    }
    return { start, end }
  }, [entries.length, currentIndex])

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="relative bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-10">
        {/* Settings popover trigger */}
        <div ref={settingsRef} className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setSettingsOpen((o) => !o)}
            className={`p-1.5 rounded-lg transition-colors ${
              settingsOpen
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40'
            }`}
            aria-label="Dev settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          {settingsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-card/90 backdrop-blur-md border border-border shadow-lg [border-radius:8px] p-4 flex flex-col items-stretch gap-3">
              <SegmentedToggle
                label="Environment"
                options={[...ENV_OPTIONS]}
                value={environment}
                onChange={(v) => setEnvironment(v as Environment)}
              />
              <SegmentedToggle
                label="Model"
                options={[...MODEL_OPTIONS]}
                value={model}
                onChange={(v) => setModel(v as Model)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Waiting for build output...</p>
        </div>
        {onSendMessage && (
          <div className="pt-6 border-t border-border">
            <textarea
              ref={chatInputRef}
              value={chatMessage}
              onChange={(e) => {
                setChatMessage(e.target.value)
                setSelectedChip(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.metaKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Send a message to the agent..."
              rows={2}
              className="w-full bg-transparent border-b-2 border-border focus:border-primary text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none py-3"
            />
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {suggestions.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                      selectedChip === chip
                        ? 'border-primary text-primary'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 mt-6">
              <GradientButton onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                Send
                <Check className="w-4 h-4" />
              </GradientButton>
              <span className="text-sm text-muted-foreground">
                press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘+Enter</kbd>
              </span>
              <div className="ml-auto">
                <DictationButton
                  onResult={(text) => {
                    const committed = dictationBaseRef.current + text
                    dictationBaseRef.current = committed
                    setChatMessage(committed)
                    setSelectedChip(null)
                  }}
                  onInterim={(text) => {
                    if (text) setChatMessage(dictationBaseRef.current + text)
                  }}
                  onListeningChange={(listening) => {
                    if (listening) dictationBaseRef.current = chatMessage
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const Icon = entry ? TYPE_ICONS[entry.type] : Activity
  const iconColor = entry ? TYPE_COLORS[entry.type] : 'text-muted-foreground'
  const isError = entry?.type === 'error'
  const showFadeLeft = entries.length > DOT_WINDOW_SIZE && dotRange.start > 0
  const showFadeRight = entries.length > DOT_WINDOW_SIZE && dotRange.end < entries.length

  return (
    <div className="relative bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-10">
      {/* Settings popover trigger */}
      <div ref={settingsRef} className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className={`p-1.5 rounded-lg transition-colors ${
            settingsOpen
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40'
          }`}
          aria-label="Dev settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        {settingsOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-card/90 backdrop-blur-md border border-border shadow-lg [border-radius:8px] p-4 flex flex-col items-stretch gap-3">
            <SegmentedToggle
              label="Environment"
              options={[...ENV_OPTIONS]}
              value={environment}
              onChange={(v) => setEnvironment(v as Environment)}
            />
            <SegmentedToggle
              label="Model"
              options={[...MODEL_OPTIONS]}
              value={model}
              onChange={(v) => setModel(v as Model)}
            />
          </div>
        )}
      </div>

      {/* Dot navigation + arrows */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {/* Back arrow */}
        {currentIndex > 0 ? (
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Dots */}
        <div className="flex items-center gap-1.5 relative">
          {showFadeLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-card/80 to-transparent z-10 pointer-events-none" />
          )}
          {Array.from({ length: dotRange.end - dotRange.start }, (_, di) => {
            const i = dotRange.start + di
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < currentIndex
                    ? 'bg-primary'
                    : i === currentIndex
                      ? 'bg-primary ring-2 ring-primary/30'
                      : 'bg-muted'
                }`}
                aria-label={`Entry ${i + 1}`}
              />
            )
          })}
          {showFadeRight && (
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-card/80 to-transparent z-10 pointer-events-none" />
          )}
        </div>

        {/* Forward arrow */}
        {currentIndex < entries.length - 1 ? (
          <button
            onClick={goForward}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-4" />
        )}
      </div>

      {/* Current entry display */}
      {entry && (
        <div
          className={`${
            isError ? 'bg-red-500/10 rounded-[1rem] p-4 border-l-2 border-red-500' : ''
          } ${onEntryClick ? 'cursor-pointer' : ''}`}
          onClick={() => onEntryClick?.(entry.rawLineIndex)}
        >
          {/* Phase label */}
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {entry.phase}
          </p>

          {/* Type icon */}
          <div className="mb-3">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>

          {/* Summary */}
          <p className="text-xl sm:text-2xl font-light text-foreground leading-relaxed">
            {entry.summary}
          </p>

          {/* Timestamp */}
          <p className="text-sm text-muted-foreground mt-3">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Entry counter */}
      <div className="mt-6 text-center">
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} of {entries.length}
        </span>
      </div>

      {/* Chat input */}
      {onSendMessage && (
        <div className="mt-6 pt-6 border-t border-border">
          <textarea
            ref={chatInputRef}
            value={chatMessage}
            onChange={(e) => {
              setChatMessage(e.target.value)
              setSelectedChip(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Send a message to the agent..."
            rows={2}
            className="w-full bg-transparent border-b-2 border-border focus:border-primary text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none py-3"
          />
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {suggestions.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                    selectedChip === chip
                      ? 'border-primary text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-6">
            <GradientButton onClick={handleSendMessage} disabled={!chatMessage.trim()}>
              Send
              <Check className="w-4 h-4" />
            </GradientButton>
            <span className="text-sm text-muted-foreground">
              press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">⌘+Enter</kbd>
            </span>
            <div className="ml-auto">
              <DictationButton
                onResult={(text) => {
                  const committed = dictationBaseRef.current + text
                  dictationBaseRef.current = committed
                  setChatMessage(committed)
                  setSelectedChip(null)
                }}
                onInterim={(text) => {
                  if (text) setChatMessage(dictationBaseRef.current + text)
                }}
                onListeningChange={(listening) => {
                  if (listening) dictationBaseRef.current = chatMessage
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EntryCard
