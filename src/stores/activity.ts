import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity } from '@/types';

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      activities: [],
      addActivity: (activity) =>
        set((state) => ({ activities: [activity, ...state.activities] })),
    }),
    { name: 'stagemanager-activity' }
  )
);
