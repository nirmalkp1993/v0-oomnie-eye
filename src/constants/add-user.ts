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
  'Kadel Labs Corporate Office, Corporate Office, Jaipur, Rajasthan 302001, India',
  'Kadel Labs Technology Center, Technology Center, Ahmedabad, Gujarat 380001, India',
  'Kadel Labs Innovation Center, Innovation Center, Pune, Maharashtra 411001, India',
  'Kadel Labs Development Hub, Development Hub, Bengaluru, Karnataka 560001, India',
  'Kadel Labs Digital Solutions Center, Digital Solutions Center, Hyderabad, Telangana 500001, India',
  'Kadel Labs Engineering Office, Engineering Office, Chennai, Tamil Nadu 600001, India',
  'Kadel Labs Research & Development Center, Research & Development Center, Gurugram, Haryana 122001, India',
  'Kadel Labs Business Operations Center, Business Operations Center, Noida, Uttar Pradesh 201301, India',
  'Kadel Labs Technology Hub, Technology Hub, Indore, Madhya Pradesh 452001, India',
  'Kadel Labs Corporate Branch, Corporate Branch, Mumbai, Maharashtra 400001, India',
  'Kadel Labs Innovation Lab, Innovation Lab, Kochi, Kerala 682001, India',
  'Kadel Labs Software Development Center, Software Development Center, Chandigarh, Chandigarh 160001, India',
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
  roleIds: [],
  groupIds: [],
  customAttributes: '',
}

export const CUSTOM_ATTRIBUTES_PLACEHOLDER = `employeeId=12345\ncostCenter=CC-OPS-01`
