'use client'

import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Box, Button } from '@mui/material'
import { useClientMounted } from '@/src/hooks/use-client-mounted'
import { EarthDialogShell } from './earth-dialog-shell'
import { earthDialogMaxWidthPx, type EarthDialogMaxWidth } from './earth-dialog-constants'

export type AppDialogMaxWidth = EarthDialogMaxWidth

/** @deprecated Use MUI TextField inside earth-themed dialogs */
export const DIALOG_INPUT_CLASS =
  'border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary'

export const DIALOG_LABEL_CLASS = 'text-accent'

export const DIALOG_TITLE_CLASS = 'text-xl font-semibold leading-none text-orange-500'

export const DIALOG_ICON_BOX_CLASS =
  'flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary'

export const DIALOG_ICON_CLASS = 'size-5 text-primary-foreground'

function DialogHeaderIcon({ icon: Icon }: { icon: LucideIcon }) {
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

interface AppDialogHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  srOnlyTitle?: string
}

/** @deprecated Header is rendered by EarthDialogShell; kept for role-permissions migration */
export function AppDialogHeader({ title, description, icon: Icon }: AppDialogHeaderProps) {
  return (
    <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {Icon ? <DialogHeaderIcon icon={Icon} /> : null}
        <Box>
          <Box component="h2" className={DIALOG_TITLE_CLASS}>
            {title}
          </Box>
          {description ? (
            <Box component="p" sx={{ mt: 0.75, fontSize: '0.875rem', color: 'text.secondary' }}>
              {description}
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}

interface AppDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: LucideIcon
  maxWidth?: AppDialogMaxWidth
  children: ReactNode
  footer?: ReactNode
  cancelLabel?: string
  confirmLabel?: string
  onConfirm?: () => void
  confirmDisabled?: boolean
  confirmDestructive?: boolean
  hideFooter?: boolean
}

export function AppDialog({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  maxWidth = '4xl',
  children,
  footer,
  cancelLabel = 'Cancel',
  confirmLabel,
  onConfirm,
  confirmDisabled,
  confirmDestructive,
  hideFooter,
}: AppDialogProps) {
  const mounted = useClientMounted()

  const defaultFooter =
    confirmLabel != null ? (
      <>
        <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          disabled={confirmDisabled}
          variant="contained"
          color={confirmDestructive ? 'error' : 'primary'}
          startIcon={<CheckIcon />}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </>
    ) : null

  const resolvedFooter = footer ?? defaultFooter

  if (!mounted || !open) return null

  return (
    <EarthDialogShell
      open
      onClose={onClose}
      title={title}
      description={description}
      maxWidth={maxWidth}
      headerIcon={Icon ? <DialogHeaderIcon icon={Icon} /> : undefined}
      footer={!hideFooter && resolvedFooter ? resolvedFooter : undefined}
    >
      <Box sx={{ px: 3, py: 2 }}>{children}</Box>
    </EarthDialogShell>
  )
}

interface DialogFormFieldProps {
  label: string
  htmlFor?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function DialogFormField({ label, htmlFor, error, required, children, className }: DialogFormFieldProps) {
  return (
    <Box className={className} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box
        component="label"
        htmlFor={htmlFor}
        sx={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'warning.main',
        }}
      >
        {label}
        {required ? (
          <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>
            *
          </Box>
        ) : null}
      </Box>
      {children}
      {error ? (
        <Box component="p" sx={{ fontSize: '0.875rem', color: 'error.main', m: 0 }}>
          {error}
        </Box>
      ) : null}
    </Box>
  )
}

export { earthDialogMaxWidthPx }
