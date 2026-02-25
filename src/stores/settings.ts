import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnvironmentServer, AISettings, ConnectionStatus } from '@/types';

interface SettingsState {
  servers: EnvironmentServer[];
  aiSettings: AISettings;
  updateServer: (id: string, updates: Partial<EnvironmentServer>) => void;
  setConnectionStatus: (id: string, status: ConnectionStatus, errorMessage?: string | null) => void;
  testConnection: (id: string) => Promise<void>;
  updateAISettings: (updates: Partial<AISettings>) => void;
  verifyApiKey: () => Promise<void>;
  setVerbosity: (level: number) => void;
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
        scoringModel: 'anthropic/claude-haiku',
        scoringEnabled: true,
        abstractionModel: 'anthropic/claude-haiku',
        abstractionEnabled: true,
        translationVerbosity: 3,
      },

      updateServer: (id, updates) =>
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      setConnectionStatus: (id, status, errorMessage = null) =>
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === id
              ? { ...s, connectionStatus: status, errorMessage, lastTested: new Date().toISOString() }
              : s
          ),
        })),

      testConnection: async (id) => {
        const server = get().servers.find((s) => s.id === id);
        if (!server) return;

        // Simulate connection test (prototype)
        get().setConnectionStatus(id, 'disconnected');
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // If host is configured, simulate success; otherwise error
        if (server.host.trim()) {
          get().setConnectionStatus(id, 'connected');
        } else {
          get().setConnectionStatus(id, 'error', 'No host configured');
        }
      },

      updateAISettings: (updates) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, ...updates },
        })),

      verifyApiKey: async () => {
        const { aiSettings } = get();
        // Simulate verification (prototype)
        set((state) => ({
          aiSettings: { ...state.aiSettings, keyStatus: 'unconfigured' },
        }));
        await new Promise((resolve) => setTimeout(resolve, 1200));

        if (aiSettings.openrouterApiKey.startsWith('sk-or-')) {
          set((state) => ({
            aiSettings: { ...state.aiSettings, keyStatus: 'valid' },
          }));
        } else if (aiSettings.openrouterApiKey.trim()) {
          set((state) => ({
            aiSettings: { ...state.aiSettings, keyStatus: 'invalid' },
          }));
        } else {
          set((state) => ({
            aiSettings: { ...state.aiSettings, keyStatus: 'unconfigured' },
          }));
        }
      },

      setVerbosity: (level) =>
        set((state) => ({
          aiSettings: { ...state.aiSettings, translationVerbosity: level },
        })),
    }),
    { name: 'stagemanager-settings' }
  )
);
