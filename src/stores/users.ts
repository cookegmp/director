import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole, UserStatus } from '@/types'

interface UsersState {
  users: User[]
  currentUserId: string
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastActive' | 'status'>) => void
  updateUser: (id: string, updates: Partial<User>) => void
  removeUser: (id: string) => void
  setCurrentUser: (id: string) => void
  getUser: (id: string) => User | undefined
  getCurrentUser: () => User | undefined
  changeRole: (id: string, role: UserRole) => void
  setStatus: (id: string, status: UserStatus) => void
  getAdminCount: () => number
  isLastAdmin: (id: string) => boolean
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: 'user-001',

      addUser: (userData) => {
        const now = new Date().toISOString()
        const user: User = {
          ...userData,
          id: `user-${Date.now()}`,
          status: 'active',
          lastActive: null,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ users: [...state.users, user] }))
      },

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u,
          ),
        })),

      removeUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),

      setCurrentUser: (id) => set({ currentUserId: id }),

      getUser: (id) => get().users.find((u) => u.id === id),

      getCurrentUser: () => {
        const state = get()
        return state.users.find((u) => u.id === state.currentUserId)
      },

      changeRole: (id, role) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, role, updatedAt: new Date().toISOString() } : u,
          ),
        })),

      setStatus: (id, status) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id ? { ...u, status, updatedAt: new Date().toISOString() } : u,
          ),
        })),

      getAdminCount: () =>
        get().users.filter((u) => u.role === 'admin' && u.status === 'active').length,

      isLastAdmin: (id) => {
        const state = get()
        const user = state.users.find((u) => u.id === id)
        if (!user || user.role !== 'admin') return false
        return state.users.filter((u) => u.role === 'admin' && u.status === 'active').length <= 1
      },
    }),
    { name: 'stagemanager-users' },
  ),
)
