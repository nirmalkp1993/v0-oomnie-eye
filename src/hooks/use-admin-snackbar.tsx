'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Alert, Snackbar } from '@mui/material'

type Severity = 'success' | 'info' | 'warning' | 'error'

interface AdminSnackbarContextValue {
  showMessage: (message: string, severity?: Severity) => void
}

const AdminSnackbarContext = createContext<AdminSnackbarContextValue | null>(null)

export function AdminSnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<Severity>('success')

  const showMessage = useCallback((msg: string, sev: Severity = 'success') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ showMessage }), [showMessage])

  return (
    <AdminSnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4200}
        onClose={(_, reason) => {
          if (reason === 'clickaway') return
          setOpen(false)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="standard"
          sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 24px rgba(15, 23, 41, 0.12)' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </AdminSnackbarContext.Provider>
  )
}

export function useAdminSnackbar() {
  const ctx = useContext(AdminSnackbarContext)
  if (!ctx) {
    throw new Error('useAdminSnackbar must be used within AdminSnackbarProvider')
  }
  return ctx
}
