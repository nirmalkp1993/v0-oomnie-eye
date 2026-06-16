import type { FieldPermissionFlags, FormFieldDefinition } from '@/src/types/field-permissions'

export const FIELD_PERMISSION_COLUMNS: { key: keyof FieldPermissionFlags; labelKey: string }[] = [
  { key: 'visible', labelKey: 'visible' },
  { key: 'readOnly', labelKey: 'readOnly' },
  { key: 'masked', labelKey: 'masked' },
  { key: 'required', labelKey: 'required' },
  { key: 'exportable', labelKey: 'exportable' },
  { key: 'printable', labelKey: 'printable' },
  { key: 'denyExport', labelKey: 'denyExport' },
  { key: 'denyPrint', labelKey: 'denyPrint' },
]

export const USERS_FORM_ID = 'um_users_form' as const

export const FIELD_FORM_OPTIONS = [
  { id: USERS_FORM_ID, label: 'Users — User Management Form' },
] as const

/** Fields for User Management form (matches mock). */
export const USER_MANAGEMENT_FORM_FIELDS: FormFieldDefinition[] = [
  { id: 'firstname', label: 'First name', key: 'firstname', type: 'text' },
  { id: 'lastname', label: 'Last name', key: 'lastname', type: 'text' },
  { id: 'email', label: 'Email', key: 'email', type: 'email' },
  { id: 'phone', label: 'Phone', key: 'phone', type: 'text' },
  { id: 'department', label: 'Department', key: 'department', type: 'select' },
  { id: 'jobtitle', label: 'Job title', key: 'jobtitle', type: 'text' },
  { id: 'country', label: 'Country', key: 'country', type: 'select' },
  { id: 'region', label: 'Region', key: 'region', type: 'select' },
  { id: 'salarygrade', label: 'Salary grade', key: 'salarygrade', type: 'select' },
  { id: 'customattributes', label: 'Custom attributes', key: 'customattributes', type: 'textarea' },
]
