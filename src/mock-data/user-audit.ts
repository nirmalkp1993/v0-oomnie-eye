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

/** Rich demo history for Avery Chen (user id "0"). */
const AVERY_CHEN_AUDIT: UserAuditEntry[] = [
  {
    id: 'audit-avery-01',
    actionType: 'User Updated',
    description: 'User profile updated',
    details: 'users / Avery Chen',
    date: '2026-05-19T13:30:00.000Z',
    category: 'user_lifecycle',
  },
  {
    id: 'audit-avery-02',
    actionType: 'PIN Updated',
    description: 'Map pin location and metadata updated',
    details: 'Pin ID: PIN-7842 (Warehouse A, Location: 40.7128° N, 74.0060° W)',
    date: '2026-05-18T16:15:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-03',
    actionType: 'Camera Added',
    description: 'New surveillance camera added to site monitoring system',
    details: 'Camera ID: CAM-392, Location: Site Entrance',
    date: '2026-05-17T11:45:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-04',
    actionType: 'ADMIN DATA ADDED',
    description: 'Administrative notes added to user record',
    details: 'Added compliance certification details',
    date: '2026-05-16T14:20:00.000Z',
    category: 'admin_data_add',
  },
  {
    id: 'audit-avery-05',
    actionType: 'General Data Added',
    description: 'General contact information updated',
    details: 'Added secondary email & phone number',
    date: '2026-05-15T09:05:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-06',
    actionType: 'READ & VIEW',
    description: 'Profile and audit log viewed by Admin',
    details: 'Viewed by: super.admin@acme.test',
    date: '2026-05-14T15:50:00.000Z',
    category: 'read_view',
  },
  {
    id: 'audit-avery-07',
    actionType: 'PIN Added',
    description: 'New map pin created on Cesium JS globe',
    details: 'Pin ID: PIN-7843 (Office Building B)',
    date: '2026-05-10T10:30:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-08',
    actionType: 'User Updated',
    description: 'Role & permissions modified',
    details: 'Added "Camera Operator" role',
    date: '2026-05-08T13:15:00.000Z',
    category: 'user_lifecycle',
  },
  {
    id: 'audit-avery-09',
    actionType: 'Camera Updated',
    description: 'Camera settings modified (resolution, recording schedule)',
    details: 'Camera ID: CAM-392',
    date: '2026-05-05T16:40:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-10',
    actionType: 'ADMIN DATA ADDED',
    description: 'Security clearance level updated',
    details: 'Level increased to Restricted Access',
    date: '2026-05-03T11:20:00.000Z',
    category: 'admin_data_add',
  },
  {
    id: 'audit-avery-11',
    actionType: 'READ & VIEW',
    description: 'Viewed full user activity report',
    details: 'Viewed by: manager@acme.test',
    date: '2026-05-01T14:55:00.000Z',
    category: 'read_view',
  },
  {
    id: 'audit-avery-12',
    actionType: 'PIN Deleted',
    description: 'Map pin removed from Cesium visualization',
    details: 'Pin ID: PIN-6519 (Old Storage Unit)',
    date: '2026-04-28T09:40:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-13',
    actionType: 'General Data Added',
    description: 'Address and geolocation data added',
    details: 'Updated primary site address',
    date: '2026-04-25T15:10:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-14',
    actionType: 'ADMIN DATA ADDED',
    description: 'Administrative document attached',
    details: 'Uploaded ID verification scan',
    date: '2026-04-22T10:05:00.000Z',
    category: 'admin_data_add',
  },
  {
    id: 'audit-avery-15',
    actionType: 'User Removed',
    description: 'User temporarily deactivated (access revoked)',
    details: 'users / John Ramirez',
    date: '2026-04-18T13:45:00.000Z',
    category: 'user_delete',
  },
  {
    id: 'audit-avery-16',
    actionType: 'Camera Added',
    description: 'PTZ camera added to perimeter monitoring',
    details: 'Camera ID: CAM-471',
    date: '2026-04-15T11:30:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-17',
    actionType: 'READ & VIEW',
    description: 'Viewed camera feed history for user-linked sites',
    details: 'Viewed by: Avery Chen',
    date: '2026-04-12T16:20:00.000Z',
    category: 'read_view',
  },
  {
    id: 'audit-avery-18',
    actionType: 'PIN Added',
    description: 'New asset pin created on 3D map',
    details: 'Pin ID: PIN-7841 (Vehicle Fleet Area)',
    date: '2026-04-10T09:15:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-19',
    actionType: 'ADMIN DATA ADDED',
    description: 'Compliance checklist completed',
    details: 'Added audit trail for regulatory review',
    date: '2026-04-05T14:30:00.000Z',
    category: 'admin_data_add',
  },
  {
    id: 'audit-avery-20',
    actionType: 'General Data Added',
    description: 'Notes section updated',
    details: 'Added "VIP Client" tag',
    date: '2026-04-02T10:50:00.000Z',
    category: 'general_data_add',
  },
  {
    id: 'audit-avery-21',
    actionType: 'READ & VIEW',
    description: 'Profile accessed from mobile device',
    details: 'Device: iPhone 15 Pro',
    date: '2026-03-28T15:05:00.000Z',
    category: 'read_view',
  },
  {
    id: 'audit-avery-22',
    actionType: 'User Added',
    description: 'New user account created',
    details: 'users / Avery Chen',
    date: '2026-02-16T09:00:00.000Z',
    category: 'user_lifecycle',
  },
]

/** Extra domain events layered on top of the base seed per user. */
const EXTRA_AUDIT_BY_USER_ID: Record<string, UserAuditEntry[]> = {
  '1': [
    {
      id: 'audit-alex-dept',
      actionType: 'ADMIN DATA ADDED',
      description: 'Department assignment updated',
      details: 'users / department · Sales',
      date: '2026-05-12T13:11:00.000Z',
      category: 'admin_data_add',
    },
  ],
  '2': [
    {
      id: 'audit-priya-office',
      actionType: 'ADMIN DATA ADDED',
      description: 'Office location assigned',
      details: 'users / office · Kadel Labs Corporate Office, Jaipur',
      date: '2026-04-02T10:15:00.000Z',
      category: 'admin_data_add',
    },
  ],
  '3': [
    {
      id: 'audit-jordan-status',
      actionType: 'User Updated',
      description: 'Account status set to pending',
      details: 'users / status',
      date: '2026-03-15T11:00:00.000Z',
      category: 'user_lifecycle',
    },
  ],
  '4': [
    {
      id: 'audit-sam-media',
      actionType: 'General Data Added',
      description: 'Media file uploaded',
      details: 'media / upload',
      date: '2026-04-28T15:40:00.000Z',
      category: 'general_data_add',
    },
  ],
  '5': [
    {
      id: 'audit-taylor-groups',
      actionType: 'ADMIN DATA ADDED',
      description: 'Group memberships updated',
      details: 'users / groups · Operations',
      date: '2026-02-10T09:45:00.000Z',
      category: 'admin_data_add',
    },
  ],
}

export function buildSeedEntriesForUser(user: UserListItem): UserAuditEntry[] {
  if (user.id === '0') {
    return AVERY_CHEN_AUDIT.map((entry) => ({ ...entry }))
  }

  const context = `users / ${user.name}`
  const entries: UserAuditEntry[] = [
    {
      id: `audit-${user.id}-view`,
      actionType: 'READ & VIEW',
      description: 'User profile viewed',
      details: 'users / profile',
      date: lastLoginIso(user.lastLogin, 3),
      category: 'read_view',
    },
    {
      id: `audit-${user.id}-list-view`,
      actionType: 'READ & VIEW',
      description: 'User record viewed from list',
      details: 'users / list',
      date: toIsoDate(5, 16, 10),
      category: 'read_view',
    },
  ]

  if (user.roles.length > 0) {
    entries.push({
      id: `audit-${user.id}-roles`,
      actionType: 'ADMIN DATA ADDED',
      description: 'Role assignments updated',
      details: `users / roles · ${user.roles.join(', ')}`,
      date: toIsoDate(12, 11, 20),
      category: 'admin_data_add',
    })
  }

  if (user.groups.length > 0) {
    entries.push({
      id: `audit-${user.id}-groups`,
      actionType: 'ADMIN DATA ADDED',
      description: 'Group memberships updated',
      details: `users / groups · ${user.groups.join(', ')}`,
      date: toIsoDate(18, 14, 5),
      category: 'admin_data_add',
    })
  }

  entries.push({
    id: `audit-${user.id}-updated`,
    actionType: 'User Updated',
    description: 'User profile updated',
    details: context,
    date: toIsoDate(28, 13, 30),
    category: 'user_lifecycle',
  })

  if (user.department && user.department !== '—') {
    entries.push({
      id: `audit-${user.id}-department`,
      actionType: 'ADMIN DATA ADDED',
      description: 'Department assigned',
      details: `users / department · ${user.department}`,
      date: toIsoDate(45, 10, 0),
      category: 'admin_data_add',
    })
  }

  if (user.office && user.office !== '—') {
    entries.push({
      id: `audit-${user.id}-office`,
      actionType: 'ADMIN DATA ADDED',
      description: 'Office location assigned',
      details: `users / office · ${user.office}`,
      date: toIsoDate(60, 9, 15),
      category: 'admin_data_add',
    })
  }

  entries.push({
    id: `audit-${user.id}-added`,
    actionType: 'User Added',
    description: 'New user account created',
    details: context,
    date: toIsoDate(120, 9, 0),
    category: 'user_lifecycle',
  })

  if (user.status === 'retired') {
    entries.push({
      id: `audit-${user.id}-retired`,
      actionType: 'User Updated',
      description: 'User account retired',
      details: context,
      date: toIsoDate(8, 17, 0),
      category: 'user_lifecycle',
    })
  }

  if (user.status === 'pending') {
    entries.push({
      id: `audit-${user.id}-pending`,
      actionType: 'User Updated',
      description: 'Account pending activation',
      details: 'users / status',
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
