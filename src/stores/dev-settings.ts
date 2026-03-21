import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Environment = 'dsp' | 'development' | 'production'
export type Model = 'claude' | 'gemini' | 'codex'

interface DevSettingsState {
  environment: Environment
  model: Model
  setEnvironment: (env: Environment) => void
  setModel: (model: Model) => void
}

export const useDevSettingsStore = create<DevSettingsState>()(
  persist(
    (set) => ({
      environment: 'development',
      model: 'claude',
      setEnvironment: (environment) => set({ environment }),
      setModel: (model) => set({ model }),
    }),
    { name: 'control-dev-settings' },
  ),
)
