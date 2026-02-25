// ============================================================================
// Issue Scoring — Idea Scoring Settings
// ============================================================================
// Admin component for idea scoring thresholds and auto-charter configuration.
// ============================================================================

import { useRemediationSettingsStore } from '../stores/remediation-settings';

function IdeaScoringSettingsPanel() {
  const settings = useRemediationSettingsStore((s) => s.settings);
  const updateSettings = useRemediationSettingsStore((s) => s.updateSettings);

  return (
    <div className="space-y-6">
      {/* Auto-Charter Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Auto-Charter Generation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            When enabled, high-scoring ideas can automatically generate a project charter.
          </p>
        </div>
        <button
          onClick={() => updateSettings({ idea_auto_charter_enabled: !settings.idea_auto_charter_enabled })}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            settings.idea_auto_charter_enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              settings.idea_auto_charter_enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className={settings.idea_auto_charter_enabled ? '' : 'opacity-50 pointer-events-none'}>
        {/* Review Threshold */}
        <SettingSlider
          label="Review Threshold"
          description="Ideas at or above this score get flagged for review."
          value={settings.idea_review_threshold}
          min={0}
          max={100}
          onChange={(v) => {
            updateSettings({
              idea_review_threshold: v,
              idea_auto_charter_threshold: Math.max(settings.idea_auto_charter_threshold, v + 1),
            });
          }}
        />

        {/* Auto-Charter Threshold */}
        <SettingSlider
          label="Auto-Charter Threshold"
          description="Ideas at or above this score automatically generate a project charter."
          value={settings.idea_auto_charter_threshold}
          min={settings.idea_review_threshold + 1}
          max={100}
          onChange={(v) => updateSettings({ idea_auto_charter_threshold: v })}
        />
      </div>

      {/* Scoring Method Info */}
      <div className="py-4 border-b border-border">
        <label className="block text-sm font-medium text-foreground mb-1">
          Scoring Method
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Idea scoring uses a rules-based engine that evaluates intake answers against keyword
          patterns. No AI model is used.
        </p>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          Rules-Based
        </span>
      </div>
    </div>
  );
}

function SettingSlider({
  label,
  description,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-4 border-b border-border">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm text-foreground tabular-nums">{value}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-muted/50 rounded-full appearance-none cursor-pointer accent-primary"
      />
    </div>
  );
}

export default IdeaScoringSettingsPanel;
