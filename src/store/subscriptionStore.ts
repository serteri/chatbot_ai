import { create } from 'zustand'
import { Subscription } from '@prisma/client'
import { SubscriptionPlan } from '@/types'

interface SubscriptionStore {
  subscription: Subscription | null
  isLoading: boolean
  
  // Actions
  setSubscription: (subscription: Subscription | null) => void
  setIsLoading: (loading: boolean) => void
  
  // Helpers
  getPlan: () => SubscriptionPlan
  canSendMessage: () => boolean
  getMessagesRemaining: () => number
  getStorageRemaining: () => number
  
  // Reset
  reset: () => void
}

const initialState = {
  subscription: null,
  isLoading: false,
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  ...initialState,
  
  setSubscription: (subscription) => set({ subscription }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  getPlan: () => {
    const { subscription } = get()
    return (subscription?.plan as SubscriptionPlan) || 'free'
  },
  
  canSendMessage: () => {
    const { subscription } = get()
    if (!subscription) return true // Free plan
    
    if (subscription.messageLimit === -1) return true // Unlimited
    
    return subscription.messagesUsed < subscription.messageLimit
  },
  
  getMessagesRemaining: () => {
    const { subscription } = get()
    if (!subscription) return 20 // Free plan default
    
    if (subscription.messageLimit === -1) return -1 // Unlimited
    
    return Math.max(0, subscription.messageLimit - subscription.messagesUsed)
  },
  
  getStorageRemaining: () => {
    const { subscription } = get()
    if (!subscription) return 0
    
    if (subscription.storageLimit === -1) return -1 // Unlimited
    
    // Convert MB to GB and calculate remaining
    const usedGB = subscription.storageUsed / 1024
    return Math.max(0, subscription.storageLimit - usedGB)
  },
  
  reset: () => set(initialState),
}))