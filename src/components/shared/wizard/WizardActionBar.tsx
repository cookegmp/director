import { Check, ArrowRight, Mic } from 'lucide-react'
import GradientButton from '@/components/shared/GradientButton'

interface WizardActionBarProps {
  onSubmit: () => void
  onSkip?: () => void
  submitLabel?: string
  isSkippable?: boolean
  disabled?: boolean
  loading?: boolean
  keyboardHint?: string
}

function WizardActionBar({
  onSubmit,
  onSkip,
  submitLabel = 'OK',
  isSkippable = false,
  disabled = false,
  loading = false,
  keyboardHint = '⌘+Enter',
}: WizardActionBarProps) {
  return (
    <div className="flex items-center gap-3 mt-6">
      <GradientButton onClick={onSubmit} disabled={disabled || loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Thinking...
          </span>
        ) : (
          <>
            {submitLabel}
            <Check className="w-4 h-4" />
          </>
        )}
      </GradientButton>

      <span className="text-sm text-muted-foreground">
        press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">{keyboardHint}</kbd>
      </span>

      {isSkippable && onSkip && (
        <button
          onClick={onSkip}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip <ArrowRight className="w-3 h-3" />
        </button>
      )}

      <button className="ml-auto relative w-12 h-12 rounded-full flex items-center justify-center bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
        <Mic className="w-5 h-5" />
      </button>
    </div>
  )
}

export default WizardActionBar
