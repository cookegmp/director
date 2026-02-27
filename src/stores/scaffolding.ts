import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ScaffoldingDocument } from '@/types'

interface ScaffoldingState {
  documents: ScaffoldingDocument[]
  setDocuments: (docs: ScaffoldingDocument[]) => void
  getByType: (type: string) => ScaffoldingDocument | undefined
}

export const useScaffoldingStore = create<ScaffoldingState>()(
  persist(
    (set, get) => ({
      documents: [],
      setDocuments: (docs) => set({ documents: docs }),
      getByType: (type) => get().documents.find((d) => d.type === type),
    }),
    { name: 'stagemanager-scaffolding' },
  ),
)
