import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SafeUser, UserWithSubscription } from '@/types'

interface AuthState {
  user: UserWithSubscription | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: UserWithSubscription | null) => void
  updateUser: (user: Partial<UserWithSubscription>) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => 
        set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)