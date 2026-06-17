import { useUserAuditStore } from '@/lib/user-audit-store'
import type { UserAuditCategory } from '@/src/types/user-management'

function logUserAuditEvent(
  userId: string,
  actionType: string,
  description: string,
  details: string,
  category: UserAuditCategory,
) {
  useUserAuditStore.getState().append(userId, { actionType, description, details, category })
}

export function logUserAdded(userId: string, userName: string) {
  logUserAuditEvent(
    userId,
    'User Added',
    'New user account created',
    `users / ${userName}`,
    'user_lifecycle',
  )
}

export function logUserUpdated(userId: string, userName: string) {
  logUserAuditEvent(
    userId,
    'User Updated',
    'User profile updated',
    `users / ${userName}`,
    'user_lifecycle',
  )
}

export function logUserRetired(userId: string, userName: string) {
  logUserAuditEvent(
    userId,
    'User Updated',
    'User account retired',
    `users / ${userName}`,
    'user_lifecycle',
  )
}

export function logUserRemoved(userId: string, userName: string) {
  logUserAuditEvent(
    userId,
    'User Removed',
    'User temporarily deactivated (access revoked)',
    `users / ${userName}`,
    'user_delete',
  )
}

export function formatAuditDate(date: string): string {
  const parsed = Date.parse(date)
  if (Number.isNaN(parsed)) return date

  return new Date(parsed).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
