// ============================================================================
// Issue Reporter — Main Wizard Component
// ============================================================================
// AI-driven conversational intake. No fixed steps — the AI decides
// what to ask next. Transitions to ReviewCard on completion.
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Bug, Lightbulb } from 'lucide-react';
import {
  WizardCard,
  WizardStepDots,
  WizardInput,
  WizardSuggestionTags,
  WizardActionBar,
} from '@/components/shared/wizard';
import { useIssueReporterStore } from '../stores/issue-reporter';
import { sendConversationMessage } from '../lib/ai-conversation';
import { mapAIResponseToReport } from '../lib/field-mapper';
import ReviewCard from './ReviewCard';
import ConfirmationView from './ConfirmationView';
import type { IssueClassification } from '../types';

interface IssueReporterWizardProps {
  projectId?: string | null;
  appName?: string | null;
  onCancel?: () => void;
}

function IssueReporterWizard({ projectId = null, appName = null, onCancel }: IssueReporterWizardProps) {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [submittedIssueId, setSubmittedIssueId] = useState<string | null>(null);

  const {
    phase,
    currentQuestion,
    currentSuggestions,
    currentHelperText,
    stepCount,
    isLoading,
    error,
    report,
    setPhase,
    setProjectId,
    setAppName,
    setIssueType,
    addMessage,
    setCurrentQuestion,
    incrementStep,
    setReport,
    setLoading,
    setError,
    reset,
  } = useIssueReporterStore();

  // Show type selection on mount
  useEffect(() => {
    if (phase === 'idle') {
      setProjectId(projectId ?? null);
      setAppName(appName ?? null);
      setPhase('type-select');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initConversation = useCallback(async (selectedType: IssueClassification) => {
    setPhase('initializing');
    setLoading(true);
    setError(null);

    try {
      const response = await sendConversationMessage([], projectId ?? null, selectedType, appName ?? null);

      if (!response.done) {
        addMessage({ role: 'assistant', content: response.question });
        setCurrentQuestion(
          response.question,
          response.suggestions,
          response.helper_text
        );
        setPhase('conversing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize conversation');
      setPhase('conversing');
      const fallbackQuestion = selectedType === 'bug'
        ? 'Tell me about the bug you encountered. What happened?'
        : 'Tell me about the feature you have in mind. What would it do?';
      addMessage({ role: 'assistant', content: fallbackQuestion });
      setCurrentQuestion(
        fallbackQuestion,
        selectedType === 'bug'
          ? ['Something is broken', 'I see an error', 'Something is slow or confusing']
          : ['Workflow improvement', 'New capability', 'UI/UX enhancement'],
        null
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, appName, setPhase, setLoading, setError, setCurrentQuestion, addMessage]);

  const handleSelectType = (type: IssueClassification) => {
    setIssueType(type);
    initConversation(type);
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentAnswer.trim() || isLoading) return;

    const userMessage = currentAnswer.trim();
    setCurrentAnswer('');
    setSelectedTag(null);

    addMessage({ role: 'user', content: userMessage });
    incrementStep();
    setLoading(true);
    setError(null);

    try {
      // Read current messages from store to avoid stale closure
      const store = useIssueReporterStore.getState();
      const response = await sendConversationMessage(store.messages, projectId ?? null, store.issueType, store.appName);

      if (response.done) {
        addMessage({
          role: 'assistant',
          content: JSON.stringify(response),
        });
        const issueReport = mapAIResponseToReport(response);
        setReport(issueReport);
      } else {
        addMessage({
          role: 'assistant',
          content: response.question,
        });
        setCurrentQuestion(
          response.question,
          response.suggestions,
          response.helper_text
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  }, [
    currentAnswer,
    isLoading,
    projectId,
    addMessage,
    incrementStep,
    setLoading,
    setError,
    setCurrentQuestion,
    setReport,
  ]);

  const handleTagClick = (tag: string) => {
    setCurrentAnswer(tag);
    setSelectedTag(tag);
  };

  const handleRestart = () => {
    reset();
    setCurrentAnswer('');
    setSelectedTag(null);
    setSubmittedIssueId(null);
    // Go back to type selection
    setTimeout(() => {
      setProjectId(projectId ?? null);
      setAppName(appName ?? null);
      setPhase('type-select');
    }, 50);
  };

  const handleCancel = () => {
    reset();
    onCancel?.();
  };

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.metaKey && phase === 'conversing') {
        e.preventDefault();
        handleSubmitAnswer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmitAnswer, phase]);

  // Confirmation view after submission
  if (submittedIssueId) {
    return (
      <ConfirmationView
        issueId={submittedIssueId}
        onReportAnother={handleRestart}
        onClose={handleCancel}
      />
    );
  }

  // Review card after AI completion
  if (phase === 'review' && report) {
    return (
      <ReviewCard
        onRestart={handleRestart}
        onCancel={handleCancel}
        onSubmitted={(issueId) => setSubmittedIssueId(issueId)}
      />
    );
  }

  // Type selection
  if (phase === 'idle' || phase === 'type-select') {
    return (
      <WizardCard>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-foreground leading-relaxed mb-8 text-center">
          What would you like to do?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleSelectType('bug')}
            className="group flex flex-col items-center gap-4 p-8 rounded-xl border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <Bug className="w-7 h-7 text-amber-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-light text-foreground mb-1">I want to report an issue</p>
              <p className="text-sm text-muted-foreground">
                Report a bug or problem with an existing application
              </p>
            </div>
          </button>

          <button
            onClick={() => handleSelectType('feature')}
            className="group flex flex-col items-center gap-4 p-8 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Lightbulb className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-light text-foreground mb-1">I have an idea</p>
              <p className="text-sm text-muted-foreground">
                Request a feature or enhancement for an existing application
              </p>
            </div>
          </button>
        </div>
      </WizardCard>
    );
  }

  // Conversation wizard
  return (
    <WizardCard>
      {/* Step dots + back */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {stepCount > 0 && (
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Cancel</span>
          </button>
        )}
        <WizardStepDots totalSteps={Math.max(stepCount + 1, 3)} currentStep={stepCount} />
      </div>

      {/* Question */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-foreground leading-relaxed mb-6">
        {isLoading && !currentQuestion ? (
          <span className="flex items-center gap-3">
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Preparing your first question...</span>
          </span>
        ) : (
          currentQuestion ?? 'What would you like to report?'
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
          setCurrentAnswer(val);
          setSelectedTag(null);
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

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive mt-3">{error}</p>
      )}

      {/* Action bar */}
      <WizardActionBar
        onSubmit={handleSubmitAnswer}
        disabled={!currentAnswer.trim()}
        loading={isLoading}
        submitLabel="Send"
      />
    </WizardCard>
  );
}

export default IssueReporterWizard;
