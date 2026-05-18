'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useClientMounted } from '@/src/hooks/use-client-mounted'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const maxWidthClass = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
} as const

export type AppDialogMaxWidth = keyof typeof maxWidthClass

export const DIALOG_INPUT_CLASS =
  'border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary'

export const DIALOG_LABEL_CLASS = 'text-accent'

export const DIALOG_TITLE_CLASS = 'text-xl font-semibold leading-none text-orange-500'

export const DIALOG_ICON_BOX_CLASS =
  'flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary'

export const DIALOG_ICON_CLASS = 'size-5 text-primary-foreground'

interface AppDialogHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  srOnlyTitle?: string
}

export function AppDialogHeader({ title, description, icon: Icon, srOnlyTitle }: AppDialogHeaderProps) {
  const a11yTitle = srOnlyTitle ?? title

  return (
    <DialogHeader className="border-b border-border px-6 py-4 text-left">
      <div className="flex items-center gap-3">
        {Icon ? (
          <div className={DIALOG_ICON_BOX_CLASS} aria-hidden>
            <Icon className={DIALOG_ICON_CLASS} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <DialogTitle className={cn('text-left', DIALOG_TITLE_CLASS)}>{title}</DialogTitle>
          {description ? (
            <DialogDescription className="mt-1.5">{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{a11yTitle}</DialogDescription>
          )}
        </div>
      </div>
    </DialogHeader>
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
  maxWidth = 'lg',
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
        <Button type="button" variant="outline" className="border-border" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          disabled={confirmDisabled}
          variant={confirmDestructive ? 'destructive' : 'default'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </>
    ) : null

  const resolvedFooter = footer ?? defaultFooter

  if (!mounted || !open) return null

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          'flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border bg-card p-0',
          maxWidthClass[maxWidth]
        )}
      >
        <AppDialogHeader title={title} description={description} icon={Icon} />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {!hideFooter && resolvedFooter ? (
          <DialogFooter className="gap-2 border-t border-border px-6 py-4">{resolvedFooter}</DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
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
    <div className={cn('w-full space-y-2', className)}>
      <Label htmlFor={htmlFor} className={DIALOG_LABEL_CLASS}>
        {label}
        {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  )
}
