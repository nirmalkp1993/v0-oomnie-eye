import type { GroupListItem } from '@/src/types/user-management'

export const MOCK_GROUPS: GroupListItem[] = [
  {
    id: 'grp-operations',
    name: 'Operations',
    description: 'Day-to-day operations team',
    type: 'static',
    memberCount: 2,
    inheritedRoles: ['Operations Manager'],
    scope: '2 manually selected',
    status: 'active',
    lastUpdated: '2026-05-15',
    memberUserIds: ['0', '1'],
  },
  {
    id: 'grp-security',
    name: 'Security',
    description: 'Security operations and incident response.',
    type: 'static',
    memberCount: 1,
    inheritedRoles: ['Tenant Admin'],
    scope: '1 manually selected',
    status: 'active',
    lastUpdated: '2026-05-14',
    memberUserIds: ['0'],
  },
  {
    id: 'grp-emea-finance',
    name: 'EMEA Finance',
    description: 'Finance users in the EMEA region (dynamic membership).',
    type: 'dynamic',
    memberCount: 4,
    inheritedRoles: ['Viewer'],
    scope: 'Department equals Finance + 1 more (ALL)',
    status: 'active',
    lastUpdated: '2026-05-12',
    ruleMatchMode: 'ALL',
    rules: [
      { id: 'r1', field: 'department', operator: 'equals', value: 'Finance' },
      { id: 'r2', field: 'region', operator: 'equals', value: 'EMEA' },
    ],
  },
]
