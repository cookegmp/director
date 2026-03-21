import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import type { ScaffoldingPackage } from '@/types'

interface ScaffoldingState {
  packages: ScaffoldingPackage[]
  addPackage: (pkg: Omit<ScaffoldingPackage, 'id'>) => void
  updatePackage: (id: string, patch: Partial<ScaffoldingPackage>) => void
  updateSection: (
    packageId: string,
    sectionKey: string,
    data: Record<string, unknown>,
  ) => void
  setPackages: (packages: ScaffoldingPackage[]) => void
  getPackageByEngagementId: (engagementId: string) => ScaffoldingPackage | undefined
}

export const useScaffoldingStore = create<ScaffoldingState>()(
  persist(
    (set, get) => ({
      packages: [],

      addPackage: (pkg) =>
        set((state) => ({
          packages: [...state.packages, { ...pkg, id: generateId() }],
        })),

      updatePackage: (id, patch) =>
        set((state) => ({
          packages: state.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      updateSection: (packageId, sectionKey, data) =>
        set((state) => ({
          packages: state.packages.map((p) =>
            p.id === packageId ? { ...p, [sectionKey]: data } : p,
          ),
        })),

      setPackages: (packages) => set({ packages }),

      getPackageByEngagementId: (engagementId) =>
        get().packages.find((p) => p.engagement_id === engagementId),
    }),
    { name: 'director-scaffolding' },
  ),
)
