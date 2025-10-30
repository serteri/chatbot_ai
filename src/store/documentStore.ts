import { create } from 'zustand'
import { Document } from '@prisma/client'
import { DocumentUploadProgress } from '@/types'

interface DocumentStore {
  // State
  documents: Document[]
  uploadProgress: Record<string, DocumentUploadProgress>
  isLoading: boolean
  
  // Actions
  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  updateDocument: (documentId: string, data: Partial<Document>) => void
  deleteDocument: (documentId: string) => void
  
  // Upload progress
  setUploadProgress: (documentId: string, progress: DocumentUploadProgress) => void
  removeUploadProgress: (documentId: string) => void
  
  setIsLoading: (loading: boolean) => void
  
  // Reset
  reset: () => void
}

const initialState = {
  documents: [],
  uploadProgress: {},
  isLoading: false,
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  ...initialState,
  
  setDocuments: (documents) => set({ documents }),
  
  addDocument: (document) => set((state) => ({
    documents: [document, ...state.documents]
  })),
  
  updateDocument: (documentId, data) => set((state) => ({
    documents: state.documents.map((doc) =>
      doc.id === documentId ? { ...doc, ...data } : doc
    )
  })),
  
  deleteDocument: (documentId) => set((state) => ({
    documents: state.documents.filter((doc) => doc.id !== documentId)
  })),
  
  setUploadProgress: (documentId, progress) => set((state) => ({
    uploadProgress: {
      ...state.uploadProgress,
      [documentId]: progress
    }
  })),
  
  removeUploadProgress: (documentId) => set((state) => {
    const { [documentId]: removed, ...rest } = state.uploadProgress
    return { uploadProgress: rest }
  }),
  
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  reset: () => set(initialState),
}))