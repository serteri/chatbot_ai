'use client'

import { Toaster as HotToaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'

export function ToastProvider() {
  return (
    <>
      {/* Legacy react-hot-toast — used in older components */}
      <HotToaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Sonner — used in Validator, RemediationPlan, and new components */}
      <SonnerToaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
        }}
      />
    </>
  )
}