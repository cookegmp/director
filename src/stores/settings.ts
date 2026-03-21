import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  openrouter_api_key: string
  selected_models: Record<string, string>
  mock_mode: boolean
  setApiKey: (key: string) => void
  setModel: (fn: string, model: string) => void
  setMockMode: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openrouter_api_key: '',
      selected_models: {
        interview_wizard: 'anthropic/claude-sonnet-4-5-20250929',
        ocai_builder: 'anthropic/claude-sonnet-4-5-20250929',
        extraction: 'anthropic/claude-haiku',
      },
      mock_mode: import.meta.env.VITE_USE_MOCK_DATA === 'true',

      setApiKey: (key) => set({ openrouter_api_key: key }),

      setModel: (fn, model) =>
        set((state) => ({
          selected_models: { ...state.selected_models, [fn]: model },
        })),

      setMockMode: (enabled) => set({ mock_mode: enabled }),
    }),
    { name: 'director-settings' },
  ),
)
