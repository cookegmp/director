// ============================================================================
// Issue Scoring — Remediation Approval Dialog
// ============================================================================
// Approval prompt with environment selector for recommended fixes.
// ============================================================================

import { useState } from 'react';
import { Shield, X } from 'lucide-react';
import { approveRemediation } from '../remediation/remediation-trigger';
import { monitorSession } from '../remediation/remediation-monitor';

interface RemediationApprovalProps {
  issueId: string;
  projectId: string;
  onClose: () => void;
}

function RemediationApproval({ issueId, projectId, onClose }: RemediationApprovalProps) {
  const [environment, setEnvironment] = useState<'dsp' | 'development'>('dsp');
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    const session = approveRemediation(issueId, projectId, environment);
    if (session) {
      monitorSession(session.id);
    }
    onClose();
  };

  return (
    <div className="mt-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Approve Auto-Fix</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        This will initiate an agentic coding session that reads the bug report, locates
        the affected component, and attempts an automated fix. The fix will be staged for
        review — it will not auto-deploy.
      </p>

      <div>
        <label className="block text-xs text-muted-foreground mb-1.5">Target Environment</label>
        <div className="flex gap-2">
          {(['dsp', 'development'] as const).map((env) => (
            <button
              key={env}
              onClick={() => setEnvironment(env)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                environment === env
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-foreground/30'
              }`}
            >
              {env === 'dsp' ? 'DSP' : 'Development'}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Production is not available for auto-remediation.
        </p>
      </div>

      <button
        onClick={handleApprove}
        disabled={isApproving}
        className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all disabled:opacity-50"
      >
        {isApproving ? 'Initiating...' : 'Approve Auto-Fix'}
      </button>
    </div>
  );
}

export default RemediationApproval;
