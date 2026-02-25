// ============================================================================
// Issue Scoring — Remediation Banner
// ============================================================================
// Status banner displayed on issue detail for remediation state.
// ============================================================================

import { useState } from 'react';
import { Wrench, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { IssueScore } from '../types';
import RemediationApproval from './RemediationApproval';

interface RemediationBannerProps {
  score: IssueScore;
  projectId: string | null;
}

function RemediationBanner({ score, projectId }: RemediationBannerProps) {
  const [showApproval, setShowApproval] = useState(false);

  if (!score.remediation_status || score.score_type !== 'bug') return null;

  switch (score.remediation_status) {
    case 'recommended':
      return (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-300 font-medium">Auto-fix recommended</p>
              <p className="text-xs text-amber-300/70 mt-0.5">
                This bug scored high enough for automated remediation. Review and approve to initiate.
              </p>
            </div>
            <button
              onClick={() => setShowApproval(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              Approve
            </button>
          </div>
          {showApproval && (
            <RemediationApproval
              issueId={score.issue_id}
              projectId={projectId ?? ''}
              onClose={() => setShowApproval(false)}
            />
          )}
        </>
      );

    case 'approved':
    case 'triggered':
    case 'in_progress':
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20">
          <Loader2 className="w-4 h-4 text-teal-400 shrink-0 animate-spin" />
          <div className="flex-1">
            <p className="text-sm text-teal-300 font-medium">
              {score.remediation_status === 'in_progress' ? 'Auto-fix in progress' : 'Auto-fix initiated'}
            </p>
            <p className="text-xs text-teal-300/70 mt-0.5">
              An agentic coding session is working on a fix. You can monitor progress in the development portal.
            </p>
          </div>
        </div>
      );

    case 'completed':
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-green-300 font-medium">Auto-fix complete</p>
            <p className="text-xs text-green-300/70 mt-0.5">
              Staged changes are ready for review. Check the development portal to inspect and deploy.
            </p>
          </div>
        </div>
      );

    case 'failed':
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-300 font-medium">Auto-fix attempted — manual review needed</p>
            <p className="text-xs text-red-300/70 mt-0.5">
              The automated remediation session encountered an issue and could not complete. A developer should review manually.
            </p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default RemediationBanner;
