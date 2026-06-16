import { useUserAuditStore } from '@/lib/user-audit-store'
import type { UserAuditCategory } from '@/src/types/user-management'

function logUserAuditEvent(
  userId: string,
  action: string,
  category: UserAuditCategory,
  context: string,
) {
  useUserAuditStore.getState().append(userId, { action, category, context })
}

export function logUserAdded(userId: string, userName: string) {
  logUserAuditEvent(userId, 'User added', 'user_lifecycle', `users / ${userName}`)
}

export function logUserUpdated(userId: string, userName: string) {
  logUserAuditEvent(userId, 'User updated', 'user_lifecycle', `users / ${userName}`)
}

export function logUserRetired(userId: string, userName: string) {
  logUserAuditEvent(userId, 'User retired', 'user_lifecycle', `users / ${userName}`)
}

export function logUserRemoved(userId: string, userName: string) {
  logUserAuditEvent(userId, 'User removed', 'user_delete', `users / ${userName}`)
}

export function formatAuditDate(date: string): string {
  const parsed = Date.parse(date)
  if (Number.isNaN(parsed)) return date

  return new Date(parsed).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
