// ============================================================================
// Issue Scoring — Remediation Settings
// ============================================================================
// Admin component for threshold and environment configuration.
// ============================================================================

import { useRemediationSettingsStore } from '../stores/remediation-settings'

function RemediationSettingsPanel() {
  const settings = useRemediationSettingsStore((s) => s.settings)
  const updateSettings = useRemediationSettingsStore((s) => s.updateSettings)
  const resetDefaults = useRemediationSettingsStore((s) => s.resetDefaults)

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">Auto-Remediation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            When enabled, high-scoring bugs can trigger automated fix attempts.
          </p>
        </div>
        <button
          onClick={() => updateSettings({ enabled: !settings.enabled })}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            settings.enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className={settings.enabled ? '' : 'opacity-50 pointer-events-none'}>
        {/* Recommendation Threshold */}
        <SettingSlider
          label="Recommendation Threshold"
          description="Bugs at or above this score get a remediation recommendation."
          value={settings.recommend_threshold}
          min={0}
          max={100}
          onChange={(v) => {
            updateSettings({
              recommend_threshold: v,
              // Ensure auto-trigger stays above recommend
              auto_trigger_threshold: Math.max(settings.auto_trigger_threshold, v + 1),
            })
          }}
        />

        {/* Auto-Trigger Threshold */}
        <SettingSlider
          label="Auto-Trigger Threshold"
          description="Bugs at or above this score automatically initiate remediation."
          value={settings.auto_trigger_threshold}
          min={settings.recommend_threshold + 1}
          max={100}
          onChange={(v) => updateSettings({ auto_trigger_threshold: v })}
        />

        {/* Confidence Floor */}
        <SettingSlider
          label="Minimum Remediation Confidence"
          description="Bugs with remediation_confidence below this cannot auto-trigger."
          value={settings.confidence_floor}
          min={0}
          max={100}
          onChange={(v) => updateSettings({ confidence_floor: v })}
        />

        {/* Target Environment */}
        <div className="py-4 border-b border-border">
          <label className="block text-sm font-medium text-foreground mb-1">
            Auto-Trigger Target Environment
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Which environment auto-triggered sessions target. Production is excluded by design.
          </p>
          <div className="flex gap-2">
            {(['dsp', 'development'] as const).map((env) => (
              <button
                key={env}
                onClick={() => updateSettings({ auto_trigger_environment: env })}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  settings.auto_trigger_environment === env
                    ? 'border-primary/50 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}
              >
                {env === 'dsp' ? 'DSP' : 'Development'}
              </button>
            ))}
          </div>
        </div>

        {/* Max Concurrent Sessions */}
        <div className="py-4 border-b border-border">
          <label className="block text-sm font-medium text-foreground mb-1">
            Max Concurrent Sessions
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Maximum number of remediation sessions running simultaneously.
          </p>
          <input
            type="number"
            min={1}
            max={5}
            value={settings.max_concurrent_sessions}
            onChange={(e) =>
              updateSettings({
                max_concurrent_sessions: Math.max(1, Math.min(5, parseInt(e.target.value) || 1)),
              })
            }
            className="w-20 px-3 py-1.5 rounded-lg bg-transparent border border-border text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <button
          onClick={resetDefaults}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset to defaults
        </button>
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

export default RemediationSettingsPanel
