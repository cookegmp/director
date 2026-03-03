import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Idea, IdeaStatus } from '@/types'

interface IdeasState {
  ideas: Idea[]
  addIdea: (idea: Idea) => void
  updateIdea: (id: string, updates: Partial<Idea>) => void
  getIdea: (id: string) => Idea | undefined
  removeIdea: (id: string) => void
  reorderIdeas: (status: IdeaStatus, orderedIds: string[]) => void
  moveIdea: (id: string, newStatus: IdeaStatus, newIndex: number) => void
}

export const useIdeasStore = create<IdeasState>()(
  persist(
    (set, get) => ({
      ideas: [],
      addIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),
      updateIdea: (id, updates) =>
        set((state) => ({
          ideas: state.ideas.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i,
          ),
        })),
      getIdea: (id) => get().ideas.find((i) => i.id === id),
      removeIdea: (id) => set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
      reorderIdeas: (status, orderedIds) =>
        set((state) => ({
          ideas: state.ideas.map((idea) => {
            if (idea.status !== status) return idea
            const idx = orderedIds.indexOf(idea.id)
            if (idx === -1) return idea
            return { ...idea, sortOrder: idx }
          }),
        })),
      moveIdea: (id, newStatus, newIndex) =>
        set((state) => {
          // Get all ideas in the destination column, sorted by sortOrder
          const destIdeas = state.ideas
            .filter((i) => i.status === newStatus && i.id !== id)
            .sort((a, b) => a.sortOrder - b.sortOrder)

          // Insert the moved idea at the new index
          const destIds = destIdeas.map((i) => i.id)
          destIds.splice(newIndex, 0, id)

          return {
            ideas: state.ideas.map((idea) => {
              if (idea.id === id) {
                return {
                  ...idea,
                  status: newStatus,
                  sortOrder: newIndex,
                  updatedAt: new Date().toISOString(),
                }
              }
              // Reassign sortOrder for all ideas in the destination column
              if (idea.status === newStatus) {
                const idx = destIds.indexOf(idea.id)
                if (idx !== -1) return { ...idea, sortOrder: idx }
              }
              return idea
            }),
          }
        }),
    }),
    { name: 'stagemanager-ideas' },
  ),
)
