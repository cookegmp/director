// ============================================================================
// Agents & Skills — AI-Driven Creation Wizard
// ============================================================================
// Conversational wizard for creating new agents or skills.
// Follows the same UX as IssueReporterWizard — AI asks questions,
// user responds, then a review card shows the generated configuration.
// ============================================================================

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Bot, Zap, Check } from 'lucide-react'
import {
  WizardStepDots,
  WizardInput,
  WizardSuggestionTags,
  WizardActionBar,
} from '@/components/shared/wizard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAgentsSkillsStore } from '@/stores/agents-skills'
import {
  sendConversationMessage,
  type CreationType,
  type ConversationMessage,
  type AgentCompletionResponse,
  type SkillCompletionResponse,
} from '../lib/ai-conversation'

type Phase = 'type-select' | 'conversing' | 'review' | 'done'

interface CreationWizardProps {
  onClose: () => void
  defaultType?: CreationType | null
}

function CreationWizard({ onClose, defaultType = null }: CreationWizardProps) {
  const [phase, setPhase] = useState<Phase>(defaultType ? 'conversing' : 'type-select')
  const [creationType, setCreationType] = useState<CreationType | null>(defaultType)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null)
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([])
  const [currentHelperText, setCurrentHelperText] = useState<string | null>(null)
  const [stepCount, setStepCount] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AgentCompletionResponse | SkillCompletionResponse | null>(
    null,
  )

  const addAgent = useAgentsSkillsStore((s) => s.addAgent)
  const addSkill = useAgentsSkillsStore((s) => s.addSkill)

  // Initialize conversation when type is selected
  const initConversation = useCallback(async (type: CreationType) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendConversationMessage([], type)
      if (!response.done) {
        setMessages([{ role: 'assistant', content: response.question }])
        setCurrentQuestion(response.question)
        setCurrentSuggestions(response.suggestions)
        setCurrentHelperText(response.helper_text)
        setPhase('conversing')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize')
      const fallback =
        type === 'agent'
          ? 'What task should this new agent handle?'
          : 'What should this new skill do?'
      setMessages([{ role: 'assistant', content: fallback }])
      setCurrentQuestion(fallback)
      setCurrentSuggestions(
        type === 'agent'
          ? ['Code review', 'Documentation', 'Testing']
          : ['Health check', 'Report generation', 'Analysis'],
      )
      setPhase('conversing')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Auto-init when defaultType is provided
  useEffect(() => {
    if (defaultType && phase === 'conversing' && messages.length === 0) {
      initConversation(defaultType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelectType = (type: CreationType) => {
    setCreationType(type)
    initConversation(type)
  }

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentAnswer.trim() || isLoading || !creationType) return

    const userMessage = currentAnswer.trim()
    setCurrentAnswer('')
    setSelectedTag(null)

    const updatedMessages: ConversationMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(updatedMessages)
    setStepCount((s) => s + 1)
    setIsLoading(true)
    setError(null)

    try {
      const response = await sendConversationMessage(updatedMessages, creationType)

      if (response.done) {
        setMessages([...updatedMessages, { role: 'assistant', content: JSON.stringify(response) }])
        setResult(response as AgentCompletionResponse | SkillCompletionResponse)
        setPhase('review')
      } else {
        setMessages([...updatedMessages, { role: 'assistant', content: response.question }])
        setCurrentQuestion(response.question)
        setCurrentSuggestions(response.suggestions)
        setCurrentHelperText(response.helper_text)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }, [currentAnswer, isLoading, creationType, messages])

  const handleTagClick = (tag: string) => {
    setCurrentAnswer(tag)
    setSelectedTag(tag)
  }

  const handleConfirm = () => {
    if (!result) return

    if (result.type === 'agent') {
      const r = result as AgentCompletionResponse
      addAgent({
        name: r.name,
        description: r.description,
        model: r.model,
        systemPrompt: r.systemPrompt,
        tools: r.tools,
        maxTurns: r.maxTurns,
        status: 'draft',
      })
    } else {
      const r = result as SkillCompletionResponse
      addSkill({
        name: r.name,
        description: r.description,
        trigger: r.trigger,
        instructions: r.instructions,
        agentId: r.agentId,
        status: 'draft',
      })
    }

    setPhase('done')
  }

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.metaKey && phase === 'conversing') {
        e.preventDefault()
        handleSubmitAnswer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleSubmitAnswer, phase])

  // Done confirmation
  if (phase === 'done') {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-teal-400" />
        </div>
        <h2 className="text-xl font-light text-foreground mb-2">
          {result?.type === 'agent' ? 'Agent' : 'Skill'} Created
        </h2>
        <p className="text-sm text-muted-foreground mb-1">
          <span className="text-foreground font-medium">{result?.name}</span> has been created as a
          draft.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Activate it from the list when ready to use.
        </p>
        <Button onClick={onClose}>Back to List</Button>
      </div>
    )
  }

  // Review card
  if (phase === 'review' && result) {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              {result.type === 'agent' ? (
                <Bot className="w-5 h-5 text-primary" />
              ) : (
                <Zap className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-light text-foreground">
                Review {result.type === 'agent' ? 'Agent' : 'Skill'}
              </h2>
              <p className="text-xs text-muted-foreground">
                AI-generated configuration — review before saving
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            Draft
          </Badge>
        </div>

        {result.type === 'agent' ? (
          <AgentReviewCard data={result as AgentCompletionResponse} />
        ) : (
          <SkillReviewCard data={result as SkillCompletionResponse} />
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleConfirm} className="gap-2">
            <Check className="w-4 h-4" />
            Save as Draft
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Discard
          </Button>
        </div>
      </div>
    )
  }

  // Type selection
  if (phase === 'type-select') {
    return (
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-8">
        <h2 className="text-xl font-light text-foreground mb-2 text-center">
          What would you like to create?
        </h2>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          The AI assistant will guide you through the configuration.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleSelectType('agent')}
            className="group flex flex-col items-center gap-4 p-8 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-light text-foreground mb-1">New Agent</p>
              <p className="text-sm text-muted-foreground">
                An AI-powered worker that performs specific tasks
              </p>
            </div>
          </button>

          <button
            onClick={() => handleSelectType('skill')}
            className="group flex flex-col items-center gap-4 p-8 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Zap className="w-7 h-7 text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-light text-foreground mb-1">New Skill</p>
              <p className="text-sm text-muted-foreground">
                A triggered capability that can be invoked by users
              </p>
            </div>
          </button>
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Conversation
  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6 sm:p-8">
      {/* Step dots + back */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Cancel</span>
        </button>
        <WizardStepDots totalSteps={Math.max(stepCount + 1, 4)} currentStep={stepCount} />
        <Badge variant="outline" className="text-xs">
          {creationType === 'agent' ? 'Agent' : 'Skill'}
        </Badge>
      </div>

      {/* Question */}
      <h2 className="text-xl sm:text-2xl font-light text-foreground leading-relaxed mb-6">
        {isLoading && !currentQuestion ? (
          <span className="flex items-center gap-3">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Preparing your first question...</span>
          </span>
        ) : (
          (currentQuestion ?? 'What would you like to create?')
        )}
      </h2>

      {/* Helper text */}
      {currentHelperText && (
        <p className="text-sm text-muted-foreground mb-4">{currentHelperText}</p>
      )}

      {/* Input */}
      <WizardInput
        value={currentAnswer}
        onChange={(val) => {
          setCurrentAnswer(val)
          setSelectedTag(null)
        }}
        placeholder="Type your response..."
        onSubmit={handleSubmitAnswer}
        disabled={isLoading}
      />

      {/* Suggestion tags */}
      <WizardSuggestionTags
        suggestions={currentSuggestions}
        onSelect={handleTagClick}
        selectedTag={selectedTag}
      />

      {/* Error */}
      {error && <p className="text-sm text-destructive mt-3">{error}</p>}

      {/* Action bar */}
      <WizardActionBar
        onSubmit={handleSubmitAnswer}
        disabled={!currentAnswer.trim()}
        loading={isLoading}
        submitLabel="Send"
      />
    </div>
  )
}

// --- Review sub-components ---

function AgentReviewCard({ data }: { data: AgentCompletionResponse }) {
  return (
    <div className="space-y-4">
      <ReviewField label="Name" value={data.name} />
      <ReviewField label="Description" value={data.description} />
      <ReviewField label="Model" value={data.model} mono />
      <ReviewField label="Max Turns" value={String(data.maxTurns)} />
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Tools</span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {data.tools.map((tool) => (
            <Badge key={tool} variant="outline" className="text-xs font-mono">
              {tool}
            </Badge>
          ))}
        </div>
      </div>
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          System Prompt
        </span>
        <div className="mt-1.5 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {data.systemPrompt}
          </p>
        </div>
      </div>
    </div>
  )
}

function SkillReviewCard({ data }: { data: SkillCompletionResponse }) {
  const agents = useAgentsSkillsStore((s) => s.agents)
  const linkedAgent = data.agentId ? agents.find((a) => a.id === data.agentId) : null

  return (
    <div className="space-y-4">
      <ReviewField label="Name" value={data.name} />
      <ReviewField label="Description" value={data.description} />
      <ReviewField label="Trigger" value={data.trigger} mono />
      <ReviewField label="Linked Agent" value={linkedAgent?.name ?? 'None (independent)'} />
      <div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Instructions</span>
        <div className="mt-1.5 p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
            {data.instructions}
          </p>
        </div>
      </div>
    </div>
  )
}

function ReviewField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      <p className={`text-sm text-foreground mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

export default CreationWizard
