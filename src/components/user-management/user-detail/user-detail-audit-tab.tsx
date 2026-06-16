'use client'

import { UserAuditTrailPanel } from '@/src/components/user-management/user-audit-trail-panel'
import type { UserListItem } from '@/src/types/user-management'

export function UserDetailAuditTab({ user }: { user: UserListItem }) {
  return <UserAuditTrailPanel userId={user.id} />
}
