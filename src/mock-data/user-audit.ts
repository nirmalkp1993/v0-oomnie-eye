import { MOCK_USERS } from '@/src/mock-data/users'
import type { UserAuditEntry, UserListItem } from '@/src/types/user-management'

function toIsoDate(daysAgo: number, hour = 10, minute = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function lastLoginIso(lastLogin: string | null | undefined, fallbackDaysAgo: number): string {
  if (!lastLogin) return toIsoDate(fallbackDaysAgo, 9, 30)
  const parsed = Date.parse(lastLogin)
  if (Number.isNaN(parsed)) return toIsoDate(fallbackDaysAgo, 9, 30)
  return new Date(parsed).toISOString()
}

/** Extra domain events layered on top of the base seed per user. */
const EXTRA_AUDIT_BY_USER_ID: Record<string, UserAuditEntry[]> = {
  '0': [
    {
      id: 'audit-avery-pin',
      action: 'Pin created',
      context: 'pins / create',
      date: '2024-05-17T16:45:00.000Z',
      category: 'general_data_add',
    },
    {
      id: 'audit-avery-camera',
      action: 'Camera viewed',
      context: 'cameras / detail',
      date: '2024-05-15T08:20:00.000Z',
      category: 'read_view',
    },
    {
      id: 'audit-avery-group',
      action: 'Group created',
      context: 'groups / create',
      date: '2024-05-18T11:00:00.000Z',
      category: 'admin_data_add',
    },
  ],
  '1': [
    {
      id: 'audit-alex-dept',
      action: 'Department updated',
      context: 'departments / update',
      date: '2026-05-12T13:11:00.000Z',
      category: 'admin_data_add',
    },
  ],
  '2': [
    {
      id: 'audit-priya-office',
      action: 'Office assigned',
      context: 'users / office · Kadel Labs Corporate Office, Jaipur',
      date: '2026-04-02T10:15:00.000Z',
      category: 'admin_data_add',
    },
  ],
  '3': [
    {
      id: 'audit-jordan-status',
      action: 'Status set to pending',
      context: 'users / status',
      date: '2026-03-15T11:00:00.000Z',
      category: 'user_lifecycle',
    },
  ],
  '4': [
    {
      id: 'audit-sam-media',
      action: 'Media uploaded',
      context: 'media / upload',
      date: '2026-04-28T15:40:00.000Z',
      category: 'general_data_add',
    },
  ],
  '5': [
    {
      id: 'audit-taylor-groups',
      action: 'Groups updated',
      context: 'users / groups · Operations',
      date: '2026-02-10T09:45:00.000Z',
      category: 'admin_data_add',
    },
  ],
}

export function buildSeedEntriesForUser(user: UserListItem): UserAuditEntry[] {
  const context = `users / ${user.name}`
  const entries: UserAuditEntry[] = [
    {
      id: `audit-${user.id}-view`,
      action: 'Profile viewed',
      context: 'users / profile',
      date: lastLoginIso(user.lastLogin, 3),
      category: 'read_view',
    },
    {
      id: `audit-${user.id}-list-view`,
      action: 'User viewed',
      context: 'users / list',
      date: toIsoDate(5, 16, 10),
      category: 'read_view',
    },
  ]

  if (user.roles.length > 0) {
    entries.push({
      id: `audit-${user.id}-roles`,
      action: 'Roles updated',
      context: `users / roles · ${user.roles.join(', ')}`,
      date: toIsoDate(12, 11, 20),
      category: 'admin_data_add',
    })
  }

  if (user.groups.length > 0) {
    entries.push({
      id: `audit-${user.id}-groups`,
      action: 'Groups updated',
      context: `users / groups · ${user.groups.join(', ')}`,
      date: toIsoDate(18, 14, 5),
      category: 'admin_data_add',
    })
  }

  entries.push({
    id: `audit-${user.id}-updated`,
    action: 'User updated',
    context,
    date: toIsoDate(28, 13, 30),
    category: 'user_lifecycle',
  })

  if (user.department && user.department !== '—') {
    entries.push({
      id: `audit-${user.id}-department`,
      action: 'Department assigned',
      context: `users / department · ${user.department}`,
      date: toIsoDate(45, 10, 0),
      category: 'admin_data_add',
    })
  }

  if (user.office && user.office !== '—') {
    entries.push({
      id: `audit-${user.id}-office`,
      action: 'Office assigned',
      context: `users / office · ${user.office}`,
      date: toIsoDate(60, 9, 15),
      category: 'admin_data_add',
    })
  }

  entries.push({
    id: `audit-${user.id}-added`,
    action: 'User added',
    context,
    date: toIsoDate(120, 9, 0),
    category: 'user_lifecycle',
  })

  if (user.status === 'retired') {
    entries.push({
      id: `audit-${user.id}-retired`,
      action: 'User retired',
      context,
      date: toIsoDate(8, 17, 0),
      category: 'user_lifecycle',
    })
  }

  if (user.status === 'pending') {
    entries.push({
      id: `audit-${user.id}-pending`,
      action: 'Account pending activation',
      context: 'users / status',
      date: toIsoDate(15, 8, 45),
      category: 'user_lifecycle',
    })
  }

  const extras = EXTRA_AUDIT_BY_USER_ID[user.id] ?? []
  const merged = [...entries, ...extras.map((entry) => ({ ...entry }))]

  return merged.sort((a, b) => b.date.localeCompare(a.date))
}

function mergeAuditEntries(
  seeded: UserAuditEntry[],
  existing: UserAuditEntry[] | undefined,
): UserAuditEntry[] {
  if (!existing?.length) return seeded

  const byId = new Map<string, UserAuditEntry>()
  for (const entry of seeded) byId.set(entry.id, entry)
  for (const entry of existing) byId.set(entry.id, entry)

  return [...byId.values()].sort((a, b) => b.date.localeCompare(a.date))
}

export function buildInitialUserAuditMap(
  users: UserListItem[] = MOCK_USERS,
): Record<string, UserAuditEntry[]> {
  const map: Record<string, UserAuditEntry[]> = {}

  for (const user of users) {
    map[user.id] = buildSeedEntriesForUser(user)
  }

  return map
}

export function mergeUserAuditMaps(
  seeded: Record<string, UserAuditEntry[]>,
  existing: Record<string, UserAuditEntry[]>,
): Record<string, UserAuditEntry[]> {
  const userIds = new Set([...Object.keys(seeded), ...Object.keys(existing)])
  const merged: Record<string, UserAuditEntry[]> = {}

  for (const userId of userIds) {
    merged[userId] = mergeAuditEntries(seeded[userId] ?? [], existing[userId])
  }

  return merged
}

/** @deprecated Use useUserAuditStore instead */
export function getUserAuditEntries(userId: string): UserAuditEntry[] {
  const user = MOCK_USERS.find((row) => row.id === userId)
  if (!user) return []
  return buildSeedEntriesForUser(user)
}
