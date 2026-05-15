import type { GroupRow } from '@/src/types/user-management'

export const MOCK_GROUPS: GroupRow[] = [
  {
    id: 'g1',
    groupId: 'GRP-1001',
    groupName: 'Command North',
    description: 'Northern corridor command & monitoring operators.',
    assignedUsersCount: 18,
    createdDate: '2024-01-12',
  },
  {
    id: 'g2',
    groupId: 'GRP-1002',
    groupName: 'Patrol West',
    description: 'Patrol scheduling and incident response for western sites.',
    assignedUsersCount: 24,
    createdDate: '2024-02-03',
  },
  {
    id: 'g3',
    groupId: 'GRP-1003',
    groupName: 'Compliance',
    description: 'Audit trails, policy checks, and regulatory reporting.',
    assignedUsersCount: 9,
    createdDate: '2024-03-18',
  },
  {
    id: 'g4',
    groupId: 'GRP-1004',
    groupName: 'Field Ops',
    description: 'On-site supervisors and mobile response teams.',
    assignedUsersCount: 31,
    createdDate: '2024-04-22',
  },
  {
    id: 'g5',
    groupId: 'GRP-1005',
    groupName: 'IoT Lab',
    description: 'Sensor onboarding, firmware rollouts, and device health.',
    assignedUsersCount: 12,
    createdDate: '2024-05-09',
  },
]
