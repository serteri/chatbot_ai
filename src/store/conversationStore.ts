
import { create } from 'zustand'
import { Conversation, ConversationMessage } from '@prisma/client'
import { ConversationWithMessages } from '@/types'

interface ConversationStore {
  // State
  conversations: Conversation[]
  currentConversation: ConversationWithMessages | null
  isLoading: boolean
  
  // Actions
  setConversations: (conversations: Conversation[]) => void
  setCurrentConversation: (conversation: ConversationWithMessages | null) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (conversationId: string, data: Partial<Conversation>) => void
  deleteConversation: (conversationId: string) => void
  
  // Messages
  addMessage: (message: ConversationMessage) => void
  
  setIsLoading: (loading: boolean) => void
  
  // Reset
  reset: () => void
}

const initialState = {
  conversations: [],
  currentConversation: null,
  isLoading: false,
}

export const useConversationStore = create<ConversationStore>((set) => ({
  ...initialState,
  
  setConversations: (conversations) => set({ conversations }),
  
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations]
  })),
  
  updateConversation: (conversationId, data) => set((state) => ({
    conversations: state.conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, ...data } : conv
    ),
    currentConversation: state.currentConversation?.id === conversationId
      ? { ...state.currentConversation, ...data }
      : state.currentConversation
  })),
  
  deleteConversation: (conversationId) => set((state) => ({
    conversations: state.conversations.filter((conv) => conv.id !== conversationId),
    currentConversation: state.currentConversation?.id === conversationId
      ? null
      : state.currentConversation
  })),
  
  addMessage: (message) => set((state) => {
    if (!state.currentConversation) return state
    
    return {
      currentConversation: {
        ...state.currentConversation,
        messages: [...state.currentConversation.messages, message]
      }
    }
  }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  reset: () => set(initialState),
}))