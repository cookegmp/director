// ============================================================================
// Issue Scoring — Feature Scoring Settings
// ============================================================================
// Admin component for feature request scoring thresholds and auto-prioritize.
// ============================================================================

import { useRemediationSettingsStore } from '../stores/remediation-settings'

function FeatureScoringSettingsPanel() {
  const settings = useRemediationSettingsStore((s) => s.settings)
  const updateSettings = useRemediationSettingsStore((s) => s.updateSettings)

  return (
    <div className="space-y-6">
      {/* Auto-Prioritize Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Auto-Prioritize</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            When enabled, high-scoring feature requests are automatically flagged for
            prioritization.
          </p>
        </div>
        <button
          onClick={() =>
            updateSettings({
              feature_auto_prioritize_enabled: !settings.feature_auto_prioritize_enabled,
            })
          }
          className={`relative w-10 h-5 rounded-full transition-colors ${
            settings.feature_auto_prioritize_enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              settings.feature_auto_prioritize_enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div
        className={settings.feature_auto_prioritize_enabled ? '' : 'opacity-50 pointer-events-none'}
      >
        {/* High-Value Threshold */}
        <SettingSlider
          label="High-Value Threshold"
          description="Feature requests at or above this score are classified as high value."
          value={settings.feature_high_value_threshold}
          min={0}
          max={100}
          onChange={(v) => {
            updateSettings({
              feature_high_value_threshold: v,
              feature_auto_prioritize_threshold: Math.max(
                settings.feature_auto_prioritize_threshold,
                v + 1,
              ),
            })
          }}
        />

        {/* Auto-Prioritize Threshold */}
        <SettingSlider
          label="Auto-Prioritize Threshold"
          description="Feature requests at or above this score are automatically escalated for prioritization."
          value={settings.feature_auto_prioritize_threshold}
          min={settings.feature_high_value_threshold + 1}
          max={100}
          onChange={(v) => updateSettings({ feature_auto_prioritize_threshold: v })}
        />
      </div>

      {/* Scoring Method Info */}
      <div className="py-4 border-b border-border">
        <label className="block text-sm font-medium text-foreground mb-1">Scoring Method</label>
        <p className="text-xs text-muted-foreground mb-3">
          Feature request scoring uses AI analysis with a rules-based fallback. The AI model and
          enable/disable toggle are configured in the AI Configuration tab.
        </p>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          AI + Rules Fallback
        </span>
      </div>
    </div>
  )
}

function SettingSlider({
  label,
  description,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  description: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
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
  )
}

export default FeatureScoringSettingsPanel
