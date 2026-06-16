'use client'

import { useImpersonationStore } from '@/lib/impersonation-store'

export function ImpersonationBanner() {
  const impersonatedUser = useImpersonationStore((state) => state.impersonatedUser)
  const clearImpersonation = useImpersonationStore((state) => state.clearImpersonation)

  if (!impersonatedUser) return null

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-sm text-amber-950 dark:text-amber-100">
      <span>
        Impersonating <strong>{impersonatedUser.name}</strong>
        <span className="ml-2 text-muted-foreground">({impersonatedUser.email})</span>
      </span>
      <button
        type="button"
        onClick={clearImpersonation}
        className="rounded-md border border-amber-600/40 px-2.5 py-1 text-xs font-medium hover:bg-amber-500/20"
      >
        Exit impersonation
      </button>
    </div>
  )
}
