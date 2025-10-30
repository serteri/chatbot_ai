import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Language
  language: string
  setLanguage: (language: string) => void
  
  // Mobile
  isMobile: boolean
  setIsMobile: (mobile: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      theme: 'system',
      language: 'tr',
      isMobile: false,
      
      // Actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setIsMobile: (mobile) => set({ isMobile: mobile }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)