'use client'

import type { ReactNode } from 'react'
import { EnterprisePageShell } from '@/src/components/enterprise'

/** User Management pages — same shell as Settings / Reports / Camera modules */
export function UserManagementPageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <EnterprisePageShell title={title} description={description} actions={actions}>
      {children}
    </EnterprisePageShell>
  )
}
