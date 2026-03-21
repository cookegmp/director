import { Check } from 'lucide-react'
import { CLIENT_STATUS_ORDER, CLIENT_STATUS_LABELS } from '@/types'
import type { ClientStatus } from '@/types'

interface ClientStatusProgressionProps {
  currentStatus: ClientStatus
  onStatusChange?: (status: ClientStatus) => void
}

function ClientStatusProgression({ currentStatus, onStatusChange }: ClientStatusProgressionProps) {
  const mainStatuses = CLIENT_STATUS_ORDER.filter((s) => s !== 'archived')
  const currentIndex = mainStatuses.indexOf(currentStatus as typeof mainStatuses[number])
  const isArchived = currentStatus === 'archived'

  const handleClick = (status: ClientStatus) => {
    if (!onStatusChange || status === currentStatus) return
    if (window.confirm(`Change client status to "${CLIENT_STATUS_LABELS[status]}"?`)) {
      onStatusChange(status)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1">
        {mainStatuses.map((status, i) => {
          const isPast = !isArchived && i < currentIndex
          const isCurrent = !isArchived && status === currentStatus

          return (
            <div key={status} className="flex items-center flex-1">
              <button
                onClick={() => handleClick(status)}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : isPast
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                title={CLIENT_STATUS_LABELS[status]}
              >
                {isPast ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </button>
              {i < mainStatuses.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    isPast ? 'bg-primary/30' : 'bg-border'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between px-1">
        {mainStatuses.map((status) => (
          <span
            key={status}
            className={`text-[10px] ${
              status === currentStatus && !isArchived
                ? 'text-primary font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {CLIENT_STATUS_LABELS[status]}
          </span>
        ))}
      </div>
      {isArchived && (
        <p className="text-xs text-muted-foreground italic">This client is archived.</p>
      )}
    </div>
  )
}

export default ClientStatusProgression
