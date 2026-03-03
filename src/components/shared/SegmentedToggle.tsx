import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SegmentOption {
  value: string
  label: string
  icon?: LucideIcon
}

interface SegmentedToggleProps {
  options: readonly SegmentOption[]
  value: string
  onChange: (value: string) => void
  label?: string
}

function SegmentedToggle({ options, value, onChange, label }: SegmentedToggleProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {label && (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
          {label}
        </span>
      )}
      <div
        className="grid w-full bg-muted/40 border border-border rounded p-0.5"
        style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
      >
        {options.map((option) => {
          const isActive = option.value === value
          const Icon = option.icon
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_6px_rgba(var(--primary-rgb),0.15)]'
                  : 'text-muted-foreground hover:text-foreground border border-transparent',
              )}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SegmentedToggle
