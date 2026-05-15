'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Matches {@link CameraManagement} shell: `p-6`, accent title, muted subtitle.
 */
export function UserManagementPageShell({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-6 bg-background p-6 text-foreground', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-accent">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  )
}
