'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useImpersonationStore } from '@/lib/impersonation-store'

export default function ImpersonatePage() {
  const router = useRouter()
  const startImpersonation = useImpersonationStore((state) => state.startImpersonation)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('userId')
    if (userId) startImpersonation(userId)
    router.replace('/')
  }, [router, startImpersonation])

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Starting impersonation session…</p>
    </div>
  )
}
