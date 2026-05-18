'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import {
  DIALOG_ICON_BOX_CLASS,
  DIALOG_ICON_CLASS,
  DIALOG_TITLE_CLASS,
} from '@/src/components/modals/app-dialog'
import { useClientMounted } from '@/src/hooks/use-client-mounted'

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
    <AlertDialog
      open
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <AlertDialogContent className="flex flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-lg">
        <AlertDialogHeader className="border-b border-border px-6 py-4 text-left">
          <div className="flex items-center gap-3">
            {HeaderIcon ? (
              <div className={DIALOG_ICON_BOX_CLASS} aria-hidden>
                <HeaderIcon className={DIALOG_ICON_CLASS} />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <AlertDialogTitle className={cn('text-left', DIALOG_TITLE_CLASS)}>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5">{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 border-t border-border px-6 py-4">
          <AlertDialogCancel className="border-border" onClick={onClose}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(destructive && 'bg-destructive text-destructive-foreground hover:bg-destructive/90')}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
