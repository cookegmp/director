import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Idea } from '@/types';

interface IdeasState {
  ideas: Idea[];
  addIdea: (idea: Idea) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  getIdea: (id: string) => Idea | undefined;
  removeIdea: (id: string) => void;
}

export const useIdeasStore = create<IdeasState>()(
  persist(
    (set, get) => ({
      ideas: [],
      addIdea: (idea) => set((state) => ({ ideas: [...state.ideas, idea] })),
      updateIdea: (id, updates) =>
        set((state) => ({
          ideas: state.ideas.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
          ),
        })),
      getIdea: (id) => get().ideas.find((i) => i.id === id),
      removeIdea: (id) =>
        set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
    }),
    { name: 'stagemanager-ideas' }
  )
);
