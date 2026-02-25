// ============================================================================
// Issue Reporter — Confirmation View
// ============================================================================
// Post-submission confirmation with link to the new issue.
// ============================================================================

import { CheckCircle, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WizardCard } from '@/components/shared/wizard';
import GradientButton from '@/components/shared/GradientButton';
import { useIssueScoresStore } from '@/modules/issue-scoring/stores/issue-scores';
import ScoreBadge from '@/modules/issue-scoring/components/ScoreBadge';

interface ConfirmationViewProps {
  issueId: string;
  onReportAnother: () => void;
  onClose?: () => void;
}

function ConfirmationView({ issueId, onReportAnother, onClose }: ConfirmationViewProps) {
  const score = useIssueScoresStore((s) => s.scores.find((sc) => sc.issue_id === issueId));

  return (
    <WizardCard>
      <div className="text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-xl sm:text-2xl font-light text-foreground mb-2">
          Report Submitted
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your issue has been filed and the development team will be notified.
        </p>

        {/* Score indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {score ? (
            <>
              <span className="text-xs text-muted-foreground">Score:</span>
              <ScoreBadge score={score.composite_score} type={score.score_type} />
            </>
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Scoring...
            </span>
          )}
        </div>

        {/* Issue link */}
        <Link
          to="/issues"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:border-primary/30 hover:text-primary transition-colors mb-8"
        >
          View in Issues
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <GradientButton onClick={onReportAnother}>
            <Plus className="w-4 h-4" />
            Report Another Issue
          </GradientButton>
          {onClose && (
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Dashboard
            </Link>
          )}
        </div>
      </div>
    </WizardCard>
  );
}

export default ConfirmationView;
