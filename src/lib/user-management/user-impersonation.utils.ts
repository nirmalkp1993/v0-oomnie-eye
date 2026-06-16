import type { UserListItem } from '@/src/types/user-management'

export function buildImpersonationUrl(userId: string): string {
  const encoded = encodeURIComponent(userId)
  if (typeof window === 'undefined') {
    return `/impersonate?userId=${encoded}`
  }
  return `${window.location.origin}/impersonate?userId=${encoded}`
}

export function openUserImpersonationTab(user: UserListItem): void {
  window.open(buildImpersonationUrl(user.id), '_blank', 'noopener,noreferrer')
}
