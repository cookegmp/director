import { Check, ArrowRight } from 'lucide-react'
import GradientButton from '@/components/shared/GradientButton'
import DictationButton from '@/components/DictationButton'

interface WizardActionBarProps {
  onSubmit: () => void
  onSkip?: () => void
  submitLabel?: string
  isSkippable?: boolean
  disabled?: boolean
  loading?: boolean
  keyboardHint?: string
  onDictationResult?: (text: string) => void
  onDictationInterim?: (text: string) => void
  onDictationListeningChange?: (listening: boolean) => void
}

function WizardActionBar({
  onSubmit,
  onSkip,
  submitLabel = 'OK',
  isSkippable = false,
  disabled = false,
  loading = false,
  keyboardHint = '⌘+Enter',
  onDictationResult,
  onDictationInterim,
  onDictationListeningChange,
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

      {onDictationResult && (
        <DictationButton
          onResult={onDictationResult}
          onInterim={onDictationInterim}
          onListeningChange={onDictationListeningChange}
          className="ml-auto"
        />
      )}
    </div>
  )
}

export default WizardActionBar
