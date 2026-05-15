'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Card-style surface aligned with shadcn `Card` / Camera tables: border, radius, subtle shadow */
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
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}
