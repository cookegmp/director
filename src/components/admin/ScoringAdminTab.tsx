// ============================================================================
// Admin — Scoring Admin Tab
// ============================================================================
// Composes RemediationSettings and ScoreWeightEditor.
// ============================================================================

import RemediationSettingsPanel from '@/modules/issue-scoring/components/RemediationSettings';
import ScoreWeightEditor from '@/modules/issue-scoring/components/ScoreWeightEditor';

function ScoringAdminTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-6">Auto-Remediation</h2>
        <RemediationSettingsPanel />
      </div>

      <div className="bg-card/50 backdrop-blur-sm rounded-[1rem] border border-border p-6">
        <h2 className="text-lg font-light text-foreground mb-6">Scoring Weights</h2>
        <ScoreWeightEditor />
      </div>
    </div>
  );
}

export default ScoringAdminTab;
