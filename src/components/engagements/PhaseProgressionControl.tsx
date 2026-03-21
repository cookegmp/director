import { Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ENGAGEMENT_PHASE_ORDER, ENGAGEMENT_PHASE_LABELS } from '@/types'
import type { EngagementPhase } from '@/types'

interface PhaseProgressionControlProps {
  currentPhase: EngagementPhase
  onPhaseChange: (phase: EngagementPhase) => void
}

function PhaseProgressionControl({ currentPhase, onPhaseChange }: PhaseProgressionControlProps) {
  const currentIndex = ENGAGEMENT_PHASE_ORDER.indexOf(currentPhase)
  const canAdvance = currentIndex < ENGAGEMENT_PHASE_ORDER.length - 1
  const canRevert = currentIndex > 0

  const handleAdvance = () => {
    if (!canAdvance) return
    const nextPhase = ENGAGEMENT_PHASE_ORDER[currentIndex + 1]!
    if (window.confirm(`Advance phase to "${ENGAGEMENT_PHASE_LABELS[nextPhase]}"?`)) {
      onPhaseChange(nextPhase)
    }
  }

  const handleRevert = () => {
    if (!canRevert) return
    const prevPhase = ENGAGEMENT_PHASE_ORDER[currentIndex - 1]!
    if (window.confirm(`Revert phase to "${ENGAGEMENT_PHASE_LABELS[prevPhase]}"?`)) {
      onPhaseChange(prevPhase)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        {ENGAGEMENT_PHASE_ORDER.map((phase, i) => {
          const isPast = i < currentIndex
          const isCurrent = phase === currentPhase

          return (
            <div key={phase} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium shrink-0 ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isPast ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < ENGAGEMENT_PHASE_ORDER.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${isPast ? 'bg-primary/30' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between px-1">
        {ENGAGEMENT_PHASE_ORDER.map((phase) => (
          <span
            key={phase}
            className={`text-[10px] ${
              phase === currentPhase ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}
          >
            {ENGAGEMENT_PHASE_LABELS[phase]}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" variant="ghost" onClick={handleRevert} disabled={!canRevert} className="text-xs">
          <ChevronLeft className="w-3 h-3 mr-1" /> Revert
        </Button>
        <Button size="sm" onClick={handleAdvance} disabled={!canAdvance} className="text-xs">
          Advance <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  )
}

export default PhaseProgressionControl
