import {
  INITIAL_CREATE_USER_FORM,
  SELECT_EMPTY_VALUE,
} from '@/src/constants/add-user'
import type { CreateUserFormValues, UserListItem } from '@/src/types/user-management'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseCustomAttributes(raw: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key) result[key] = value
  }
  return result
}

export function validateCreateUserForm(form: CreateUserFormValues): string | null {
  if (!form.firstName.trim()) return 'firstName'
  if (!form.lastName.trim()) return 'lastName'
  if (!form.email.trim()) return 'email'
  if (!EMAIL_PATTERN.test(form.email.trim())) return 'emailInvalid'
  return null
}

function orEmpty(value: string): string | undefined {
  const v = value.trim()
  return v && v !== SELECT_EMPTY_VALUE ? v : undefined
}

function fieldFromUser(value: string | undefined): string {
  if (!value || value === '—') return SELECT_EMPTY_VALUE
  return value
}

function customAttributesToFormString(attrs?: Record<string, string>): string {
  if (!attrs || Object.keys(attrs).length === 0) return ''
  return Object.entries(attrs)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
}

export function userToFormValues(user: UserListItem): CreateUserFormValues {
  const nameParts = user.name.trim().split(/\s+/)
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  return {
    ...INITIAL_CREATE_USER_FORM,
    firstName,
    lastName,
    email: user.email,
    phone: user.phone ?? SELECT_EMPTY_VALUE,
    department: fieldFromUser(user.department),
    jobTitle: fieldFromUser(user.jobTitle),
    territory: fieldFromUser(user.territory),
    country: fieldFromUser(user.country),
    region: fieldFromUser(user.region),
    businessUnit: fieldFromUser(user.businessUnit),
    status: user.status,
    customAttributes: customAttributesToFormString(user.customAttributes),
  }
}

export function buildUserListItemFromForm(
  form: CreateUserFormValues,
  existing?: UserListItem
): UserListItem {
  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()
  const customAttributes = parseCustomAttributes(form.customAttributes)

  return {
    id: existing?.id ?? `user-${Date.now()}`,
    name: [firstName, lastName].filter(Boolean).join(' '),
    email: form.email.trim(),
    phone: orEmpty(form.phone),
    department: orEmpty(form.department) ?? '—',
    jobTitle: orEmpty(form.jobTitle),
    territory: orEmpty(form.territory),
    country: orEmpty(form.country) ?? '—',
    region: orEmpty(form.region),
    businessUnit: orEmpty(form.businessUnit),
    status: form.status,
    roles: existing?.roles ?? [],
    groups: existing?.groups ?? [],
    lastLogin: existing?.lastLogin ?? null,
    customAttributes:
      Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
  }
}
