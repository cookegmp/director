import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import type { Client } from '@/types'

interface ClientsState {
  clients: Client[]
  addClient: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => void
  updateClient: (id: string, patch: Partial<Client>) => void
  deleteClient: (id: string) => void
  setClients: (clients: Client[]) => void
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set) => ({
      clients: [],

      addClient: (client) => {
        const now = new Date().toISOString()
        set((state) => ({
          clients: [
            ...state.clients,
            { ...client, id: generateId(), created_at: now, updated_at: now },
          ],
        }))
      },

      updateClient: (id, patch) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...patch, updated_at: new Date().toISOString() } : c,
          ),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),

      setClients: (clients) => set({ clients }),
    }),
    { name: 'director-clients' },
  ),
)
