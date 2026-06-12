import type { UserAuditEntry } from '@/src/types/user-management'

const DEFAULT_AUDIT: UserAuditEntry[] = [
  {
    id: 'audit-default-1',
    action: 'user.view',
    context: 'users / user',
    date: '2024-05-23',
    category: 'read_view',
  },
  {
    id: 'audit-default-2',
    action: 'users.list.view',
    context: 'users / list',
    date: '2024-05-22',
    category: 'read_view',
  },
]

const AUDIT_BY_USER_ID: Record<string, UserAuditEntry[]> = {
  '0': [
    {
      id: 'audit-avery-1',
      action: 'user.view',
      context: 'users / user',
      date: '2024-05-23',
      category: 'read_view',
    },
    {
      id: 'audit-avery-2',
      action: 'users.list.view',
      context: 'users / list',
      date: '2024-05-22',
      category: 'read_view',
    },
    {
      id: 'audit-avery-3',
      action: 'user.roles.update',
      context: 'users / roles',
      date: '2024-05-20',
      category: 'admin_data_add',
    },
    {
      id: 'audit-avery-4',
      action: 'group.create',
      context: 'groups / create',
      date: '2024-05-18',
      category: 'admin_data_add',
    },
    {
      id: 'audit-avery-5',
      action: 'pin.create',
      context: 'pins / create',
      date: '2024-05-17',
      category: 'general_data_add',
    },
    {
      id: 'audit-avery-6',
      action: 'media.upload',
      context: 'media / upload',
      date: '2024-05-16',
      category: 'general_data_add',
    },
    {
      id: 'audit-avery-7',
      action: 'camera.view',
      context: 'cameras / detail',
      date: '2024-05-15',
      category: 'read_view',
    },
    {
      id: 'audit-avery-8',
      action: 'user.delete',
      context: 'users / delete',
      date: '2024-05-10',
      category: 'user_delete',
    },
  ],
  '1': [
    {
      id: 'audit-alex-1',
      action: 'users.list.view',
      context: 'users / list',
      date: '2026-05-18',
      category: 'read_view',
    },
    {
      id: 'audit-alex-2',
      action: 'department.update',
      context: 'departments / update',
      date: '2026-05-12',
      category: 'admin_data_add',
    },
    {
      id: 'audit-alex-3',
      action: 'pin.create',
      context: 'pins / create',
      date: '2026-05-08',
      category: 'general_data_add',
    },
  ],
}

export function getUserAuditEntries(userId: string): UserAuditEntry[] {
  const entries = AUDIT_BY_USER_ID[userId] ?? DEFAULT_AUDIT
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))
}
