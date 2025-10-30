import { create } from 'zustand'
import { Chatbot, Document } from '@prisma/client'

interface ChatbotStore {
  // Current State
  chatbots: Chatbot[]
  currentChatbot: Chatbot | null
  isLoading: boolean
  
  // Actions
  setChatbots: (chatbots: Chatbot[]) => void
  setCurrentChatbot: (chatbot: Chatbot | null) => void
  addChatbot: (chatbot: Chatbot) => void
  updateChatbot: (chatbotId: string, data: Partial<Chatbot>) => void
  deleteChatbot: (chatbotId: string) => void
  setIsLoading: (loading: boolean) => void
  
  // Reset
  reset: () => void
}

const initialState = {
  chatbots: [],
  currentChatbot: null,
  isLoading: false,
}

export const useChatbotStore = create<ChatbotStore>((set) => ({
  ...initialState,
  
  setChatbots: (chatbots) => set({ chatbots }),
  
  setCurrentChatbot: (chatbot) => set({ currentChatbot: chatbot }),
  
  addChatbot: (chatbot) => set((state) => ({
    chatbots: [chatbot, ...state.chatbots]
  })),
  
  updateChatbot: (chatbotId, data) => set((state) => ({
    chatbots: state.chatbots.map((bot) =>
      bot.id === chatbotId ? { ...bot, ...data } : bot
    ),
    currentChatbot: state.currentChatbot?.id === chatbotId
      ? { ...state.currentChatbot, ...data }
      : state.currentChatbot
  })),
  
  deleteChatbot: (chatbotId) => set((state) => ({
    chatbots: state.chatbots.filter((bot) => bot.id !== chatbotId),
    currentChatbot: state.currentChatbot?.id === chatbotId 
      ? null 
      : state.currentChatbot
  })),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  reset: () => set(initialState),
}))