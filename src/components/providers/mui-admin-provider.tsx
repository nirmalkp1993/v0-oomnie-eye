'use client'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { type ReactNode } from 'react'
import { muiAdminTheme } from '@/src/components/theme/mui-admin-theme'
import { AdminSnackbarProvider } from '@/src/hooks/use-admin-snackbar'

export function MuiAdminProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={muiAdminTheme}>
      <CssBaseline />
      <AdminSnackbarProvider>{children}</AdminSnackbarProvider>
    </ThemeProvider>
  )
}
