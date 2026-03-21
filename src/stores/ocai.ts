import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import type { OCAIAssessment } from '@/types'

interface OcaiState {
  assessments: OCAIAssessment[]
  addAssessment: (assessment: Omit<OCAIAssessment, 'id'>) => void
  updateAssessment: (id: string, patch: Partial<OCAIAssessment>) => void
  deleteAssessment: (id: string) => void
  setAssessments: (assessments: OCAIAssessment[]) => void
  getAssessmentsByEngagementId: (engagementId: string) => OCAIAssessment[]
}

export const useOcaiStore = create<OcaiState>()(
  persist(
    (set, get) => ({
      assessments: [],

      addAssessment: (assessment) =>
        set((state) => ({
          assessments: [...state.assessments, { ...assessment, id: generateId() }],
        })),

      updateAssessment: (id, patch) =>
        set((state) => ({
          assessments: state.assessments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      deleteAssessment: (id) =>
        set((state) => ({
          assessments: state.assessments.filter((a) => a.id !== id),
        })),

      setAssessments: (assessments) => set({ assessments }),

      getAssessmentsByEngagementId: (engagementId) =>
        get().assessments.filter((a) => a.engagement_id === engagementId),
    }),
    { name: 'director-ocai' },
  ),
)
