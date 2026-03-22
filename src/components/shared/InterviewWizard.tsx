import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, Check, Pause, X } from 'lucide-react'
import DictationButton from '@/components/DictationButton'
import GradientButton from '@/components/shared/GradientButton'

export interface InterviewStep {
  id: string
  prompt: string
  question: string
  placeholder?: string
  required?: boolean
  inputType?: 'textarea' | 'select'
  suggestions?: string[]
}

interface InterviewWizardProps {
  title: string
  subtitle?: string
  steps: InterviewStep[]
  initialAnswers?: Record<string, string>
  onComplete: (answers: Record<string, string>) => void
  onSave?: (answers: Record<string, string>, currentStepIndex: number) => void
  onClose: () => void
  isProcessing?: boolean
  completeLabel?: string
}

function InterviewWizard({
  title,
  subtitle,
  steps,
  initialAnswers = {},
  onComplete,
  onSave,
  onClose,
  isProcessing = false,
  completeLabel = 'Finish Interview',
}: InterviewWizardProps) {
  // Find the first unanswered step to resume from
  const initialStep = Object.keys(initialAnswers).length > 0
    ? Math.min(
        steps.findIndex((s) => !initialAnswers[s.id]?.trim()),
        steps.length - 1,
      )
    : 0

  const [currentStep, setCurrentStep] = useState(initialStep < 0 ? steps.length - 1 : initialStep)
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [currentAnswer, setCurrentAnswer] = useState(
    initialAnswers[steps[initialStep < 0 ? steps.length - 1 : initialStep]?.id] ?? '',
  )
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const dictationBaseRef = useRef('')

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const canSubmitStep = step?.required !== false ? currentAnswer.trim().length > 0 : true
  const answeredCount = Object.values(answers).filter((v) => v.trim()).length

  const handleNext = useCallback(() => {
    if (!canSubmitStep || !step) return

    const updatedAnswers = { ...answers, [step.id]: currentAnswer }
    setAnswers(updatedAnswers)

    if (isLastStep) {
      onComplete(updatedAnswers)
    } else {
      setCurrentStep((s) => s + 1)
      const nextStep = steps[currentStep + 1]
      setCurrentAnswer(nextStep ? (updatedAnswers[nextStep.id] ?? '') : '')
      setSelectedTag(null)
    }
  }, [canSubmitStep, step, answers, currentAnswer, isLastStep, onComplete, steps, currentStep])

  const handleBack = () => {
    if (currentStep > 0) {
      // Save current answer before going back
      if (step) {
        setAnswers((prev) => ({ ...prev, [step.id]: currentAnswer }))
      }
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
      setAnswers((prev) => ({ ...prev, [step.id]: '' }))
    }
    setCurrentStep((s) => s + 1)
    const nextStep = steps[currentStep + 1]
    setCurrentAnswer(nextStep ? (answers[nextStep.id] ?? '') : '')
    setSelectedTag(null)
  }

  const handlePause = () => {
    const updatedAnswers = step
      ? { ...answers, [step.id]: currentAnswer }
      : answers
    onSave?.(updatedAnswers, currentStep)
    onClose()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && step?.inputType === 'select') {
        e.preventDefault()
        handleNext()
      }
      if (e.key === 'Enter' && e.metaKey) {
        e.preventDefault()
        handleNext()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handlePause()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, step, handlePause])

  if (!step) return null

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <section className="min-h-[calc(100vh-8rem)] flex flex-col justify-center px-4 sm:px-8 py-8 max-w-3xl mx-auto w-full">
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-primary">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <button
                onClick={handlePause}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-muted/30"
                title="Save progress and exit (Esc)"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/30"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 bg-muted/30 rounded-full h-1.5">
            <div
              className="bg-primary rounded-full h-1.5 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Consultant prompt (what to ask & why) */}
        <div className="bg-muted/15 rounded-lg px-4 py-3 mb-5 border border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">{step.prompt}</p>
        </div>

        {/* Question (what the client hears) */}
        <h2 className="text-xl sm:text-2xl font-light text-foreground leading-relaxed mb-6">
          {step.question}
        </h2>

        {/* Input */}
        {step.inputType === 'select' ? (
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
        ) : (
          <textarea
            value={currentAnswer}
            onChange={(e) => {
              setCurrentAnswer(e.target.value)
              setSelectedTag(null)
            }}
            placeholder={step.placeholder ?? 'Type or dictate the response...'}
            rows={4}
            className="w-full bg-transparent border-b-2 border-border focus:border-primary text-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors resize-none py-3"
            autoFocus
          />
        )}

        {/* Suggestion tags (for textarea steps) */}
        {step.inputType !== 'select' && step.suggestions && step.suggestions.length > 0 && (
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
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
          )}

          <GradientButton onClick={handleNext} disabled={!canSubmitStep || isProcessing}>
            {isProcessing ? (
              'Processing...'
            ) : (
              <>
                {isLastStep ? completeLabel : 'OK'}
                {isLastStep ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </GradientButton>

          <span className="text-sm text-muted-foreground">
            press{' '}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">
              {step.inputType !== 'select' ? '⌘+Enter' : 'Enter'}
            </kbd>
          </span>

          {step.required === false && (
            <button
              onClick={handleSkip}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {step.inputType !== 'select' && (
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

        {/* Answered summary */}
        {answeredCount > 0 && (
          <p className="text-xs text-muted-foreground/60 mt-4">
            {answeredCount} of {steps.length} answered
          </p>
        )}
      </div>
    </section>
  )
}

export default InterviewWizard
