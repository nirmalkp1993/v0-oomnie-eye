import { USER_MANAGEMENT_FORM_FIELDS } from '@/src/constants/field-permissions'
import { MOCK_ROLES } from '@/src/mock-data/roles'
import type { FieldPermissionFlags } from '@/src/types/field-permissions'

export const DEFAULT_FIELD_ROLE_ID = 'role-auditor'

const DEFAULT_FLAGS: FieldPermissionFlags = {
  visible: true,
  readOnly: false,
  masked: false,
  required: false,
  exportable: true,
  printable: true,
  denyExport: false,
  denyPrint: false,
}

function createGrants(
  overrides: Partial<Record<string, Partial<FieldPermissionFlags>>>,
): Record<string, FieldPermissionFlags> {
  const grants: Record<string, FieldPermissionFlags> = {}
  USER_MANAGEMENT_FORM_FIELDS.forEach((f) => {
    grants[f.id] = { ...DEFAULT_FLAGS, ...overrides[f.id] }
  })
  return grants
}

const AUDITOR_GRANTS = createGrants({
  salarygrade: { visible: true, readOnly: true, masked: false, required: false, exportable: true, printable: true, denyExport: false, denyPrint: false },
})

const VIEWER_GRANTS = createGrants({
  salarygrade: { visible: false, readOnly: false, masked: false, required: false, exportable: false, printable: false, denyExport: true, denyPrint: true },
  customattributes: { visible: true, readOnly: true, masked: true, required: false, exportable: false, printable: false, denyExport: true, denyPrint: true },
})

export const MOCK_FIELD_GRANTS: Record<string, Record<string, FieldPermissionFlags>> = {
  'role-auditor': AUDITOR_GRANTS,
  'role-viewer': VIEWER_GRANTS,
  'role-tenant-admin': createGrants({}),
  'role-super-admin': createGrants({}),
  'role-operations-manager': createGrants({}),
  'role-finance-country': createGrants({
    salarygrade: { visible: true, readOnly: true, masked: false, required: false, exportable: false, printable: false, denyExport: true, denyPrint: true },
  }),
}

for (const role of MOCK_ROLES) {
  if (!MOCK_FIELD_GRANTS[role.id]) {
    MOCK_FIELD_GRANTS[role.id] = createGrants({})
  }
}

export function getFieldGrantsForRole(roleId: string): Record<string, FieldPermissionFlags> {
  const source = MOCK_FIELD_GRANTS[roleId] ?? createGrants({})
  const next: Record<string, FieldPermissionFlags> = {}
  for (const [id, flags] of Object.entries(source)) {
    next[id] = { ...flags }
  }
  return next
}

export function cloneFieldGrants(
  source: Record<string, FieldPermissionFlags>,
): Record<string, FieldPermissionFlags> {
  const next: Record<string, FieldPermissionFlags> = {}
  for (const [id, flags] of Object.entries(source)) {
    next[id] = { ...flags }
  }
  return next
}
