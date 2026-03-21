// ============================================================================
// Issue Scoring — Score Weight Editor
// ============================================================================
// Admin component for adjusting dimension weights with sliders.
// Exports BugWeightEditor and FeatureWeightEditor separately, plus the
// combined ScoreWeightEditor for backwards compatibility.
// ============================================================================

import { useState } from 'react'
import { useRemediationSettingsStore } from '../stores/remediation-settings'
import type { IdeaWeights, BugWeights, FeatureWeights } from '../types'
import { IDEA_DIMENSION_LABELS, BUG_DIMENSION_LABELS, FEATURE_DIMENSION_LABELS } from '../types'

function WeightSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(parseInt(e.target.value) / 100)}
        className="flex-1 h-1.5 bg-muted/50 rounded-full appearance-none cursor-pointer accent-primary"
      />
      <span className="text-xs text-foreground tabular-nums w-10 text-right">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  )
}

export function IdeaWeightEditor() {
  const settings = useRemediationSettingsStore((s) => s.settings)
  const updateIdeaWeights = useRemediationSettingsStore((s) => s.updateIdeaWeights)

  const [localIdeaWeights, setLocalIdeaWeights] = useState<IdeaWeights>(settings.idea_weights)

  const ideaSum = Object.values(localIdeaWeights).reduce((a, b) => a + b, 0)

  const handleIdeaChange = (key: keyof IdeaWeights, value: number) => {
    const updated = { ...localIdeaWeights, [key]: value }
    setLocalIdeaWeights(updated)
    updateIdeaWeights(updated)
  }

  const normalizeIdea = () => {
    const sum = Object.values(localIdeaWeights).reduce((a, b) => a + b, 0)
    if (sum === 0) return
    const normalized: IdeaWeights = {} as IdeaWeights
    for (const [k, v] of Object.entries(localIdeaWeights)) {
      normalized[k as keyof IdeaWeights] = Math.round((v / sum) * 100) / 100
    }
    setLocalIdeaWeights(normalized)
    updateIdeaWeights(normalized)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Idea Scoring Weights</h3>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs tabular-nums ${Math.abs(ideaSum - 1) > 0.01 ? 'text-amber-400' : 'text-muted-foreground'}`}
          >
            Sum: {ideaSum.toFixed(2)}
          </span>
          {Math.abs(ideaSum - 1) > 0.01 && (
            <button
              onClick={normalizeIdea}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Normalize
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {(Object.entries(IDEA_DIMENSION_LABELS) as [keyof IdeaWeights, string][]).map(
          ([key, label]) => (
            <WeightSlider
              key={key}
              label={label}
              value={localIdeaWeights[key]}
              onChange={(v) => handleIdeaChange(key, v)}
            />
          ),
        )}
      </div>
    </div>
  )
}

export function BugWeightEditor() {
  const settings = useRemediationSettingsStore((s) => s.settings)
  const updateBugWeights = useRemediationSettingsStore((s) => s.updateBugWeights)

  const [localBugWeights, setLocalBugWeights] = useState<BugWeights>(settings.bug_weights)

  const bugSum = Object.values(localBugWeights).reduce((a, b) => a + b, 0)

  const handleBugChange = (key: keyof BugWeights, value: number) => {
    const updated = { ...localBugWeights, [key]: value }
    setLocalBugWeights(updated)
    updateBugWeights(updated)
  }

  const normalizeBug = () => {
    const sum = Object.values(localBugWeights).reduce((a, b) => a + b, 0)
    if (sum === 0) return
    const normalized: BugWeights = {} as BugWeights
    for (const [k, v] of Object.entries(localBugWeights)) {
      normalized[k as keyof BugWeights] = Math.round((v / sum) * 100) / 100
    }
    setLocalBugWeights(normalized)
    updateBugWeights(normalized)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Bug Scoring Weights</h3>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs tabular-nums ${Math.abs(bugSum - 1) > 0.01 ? 'text-amber-400' : 'text-muted-foreground'}`}
          >
            Sum: {bugSum.toFixed(2)}
          </span>
          {Math.abs(bugSum - 1) > 0.01 && (
            <button
              onClick={normalizeBug}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Normalize
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {(Object.entries(BUG_DIMENSION_LABELS) as [keyof BugWeights, string][]).map(
          ([key, label]) => (
            <WeightSlider
              key={key}
              label={label}
              value={localBugWeights[key]}
              onChange={(v) => handleBugChange(key, v)}
            />
          ),
        )}
      </div>
    </div>
  )
}

export function FeatureWeightEditor() {
  const settings = useRemediationSettingsStore((s) => s.settings)
  const updateFeatureWeights = useRemediationSettingsStore((s) => s.updateFeatureWeights)

  const [localFeatureWeights, setLocalFeatureWeights] = useState<FeatureWeights>(
    settings.feature_weights,
  )

  const featureSum = Object.values(localFeatureWeights).reduce((a, b) => a + b, 0)

  const handleFeatureChange = (key: keyof FeatureWeights, value: number) => {
    const updated = { ...localFeatureWeights, [key]: value }
    setLocalFeatureWeights(updated)
    updateFeatureWeights(updated)
  }

  const normalizeFeature = () => {
    const sum = Object.values(localFeatureWeights).reduce((a, b) => a + b, 0)
    if (sum === 0) return
    const normalized: FeatureWeights = {} as FeatureWeights
    for (const [k, v] of Object.entries(localFeatureWeights)) {
      normalized[k as keyof FeatureWeights] = Math.round((v / sum) * 100) / 100
    }
    setLocalFeatureWeights(normalized)
    updateFeatureWeights(normalized)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Feature Scoring Weights</h3>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs tabular-nums ${Math.abs(featureSum - 1) > 0.01 ? 'text-amber-400' : 'text-muted-foreground'}`}
          >
            Sum: {featureSum.toFixed(2)}
          </span>
          {Math.abs(featureSum - 1) > 0.01 && (
            <button
              onClick={normalizeFeature}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Normalize
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {(Object.entries(FEATURE_DIMENSION_LABELS) as [keyof FeatureWeights, string][]).map(
          ([key, label]) => (
            <WeightSlider
              key={key}
              label={label}
              value={localFeatureWeights[key]}
              onChange={(v) => handleFeatureChange(key, v)}
            />
          ),
        )}
      </div>
    </div>
  )
}

