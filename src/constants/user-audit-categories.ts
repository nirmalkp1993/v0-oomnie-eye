import type { UserAuditCategory } from '@/src/types/user-management'

export interface UserAuditCategoryMeta {
  id: UserAuditCategory
  heading: string
  description: string
  bg: string
  border: string
  countColor: string
}

export const USER_AUDIT_CATEGORIES: UserAuditCategoryMeta[] = [
  {
    id: 'user_delete',
    heading: 'User deletes',
    description: 'User removal and delete actions',
    bg: '#FEE2E2',
    border: '#F87171',
    countColor: '#B91C1C',
  },
  {
    id: 'admin_data_add',
    heading: 'Admin data added',
    description: 'Administrator system data additions',
    bg: '#FFEDD5',
    border: '#FB923C',
    countColor: '#C2410C',
  },
  {
    id: 'general_data_add',
    heading: 'General data added',
    description: 'Pins, media, and general content additions',
    bg: '#DCFCE7',
    border: '#4ADE80',
    countColor: '#15803D',
  },
  {
    id: 'read_view',
    heading: 'Read & view',
    description: 'Read-only and view access events',
    bg: '#F3F4F6',
    border: '#9CA3AF',
    countColor: '#374151',
  },
]
