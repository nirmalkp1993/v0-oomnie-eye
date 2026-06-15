import type { CreateUserFormValues, UserStatus } from '@/src/types/user-management'

export const SELECT_EMPTY_VALUE = ''

export const DEFAULT_TENANT_NAME = 'Acme Operations'

export const USER_STATUS_FORM_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
]

export const OFFICE_OPTIONS = [
  'Head Office',
  'Regional Office - North',
  'Regional Office - South',
  'Branch Office - East',
  'Branch Office - West',
] as const

export const DEPARTMENT_OPTIONS = [
  'Operations',
  'Finance',
  'Security',
  'Engineering',
  'Sales',
  'Customer Support',
  'Human Resources',
] as const

export const JOB_TITLE_OPTIONS = [
  'Manager',
  'Director',
  'Analyst',
  'Engineer',
  'Specialist',
  'Team Lead',
  'Executive',
] as const

export const TERRITORY_OPTIONS = ['North', 'South', 'East', 'West', 'Central'] as const

export const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'United Arab Emirates',
  'India',
  'Singapore',
  'Australia',
] as const

export const REGION_OPTIONS = ['Americas', 'EMEA', 'APAC'] as const

export const BUSINESS_UNIT_OPTIONS = [
  'Core Platform',
  'Enterprise',
  'SMB',
  'Partners',
] as const

export const INITIAL_CREATE_USER_FORM: CreateUserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: SELECT_EMPTY_VALUE,
  jobTitle: SELECT_EMPTY_VALUE,
  territory: SELECT_EMPTY_VALUE,
  country: SELECT_EMPTY_VALUE,
  region: SELECT_EMPTY_VALUE,
  businessUnit: SELECT_EMPTY_VALUE,
  status: 'pending',
  customAttributes: '',
}

export const CUSTOM_ATTRIBUTES_PLACEHOLDER = `employeeId=12345\ncostCenter=CC-OPS-01`
