import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import DictationButton from '@/components/DictationButton'
import GradientButton from '@/components/shared/GradientButton'

export interface WizardStep {
  id: string
  question: string
  placeholder?: string
  required?: boolean
  inputType: 'textarea' | 'select'
  suggestions?: string[]
  submitLabel?: string
}

interface WizardCardProps {
  steps: WizardStep[]
  onComplete: (answers: Record<string, string>) => void
  isProcessing?: boolean
}

function WizardCard({ steps, onComplete, isProcessing = false }: WizardCardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const dictationBaseRef = useRef('')

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const canSubmitStep = step?.required ? currentAnswer.trim().length > 0 : true

  const handleNext = useCallback(() => {
    if (!canSubmitStep || !step) return

    const updatedAnswers = { ...answers, [step.id]: currentAnswer }
    setAnswers(updatedAnswers)

    if (isLastStep) {
      onComplete(updatedAnswers)
    } else {
      setCurrentStep((s) => s + 1)
      setCurrentAnswer('')
      setSelectedTag(null)
    }
  }, [canSubmitStep, step, answers, currentAnswer, isLastStep, onComplete])

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = steps[currentStep - 1]
      setCurrentStep((s) => s - 1)
      setCurrentAnswer(prevStep ? (answers[prevStep.id] ?? '') : '')
      setSelectedTag(null)
    }
  }

  const handleTagClick = (tag: string) => {
    setCurrentAnswer(tag)
    setSelectedTag(tag)
  }

  const handleSkip = () => {
    if (step) {
      setAnswers({ ...answers, [step.id]: '' })
    }
    setCurrentStep((s) => s + 1)
    setCurrentAnswer('')
    setSelectedTag(null)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && step?.inputType !== 'textarea') {
        e.preventDefault()
        handleNext()
      }
      if (e.key === 'Enter' && e.metaKey) {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, step])

  if (!step) return null

  return (
    <section className="min-h-[calc(100vh-4rem)] flex flex-col justify-center px-4 sm:px-8 py-8 sm:py-16 max-w-3xl mx-auto w-full -mt-8">
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-10">
        {/* Step dots + back button */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-foreground leading-relaxed mb-6">
          {step.question}
        </h2>

        {/* Input */}
        {step.inputType === 'textarea' ? (
          <textarea
            value={currentAnswer}
            onChange={(e) => {
              setCurrentAnswer(e.target.value)
              setSelectedTag(null)
            }}
            placeholder={step.placeholder}
            rows={3}
            className="w-full bg-transparent border-b-2 border-border focus:border-primary text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none py-3"
            autoFocus
          />
        ) : (
          <div className="flex flex-wrap gap-3 mt-2">
            {step.suggestions?.map((option) => (
              <button
                key={option}
                onClick={() => handleTagClick(option)}
                className={`px-4 py-2.5 text-sm border rounded-xl transition-colors ${
                  currentAnswer === option
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {/* Suggestion tags (for textarea steps) */}
        {step.inputType === 'textarea' && step.suggestions && step.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {step.suggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                  selectedTag === tag
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center gap-3 mt-6">
          <GradientButton onClick={handleNext} disabled={!canSubmitStep || isProcessing}>
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                {step.submitLabel ?? (isLastStep ? 'Submit' : 'OK')}
                <Check className="w-4 h-4" />
              </>
            )}
          </GradientButton>

          <span className="text-sm text-muted-foreground">
            press{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
              {step.inputType === 'textarea' ? '⌘+Enter' : 'Enter'}
            </kbd>
          </span>

          {!step.required && (
            <button
              onClick={handleSkip}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {step.inputType === 'textarea' && (
            <DictationButton
              onResult={(text) => {
                const committed = dictationBaseRef.current + text
                dictationBaseRef.current = committed
                setCurrentAnswer(committed)
              }}
              onInterim={(text) => {
                if (text) {
                  setCurrentAnswer(dictationBaseRef.current + text)
                }
              }}
              onListeningChange={(listening) => {
                if (listening) {
                  dictationBaseRef.current = currentAnswer
                }
              }}
              className="ml-auto"
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default WizardCard
export type { WizardStep as WizardStepType }
