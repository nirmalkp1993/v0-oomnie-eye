import type {
  CreateGroupFormValues,
  GroupInheritableRole,
  GroupSelectableUser,
  RuleMatchMode,
} from '@/src/types/user-management'

export { DEFAULT_TENANT_NAME } from '@/src/constants/add-user'

export const RULE_FIELD_OPTIONS = [
  'Department',
  'Country',
  'Job title',
  'Business unit',
  'Territory',
] as const

export const RULE_OPERATOR_OPTIONS = ['equals', 'not equals', 'contains'] as const

export const RULE_MATCH_MODES: RuleMatchMode[] = ['ALL', 'ANY']

export const GROUP_SELECTABLE_USERS: GroupSelectableUser[] = [
  { id: '0', name: 'Avery Chen', email: 'owner@acme.test' },
  { id: 'user-alice', name: 'Alice Park', email: 'alice@acme.test' },
  { id: 'user-bob', name: 'Bob Martins', email: 'bob@acme.test' },
  { id: '1', name: 'Alex Morgan', email: 'alex.morgan@example.com' },
  { id: '2', name: 'Priya Shah', email: 'priya.shah@example.com' },
  { id: '3', name: 'Jordan Lee', email: 'jordan.lee@example.com' },
  { id: '4', name: 'Sam Rivera', email: 'sam.rivera@example.com' },
  { id: '5', name: 'Taylor Brooks', email: 'taylor.brooks@example.com' },
]

export const GROUP_INHERITABLE_ROLES: GroupInheritableRole[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Platform-wide access across all tenants.',
  },
  {
    id: 'tenant_admin',
    name: 'Tenant Admin',
    description: 'Full control within this tenant.',
  },
  {
    id: 'finance_manager_country',
    name: 'Finance Manager - Country',
    description: 'Finance scope limited to assigned countries.',
  },
  {
    id: 'finance_manager_region',
    name: 'Finance Manager - Region',
    description: 'Finance scope limited to assigned regions.',
  },
  {
    id: 'global_cfo',
    name: 'Global CFO',
    description: 'Executive finance oversight across the tenant.',
  },
  {
    id: 'operations_manager',
    name: 'Operations Manager',
    description: 'Manages day-to-day operations within their business unit.',
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to assigned resources.',
  },
  {
    id: 'auditor',
    name: 'Auditor',
    description: 'Read-only access for audit and compliance review.',
  },
]

export const INITIAL_CREATE_GROUP_FORM: CreateGroupFormValues = {
  name: '',
  description: '',
  status: 'active',
  groupType: 'static',
  ruleMatchMode: 'ALL',
  rules: [],
  inheritedRoleIds: [],
  selectedUserIds: [],
}
