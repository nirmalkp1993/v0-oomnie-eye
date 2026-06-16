import type { FieldPermissionFlags, FormFieldDefinition } from '@/src/types/field-permissions'

export const FIELD_PERMISSION_COLUMNS: { key: keyof FieldPermissionFlags; labelKey: string }[] = [
  { key: "visible", labelKey: "visible" },
  { key: "readOnly", labelKey: "readOnly" },
  { key: "masked", labelKey: "masked" },
  { key: "required", labelKey: "required" },
  { key: "exportable", labelKey: "exportable" },
  { key: "printable", labelKey: "printable" },
  { key: "denyExport", labelKey: "denyExport" },
  { key: "denyPrint", labelKey: "denyPrint" },
];

export const FIELD_ROLE_OPTIONS = [
  { id: "auditor", label: "Auditor" },
  { id: "admin", label: "Admin" },
  { id: "tenant_admin", label: "Tenant Admin" },
  { id: "operations_manager", label: "Operations Manager" },
  { id: "viewer", label: "Viewer" },
] as const;

export const FIELD_MODULE_OPTIONS = [
  { id: "all", labelKey: "allModules" },
  { id: "user_management", labelKey: "userManagement" },
  { id: "finance", labelKey: "finance" },
] as const;

export const USERS_FORM_ID = 'user_management_form' as const

export const FIELD_FORM_OPTIONS = [
  { id: USERS_FORM_ID, label: "FORM - User Management Form" },
  { id: "user_profile_form", label: "FORM - User Profile Form" },
  { id: "expense_report", label: "REPORT - Expense Summary" },
] as const;

export const FIELD_PREVIEW_USERS = [
  { id: "jerry", label: "Jerry Chen" },
  { id: "avery", label: "Avery Chen" },
  { id: "priya", label: "Priya Shah" },
] as const;

export const FIELD_PREVIEW_PERSPECTIVES = [
  { id: "admin", labelKey: "admin" },
  { id: "team_lead", labelKey: "teamLead" },
  { id: "operations_manager", labelKey: "operationsManager" },
] as const;

/** Fields for User Management form (matches mock). */
export const USER_MANAGEMENT_FORM_FIELDS: FormFieldDefinition[] = [
  { id: "firstname", label: "First name", key: "firstname", type: "text" },
  { id: "lastname", label: "Last name", key: "lastname", type: "text" },
  { id: "email", label: "Email", key: "email", type: "email" },
  { id: "phone", label: "Phone", key: "phone", type: "text" },
  { id: "department", label: "Department", key: "department", type: "select" },
  { id: "jobtitle", label: "Job title", key: "jobtitle", type: "text" },
  { id: "office", label: "Office", key: "office", type: "select" },
  { id: "region", label: "Region", key: "region", type: "select" },
  { id: "salarygrade", label: "Salary grade", key: "salarygrade", type: "select" },
  { id: "customattributes", label: "Custom attributes", key: "customattributes", type: "textarea" },
];

const DEFAULT_FLAGS: FieldPermissionFlags = {
  visible: true,
  readOnly: false,
  masked: false,
  required: false,
  exportable: true,
  printable: true,
  denyExport: false,
  denyPrint: false,
};

function createGrants(
  overrides: Partial<Record<string, Partial<FieldPermissionFlags>>>,
): Record<string, FieldPermissionFlags> {
  const grants: Record<string, FieldPermissionFlags> = {};
  USER_MANAGEMENT_FORM_FIELDS.forEach((f) => {
    grants[f.id] = { ...DEFAULT_FLAGS, ...overrides[f.id] };
  });
  return grants;
}

export const AUDITOR_FIELD_GRANTS = createGrants({
  salarygrade: {
    visible: true,
    readOnly: true,
    masked: false,
    required: false,
    exportable: true,
    printable: true,
    denyExport: false,
    denyPrint: false,
  },
});

export const DEFAULT_FIELD_GRANTS = createGrants({});

export function cloneFieldGrants(
  source: Record<string, FieldPermissionFlags>,
): Record<string, FieldPermissionFlags> {
  const next: Record<string, FieldPermissionFlags> = {};
  for (const [id, flags] of Object.entries(source)) {
    next[id] = { ...flags };
  }
  return next;
}
