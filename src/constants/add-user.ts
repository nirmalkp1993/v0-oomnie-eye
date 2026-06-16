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

export const DEPARTMENT_OPTIONS = [
  'HR',
  'IT',
  'Finance',
  'Sales',
  'Marketing',
  'Administration',
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

export const TERRITORY_OPTIONS = ['Europe', 'America', 'Asia'] as const

export const OFFICE_OPTIONS = [
  'Kadel Labs, Singhvi Square, IT Park, Madri, Udaipur, Rajasthan 313001, India',
  'Kadel Labs Corporate Office, Jaipur, Rajasthan, India',
  'Kadel Labs Technology Center, Ahmedabad, Gujarat, India',
  'Kadel Labs Innovation Center, Pune, Maharashtra, India',
  'Kadel Labs Development Hub, Bengaluru, Karnataka, India',
  'Kadel Labs Digital Solutions Center, Hyderabad, Telangana, India',
  'Kadel Labs Engineering Office, Chennai, Tamil Nadu, India',
  'Kadel Labs Research & Development Center, Gurugram, Haryana, India',
  'Kadel Labs Business Operations Center, Noida, Uttar Pradesh, India',
  'Kadel Labs Technology Hub, Indore, Madhya Pradesh, India',
  'Kadel Labs Corporate Branch, Mumbai, Maharashtra, India',
  'Kadel Labs Innovation Lab, Kochi, Kerala, India',
  'Kadel Labs Software Development Center, Chandigarh, India',
] as const

export const REGION_OPTIONS = ['Americas', 'EMEA', 'APAC'] as const

export const BUSINESS_UNIT_OPTIONS = [
  'Core Platform',
  'Enterprise',
  'SMB',
  'Partners',
] as const

export const INITIAL_CREATE_USER_FORM: CreateUserFormValues = {
  fullName: '',
  avatarUrl: '',
  email: '',
  phone: '',
  department: SELECT_EMPTY_VALUE,
  jobTitle: SELECT_EMPTY_VALUE,
  territory: SELECT_EMPTY_VALUE,
  office: SELECT_EMPTY_VALUE,
  region: SELECT_EMPTY_VALUE,
  businessUnit: SELECT_EMPTY_VALUE,
  status: 'pending',
  roleId: SELECT_EMPTY_VALUE,
  groupIds: [],
  customAttributes: '',
}

export const CUSTOM_ATTRIBUTES_PLACEHOLDER = `employeeId=12345\ncostCenter=CC-OPS-01`
