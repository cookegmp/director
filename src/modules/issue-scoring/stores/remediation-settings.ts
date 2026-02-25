// ============================================================================
// Issue Scoring — Remediation Settings Store
// ============================================================================
// Admin-configurable settings for thresholds, weights, and environments.
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RemediationSettings, BugWeights, FeatureWeights } from '../types';
import { DEFAULT_REMEDIATION_SETTINGS } from '../types';

interface RemediationSettingsState {
  settings: RemediationSettings;
  updateSettings: (updates: Partial<RemediationSettings>) => void;
  updateBugWeights: (weights: Partial<BugWeights>) => void;
  updateFeatureWeights: (weights: Partial<FeatureWeights>) => void;
  resetDefaults: () => void;
}

export const useRemediationSettingsStore = create<RemediationSettingsState>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_REMEDIATION_SETTINGS },

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      updateBugWeights: (weights) =>
        set((state) => ({
          settings: {
            ...state.settings,
            bug_weights: { ...state.settings.bug_weights, ...weights },
          },
        })),

      updateFeatureWeights: (weights) =>
        set((state) => ({
          settings: {
            ...state.settings,
            feature_weights: { ...state.settings.feature_weights, ...weights },
          },
        })),

      resetDefaults: () =>
        set({ settings: { ...DEFAULT_REMEDIATION_SETTINGS } }),
    }),
    { name: 'stagemanager-remediation-settings' }
  )
);
