import {
  INITIAL_CREATE_USER_FORM,
  SELECT_EMPTY_VALUE,
} from '@/src/constants/add-user'
import {
  AVAILABLE_USER_ROLES,
  resolveEffectiveUserRoleIds,
  userRolesToFormRoleIds,
} from '@/src/constants/user-detail'
import {
  groupMockIdsToNames,
  resolveEffectiveUserGroupIds,
  userGroupsToFormGroupIds,
} from '@/src/lib/user-management/group-members.utils'
import { hierarchyFieldsFromUser } from '@/src/lib/hierarchy-path.utils'
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
  if (!form.fullName.trim()) return 'fullName'
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
  return {
    ...INITIAL_CREATE_USER_FORM,
    fullName: user.name,
    avatarUrl: user.avatarUrl ?? '',
    email: user.email,
    phone: user.phone ?? SELECT_EMPTY_VALUE,
    department: hierarchyFieldsFromUser(user.department),
    jobTitle: hierarchyFieldsFromUser(user.jobTitle),
    territory: hierarchyFieldsFromUser(user.territory),
    office: fieldFromUser(user.office),
    region: fieldFromUser(user.region),
    businessUnit: fieldFromUser(user.businessUnit),
    status: user.status,
    roleIds: userRolesToFormRoleIds(user.roles),
    groupIds: userGroupsToFormGroupIds(user.groups),
    customAttributes: customAttributesToFormString(user.customAttributes),
  }
}

export function buildUserListItemFromForm(
  form: CreateUserFormValues,
  existing?: UserListItem
): UserListItem {
  const customAttributes = parseCustomAttributes(form.customAttributes)

  return {
    id: existing?.id ?? `user-${Date.now()}`,
    name: form.fullName.trim(),
    avatarUrl: form.avatarUrl.trim() || undefined,
    email: form.email.trim(),
    phone: orEmpty(form.phone),
    department: form.department,
    jobTitle: form.jobTitle.length > 0 ? form.jobTitle : undefined,
    territory: form.territory.length > 0 ? form.territory : undefined,
    office: orEmpty(form.office) ?? '—',
    region: orEmpty(form.region),
    businessUnit: orEmpty(form.businessUnit),
    status: form.status,
    roles: resolveEffectiveUserRoleIds(form.roleIds)
      .map((id) => AVAILABLE_USER_ROLES.find((role) => role.id === id)?.name)
      .filter((name): name is string => Boolean(name)),
    groups: groupMockIdsToNames(resolveEffectiveUserGroupIds(form.groupIds)),
    lastLogin: existing?.lastLogin ?? null,
    customAttributes:
      Object.keys(customAttributes).length > 0 ? customAttributes : undefined,
  }
}
