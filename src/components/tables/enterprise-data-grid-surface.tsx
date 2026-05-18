'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Card-style surface aligned with Camera / Report explorer list tables */
export function EnterpriseDataGridSurface({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground',
        className
      )}
    >
      {children}
    </div>
  )
}
