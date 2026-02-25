// ============================================================================
// Issue Reporter — Main Wizard Component
// ============================================================================
// AI-driven conversational intake. No fixed steps — the AI decides
// what to ask next. Transitions to ReviewCard on completion.
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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

interface IssueReporterWizardProps {
  projectId?: string | null;
  onCancel?: () => void;
}

function IssueReporterWizard({ projectId = null, onCancel }: IssueReporterWizardProps) {
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
    addMessage,
    setCurrentQuestion,
    incrementStep,
    setReport,
    setLoading,
    setError,
    reset,
  } = useIssueReporterStore();

  // Initialize conversation
  useEffect(() => {
    if (phase === 'idle') {
      setProjectId(projectId ?? null);
      initConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initConversation = useCallback(async () => {
    setPhase('initializing');
    setLoading(true);
    setError(null);

    try {
      const response = await sendConversationMessage([], projectId ?? null);

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
      const fallbackQuestion = 'What would you like to report? Describe the issue or feature request you have in mind.';
      addMessage({ role: 'assistant', content: fallbackQuestion });
      setCurrentQuestion(
        fallbackQuestion,
        ['Something is broken', 'I have a feature idea', 'Something is slow or confusing'],
        null
      );
    } finally {
      setLoading(false);
    }
  }, [projectId, setPhase, setLoading, setError, setCurrentQuestion, addMessage]);

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
      const currentMessages = useIssueReporterStore.getState().messages;
      const response = await sendConversationMessage(currentMessages, projectId ?? null);

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
    // Re-initialize after reset
    setTimeout(() => {
      setProjectId(projectId ?? null);
      initConversation();
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
