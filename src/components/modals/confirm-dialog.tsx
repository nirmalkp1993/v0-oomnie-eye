'use client'

import type { LucideIcon } from 'lucide-react'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import { AlertTriangle } from 'lucide-react'
import { Box, Button } from '@mui/material'
import { useClientMounted } from '@/src/hooks/use-client-mounted'
import { EarthDialogShell } from './earth-dialog-shell'
import { DIALOG_ICON_BOX_CLASS, DIALOG_ICON_CLASS } from './app-dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  icon?: LucideIcon
  onClose: () => void
  onConfirm: () => void
}

function ConfirmDialogIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Box
      className={DIALOG_ICON_BOX_CLASS}
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
      }}
      aria-hidden
    >
      <Icon className={DIALOG_ICON_CLASS} />
    </Box>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  icon,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const mounted = useClientMounted()
  const HeaderIcon = icon ?? (destructive ? AlertTriangle : undefined)

  if (!mounted || !open) return null

  return (
    <EarthDialogShell
      open
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="lg"
      headerIcon={HeaderIcon ? <ConfirmDialogIcon icon={HeaderIcon} /> : undefined}
      footer={
        <>
          <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="contained"
            color={destructive ? 'error' : 'primary'}
            startIcon={<CheckIcon />}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Box sx={{ px: 3, py: 1 }} />
    </EarthDialogShell>
  )
}
