import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EnvironmentServer, AISettings, ConnectionStatus } from '@/types'
import { useScaffoldingStore } from '@/stores/scaffolding'
import { useDevSettingsStore } from '@/stores/dev-settings'

const ANTHROPIC_REPLACEMENT_MAP: Record<string, string> = {
  'anthropic/claude-sonnet-4': 'openai/gpt-4o',
  'anthropic/claude-opus': 'openai/gpt-4o',
  'anthropic/claude-haiku': 'openai/gpt-4o-mini',
}

function isAnthropicModel(model: string): boolean {
  return model.startsWith('anthropic/')
}

type ModelKey = Extract<keyof AISettings, `${string}Model`>

const MODEL_KEYS: readonly ModelKey[] = [
  'charterModel',
  'executionPlanModel',
  'scoringModel',
  'conversationModel',
  'bugScoringModel',
  'featureScoringModel',
  'ideaChatModel',
  'abstractionModel',
]

function replaceAnthropicModels(settings: AISettings): void {
  for (const key of MODEL_KEYS) {
    const current = settings[key]
    if (isAnthropicModel(current)) {
      settings[key] = ANTHROPIC_REPLACEMENT_MAP[current] || 'openai/gpt-4o'
    }
  }
}

interface SettingsState {
  servers: EnvironmentServer[]
  aiSettings: AISettings
  updateServer: (id: string, updates: Partial<EnvironmentServer>) => void
  setConnectionStatus: (id: string, status: ConnectionStatus, errorMessage?: string | null) => void
  testConnection: (id: string) => Promise<void>
  updateAISettings: (updates: Partial<AISettings>) => void
  verifyApiKey: () => Promise<void>
  setVerbosity: (level: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      servers: [],
      aiSettings: {
        openrouterApiKey: '',
        keyStatus: 'unconfigured',
        charterModel: 'anthropic/claude-sonnet-4',
        charterEnabled: true,
        executionPlanModel: 'anthropic/claude-sonnet-4',
        executionPlanEnabled: true,
        scoringModel: 'anthropic/claude-haiku',
        scoringEnabled: true,
        conversationModel: 'anthropic/claude-sonnet-4',
        conversationEnabled: true,
        bugScoringModel: 'anthropic/claude-haiku',
        bugScoringEnabled: true,
        featureScoringModel: 'anthropic/claude-haiku',
        featureScoringEnabled: true,
        ideaChatModel: 'anthropic/claude-sonnet-4',
        ideaChatEnabled: true,
        abstractionModel: 'anthropic/claude-haiku',
        abstractionEnabled: true,
        translationVerbosity: 3,
        zeroDataRetention: false,
        dowCompliance: false,
      },

      updateServer: (id, updates) =>
        set((state) => ({
          servers: state.servers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      setConnectionStatus: (id, status, errorMessage = null) =>
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === id
              ? {
                  ...s,
                  connectionStatus: status,
                  errorMessage,
                  lastTested: new Date().toISOString(),
                }
              : s,
          ),
        })),

      testConnection: async (id) => {
        const server = get().servers.find((s) => s.id === id)
        if (!server) return

        // Simulate connection test (prototype)
        get().setConnectionStatus(id, 'disconnected')
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // If host is configured, simulate success; otherwise error
        if (server.host.trim()) {
          get().setConnectionStatus(id, 'connected')
        } else {
          get().setConnectionStatus(id, 'error', 'No host configured')
        }
      },

      updateAISettings: (updates) =>
        set((state) => {
          const prev = state.aiSettings
          const next = { ...prev, ...updates }

          // --- DoW Compliance enforcement ---

          // Turning DoW ON
          if (updates.dowCompliance === true && !prev.dowCompliance) {
            next.zeroDataRetention = true
            replaceAnthropicModels(next)

            // Switch dev portal away from Claude
            const devSettings = useDevSettingsStore.getState()
            if (devSettings.model === 'claude') {
              devSettings.setModel('gemini')
            }

            // Inject DoW scaffolding document
            const scaffolding = useScaffoldingStore.getState()
            if (!scaffolding.getByType('dow-compliance')) {
              scaffolding.setDocuments([
                ...scaffolding.documents,
                {
                  id: 'scaff-dow-compliance',
                  type: 'dow-compliance',
                  title: 'DoW Compliance Policy',
                  content:
                    'This platform operates under Department of War compliance requirements. Only approved AI vendors (OpenAI, Google, Meta, Mistral) may be used. Zero Data Retention is mandatory. All AI interactions must be auditable.',
                  lastUpdated: new Date().toISOString(),
                },
              ])
            }
          } else if (updates.dowCompliance === false && prev.dowCompliance) {
            // Turning DoW OFF — remove scaffolding document
            const scaffolding = useScaffoldingStore.getState()
            scaffolding.setDocuments(
              scaffolding.documents.filter((d) => d.type !== 'dow-compliance'),
            )
          } else if (next.dowCompliance) {
            // DoW already active — block any Anthropic model being set
            replaceAnthropicModels(next)
          }

          // Block ZDR from being disabled while DoW is active
          if (next.dowCompliance && updates.zeroDataRetention === false) {
            next.zeroDataRetention = true
          }

          return { aiSettings: next }
        }),

      verifyApiKey: async () => {
        const { aiSettings } = get()
        // Simulate verification (prototype)
        set((state) => ({
          aiSettings: { ...state.aiSettings, keyStatus: 'unconfigured' },
        }))
        await new Promise((resolve) => setTimeout(resolve, 1200))

        if (aiSettings.openrouterApiKey.startsWith('sk-or-')) {
          set((state) => ({
            aiSettings: { ...state.aiSettings, keyStatus: 'valid' },
          }))
        } else if (aiSettings.openrouterApiKey.trim()) {
          set((state) => ({
            aiSettings: { ...state.aiSettings, keyStatus: 'invalid' },
          }))
        } else {
          set((state) => ({
            aiSettings: { ...state.aiSettings, keyStatus: 'unconfigured' },
          }))
        }
      },

      setVerbosity: (level) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, translationVerbosity: level },
        })),
    }),
    { name: 'stagemanager-settings' },
  ),
)
