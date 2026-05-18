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
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {Icon ? <Icon className="size-5 shrink-0 text-primary" aria-hidden /> : null}
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">{title}</DialogDescription>
          )}
        </DialogHeader>
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
