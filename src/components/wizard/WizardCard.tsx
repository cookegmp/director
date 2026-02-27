import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import DictationButton from '@/components/DictationButton'
import GradientButton from '@/components/shared/GradientButton'
import { useIdeasStore } from '@/stores/ideas'
import { useActivityStore } from '@/stores/activity'
import { useRemediationSettingsStore } from '@/modules/issue-scoring/stores/remediation-settings'
import { generateId } from '@/lib/utils'
import { scoreIdea } from '@/lib/scoring'
import type { WizardStep } from '@/types'

const STEPS: WizardStep[] = [
  {
    id: 'problem',
    question: 'What process or pain point are you looking to address?',
    placeholder: 'Describe the problem or opportunity...',
    required: true,
    inputType: 'textarea',
  },
  {
    id: 'impact',
    question: 'Who does this affect and how often?',
    placeholder: 'Teams, frequency, downstream effects...',
    required: true,
    inputType: 'textarea',
    suggestions: [
      'Affects entire production floor daily',
      'Engineering team spends hours weekly',
      'Causes delays in customer deliveries',
      'Quality issues downstream',
    ],
  },
  {
    id: 'current-state',
    question: 'How is this handled today?',
    placeholder: 'Current tools, workarounds, manual steps...',
    required: true,
    inputType: 'textarea',
    suggestions: [
      'Manual spreadsheet tracking',
      'Paper-based process with handoffs',
      'Using outdated legacy software',
      'No current solution — completely manual',
    ],
  },
  {
    id: 'desired-outcome',
    question: 'What does success look like?',
    placeholder: 'Ideal end state, measurable improvements...',
    required: true,
    inputType: 'textarea',
    suggestions: [
      'Real-time visibility into status',
      'Automated data capture and reporting',
      'Reduced cycle time by 50%+',
      'Elimination of manual data entry',
    ],
  },
  {
    id: 'constraints',
    question: 'Any constraints or considerations?',
    placeholder: 'Budget, timeline, integration requirements, compliance...',
    required: false,
    inputType: 'textarea',
    suggestions: [
      'Must integrate with existing ERP',
      'Needs to work on mobile devices',
      'Compliance or audit requirements',
      'Limited internal technical resources',
    ],
  },
  {
    id: 'urgency',
    question: 'How urgent is this?',
    required: true,
    inputType: 'select',
    suggestions: [
      'Blocking other work',
      'Causing daily friction',
      'Would improve efficiency',
      'Exploring for the future',
    ],
    submitLabel: 'Score & Prioritize',
  },
]

function WizardCard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Tracks the text before dictation interim results so we can append cleanly
  const dictationBaseRef = useRef('')

  const navigate = useNavigate()
  const addIdea = useIdeasStore((s) => s.addIdea)
  const addActivity = useActivityStore((s) => s.addActivity)
  const ideaWeights = useRemediationSettingsStore((s) => s.settings.idea_weights)

  const step = STEPS[currentStep]
  const isLastStep = currentStep === STEPS.length - 1
  const canSubmitStep = step?.required ? currentAnswer.trim().length > 0 : true

  const handleNext = useCallback(() => {
    if (!canSubmitStep || !step) return

    const updatedAnswers = { ...answers, [step.id]: currentAnswer }
    setAnswers(updatedAnswers)

    if (isLastStep) {
      setIsProcessing(true)

      // Generate title from the problem description
      const problemText = updatedAnswers.problem ?? ''
      const title =
        problemText.length > 60 ? problemText.slice(0, 57) + '...' : problemText || 'Untitled Idea'

      const scores = scoreIdea(updatedAnswers)
      const compositeScore =
        scores.impact * ideaWeights.impact +
        scores.urgency * ideaWeights.urgency +
        scores.feasibility * ideaWeights.feasibility +
        scores.alignment * ideaWeights.alignment

      const ideaId = generateId()
      const now = new Date().toISOString()

      addIdea({
        id: ideaId,
        title,
        status: 'scored',
        intakeAnswers: updatedAnswers,
        scores,
        compositeScore,
        createdAt: now,
        updatedAt: now,
        linkedCharterId: null,
        linkedIssueIds: [],
        activeSessionId: null,
      })

      addActivity({
        id: generateId(),
        type: 'idea-created',
        entityId: ideaId,
        entityType: 'idea',
        summary: `New idea scored: "${title}" (${Math.round(compositeScore)})`,
        createdAt: now,
      })

      setTimeout(() => {
        navigate(`/ideas/${ideaId}`)
      }, 600)
    } else {
      setCurrentStep((s) => s + 1)
      setCurrentAnswer('')
      setSelectedTag(null)
    }
  }, [
    canSubmitStep,
    step,
    answers,
    currentAnswer,
    isLastStep,
    addIdea,
    addActivity,
    navigate,
    ideaWeights,
  ])

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = STEPS[currentStep - 1]
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
            {STEPS.map((_, i) => (
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
                {step.submitLabel ?? (isLastStep ? 'Score & Prioritize' : 'OK')}
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
                // Final result: commit to base so next interim appends after it
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
                  // Snapshot whatever is in the field as the base
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
