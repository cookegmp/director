import { useState } from 'react'
import { Play, Pause, Square, RotateCw, Wifi, WifiOff } from 'lucide-react'
import type { AgentSessionStatus } from '@/types'

interface AgentControlBarProps {
  status: AgentSessionStatus
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onConnect: () => void
}

const STATUS_CONFIG: Record<AgentSessionStatus, { label: string; color: string; pulse: boolean }> =
  {
    connecting: { label: 'Connecting', color: 'bg-[hsl(var(--queued))]', pulse: true },
    connected: { label: 'Connected', color: 'bg-[hsl(var(--queued))]', pulse: false },
    building: { label: 'Building', color: 'bg-[hsl(var(--active))]', pulse: true },
    paused: { label: 'Paused', color: 'bg-amber-400', pulse: false },
    complete: { label: 'Complete', color: 'bg-[hsl(var(--completed))]', pulse: false },
    error: { label: 'Error', color: 'bg-[hsl(var(--error))]', pulse: false },
    stopped: { label: 'Stopped', color: 'bg-[hsl(var(--idle))]', pulse: false },
  }

function AgentControlBar({
  status,
  onStart,
  onPause,
  onResume,
  onStop,
  onConnect,
}: AgentControlBarProps) {
  const [confirmStop, setConfirmStop] = useState(false)
  const config = STATUS_CONFIG[status]

  const isDisconnected = status === 'stopped' || status === 'error'
  const canStart = status === 'connected'
  const canPause = status === 'building'
  const canResume = status === 'paused'
  const canStop = status === 'building' || status === 'paused'

  const handleStop = () => {
    if (confirmStop) {
      onStop()
      setConfirmStop(false)
    } else {
      setConfirmStop(true)
      setTimeout(() => setConfirmStop(false), 3000)
    }
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border px-5 py-3 flex items-center justify-between">
      {/* Status indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${config.color} ${config.pulse ? 'pulse-dot' : ''}`}
          />
          <span className="text-sm text-foreground font-light">{config.label}</span>
        </div>
        {(status === 'building' || status === 'connecting') && (
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
        {isDisconnected && (
          <div className="flex items-center gap-1">
            <WifiOff className="w-3 h-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {isDisconnected && (
          <button
            onClick={onConnect}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            Reconnect
          </button>
        )}

        {canStart && (
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full gradient-button text-white text-xs font-medium active:scale-95 transition-transform"
          >
            <Play className="w-3 h-3" />
            Start Build
          </button>
        )}

        {canPause && (
          <button
            onClick={onPause}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border text-xs text-foreground hover:border-amber-400/50 transition-colors"
          >
            <Pause className="w-3 h-3" />
            Pause
          </button>
        )}

        {canResume && (
          <button
            onClick={onResume}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full gradient-button text-white text-xs font-medium active:scale-95 transition-transform"
          >
            <Play className="w-3 h-3" />
            Resume
          </button>
        )}

        {canStop && (
          <button
            onClick={handleStop}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-colors ${
              confirmStop
                ? 'border-red-500/50 text-red-400 bg-red-500/10'
                : 'border-border text-muted-foreground hover:text-destructive hover:border-destructive/30'
            }`}
          >
            <Square className="w-3 h-3" />
            {confirmStop ? 'Confirm Stop' : 'Stop'}
          </button>
        )}

        {status === 'complete' && (
          <span className="text-xs text-green-400 font-light">Build complete</span>
        )}
      </div>
    </div>
  )
}

export default AgentControlBar
