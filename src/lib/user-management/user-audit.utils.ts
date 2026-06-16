import { USER_AUDIT_CATEGORIES } from '@/src/constants/user-audit-categories'
import type { UserAuditCategory, UserAuditEntry } from '@/src/types/user-management'

export function countAuditByCategory(entries: UserAuditEntry[]): Record<UserAuditCategory, number> {
  const counts: Record<UserAuditCategory, number> = {
    user_lifecycle: 0,
    user_delete: 0,
    admin_data_add: 0,
    general_data_add: 0,
    read_view: 0,
  }

  for (const entry of entries) {
    counts[entry.category] += 1
  }

  return counts
}

export function filterAuditEntries(
  entries: UserAuditEntry[],
  category: UserAuditCategory | null,
): UserAuditEntry[] {
  if (!category) return entries
  return entries.filter((entry) => entry.category === category)
}

export function getAuditCategoryMeta(category: UserAuditCategory) {
  return USER_AUDIT_CATEGORIES.find((meta) => meta.id === category)
}
