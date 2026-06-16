import { DEFAULT_TENANT_NAME } from '@/src/constants/add-user'
import { createEmptyRoleMatrixGrants } from '@/src/constants/user-role-permission-matrix'
import type { CreateRoleFormValues, DataScopeId } from '@/src/types/user-management'

export interface PermissionModule {
  id: string
  label: string
  actions: string[]
}

export { DEFAULT_TENANT_NAME }

/** Permission catalog shown in the role form (matches admin RBAC modules). */
export const ROLE_PERMISSION_MODULES: PermissionModule[] = [
  { id: "admin_menu", label: "admin_menu", actions: ["View"] },
  { id: "approvals", label: "Approvals", actions: ["View", "Approve", "Update", "Manage"] },
  { id: "audit", label: "Audit", actions: ["Read", "Export"] },
  { id: "branding", label: "Branding", actions: ["Configure"] },
  { id: "dashboards", label: "Dashboards", actions: ["Read"] },
  { id: "finance", label: "Finance", actions: ["Read", "Update", "Approve", "Export"] },
  { id: "finance_overview", label: "Finance_overview", actions: ["View"] },
  { id: "finance_summary", label: "Finance_summary", actions: ["View", "Export", "Print"] },
  { id: "general", label: "General", actions: ["Manage"] },
  { id: "groups", label: "Groups", actions: ["Read", "Create", "Update", "Delete", "Assign"] },
  { id: "invoice", label: "Invoice", actions: ["Create", "Update"] },
  { id: "invoice_amount", label: "Invoice Amount", actions: ["Write"] },
  { id: "invoice_approver", label: "Invoice Approver", actions: ["Approve"] },
  { id: "invoice_totals", label: "Invoice Totals", actions: ["Read"] },
  { id: "operations", label: "Operations", actions: ["Read", "Update"] },
  { id: "ops_overview", label: "Ops_overview", actions: ["View"] },
  { id: "ops_throughput", label: "Ops_throughput", actions: ["View"] },
  { id: "permission_simulator", label: "Permission_simulator", actions: ["View", "Manage"] },
  { id: "record_assign_owner", label: "Record_assign_owner", actions: ["Assign"] },
  { id: "reports", label: "Reports", actions: ["Read", "Export"] },
  { id: "reports_menu", label: "Reports_menu", actions: ["View"] },
  { id: "roles", label: "Roles", actions: ["Read", "Create", "Update", "Delete", "Assign"] },
  { id: "settings", label: "Settings", actions: ["Read", "Update"] },
  { id: "sidebar", label: "Sidebar", actions: ["View"] },
  { id: "topbar", label: "Topbar", actions: ["View"] },
  { id: "users", label: "Users", actions: ["Read", "Create", "Update", "Delete", "Assign"] },
];

export const DATA_SCOPE_OPTIONS: {
  id: DataScopeId
  title: string
  description: string
}[] = [
  { id: 'all_tenant_data', title: 'All', description: 'Full access to all records in the module' },
  { id: 'own_records', title: "User's items", description: 'Only records owned by the user' },
  { id: 'assigned_records', title: 'Assigned items', description: 'Records assigned to the user' },
  { id: 'department', title: 'User department', description: 'All records in the user department' },
  { id: 'office', title: 'Office', description: 'Records in the user office' },
  { id: 'territory', title: 'Territory', description: 'Records in assigned territories' },
  { id: 'country', title: 'Country', description: 'Records in assigned countries' },
  { id: 'public_data', title: 'Public', description: 'Public records visible to everyone' },
]

/** Labels for all scope values (display in grid cells and legacy data). */
export const SCOPE_GRANT_LABELS: Record<DataScopeId | 'deny', string> = {
  deny: 'No',
  office: "User's office",
  department: "User department's items",
  department_subdepartments: "User dept. subdepartment's items",
  public_data: 'All items marked as "Available to everyone"',
  own_records: "User's items",
  assigned_records: 'Assigned items',
  country: 'Country',
  territory: 'Territory',
  region: 'Region',
  business_unit: 'Business unit',
  all_tenant_data: 'All',
  global_all_tenants: 'Global (all tenants)',
  custom_filter: 'Custom filter',
}

/** Bitrix access grid — scope options shown in the permission cell menu. */
export const BITRIX_SCOPE_DROPDOWN_OPTIONS: {
  id: DataScopeId | 'deny'
  title: string
  description: string
}[] = [
  {
    id: 'deny',
    title: 'No access',
    description: 'User cannot perform this action.',
  },
  {
    id: 'office',
    title: SCOPE_GRANT_LABELS.office,
    description: 'Records in the user\'s assigned office.',
  },
  {
    id: 'department',
    title: SCOPE_GRANT_LABELS.department,
    description: 'Records belonging to the user\'s department.',
  },
  {
    id: 'department_subdepartments',
    title: SCOPE_GRANT_LABELS.department_subdepartments,
    description: 'Department records including all subdepartments.',
  },
  {
    id: 'public_data',
    title: SCOPE_GRANT_LABELS.public_data,
    description: 'Records shared publicly across the organization.',
  },
]

export const SELECTABLE_DATA_SCOPE_IDS = new Set(
  DATA_SCOPE_OPTIONS.map((o) => o.id),
)

/** Maps list-table data scope labels to form scope ids. */
export const DATA_SCOPE_LABEL_TO_IDS: Record<string, DataScopeId[]> = {
  "Own records": ["own_records"],
  "Assigned records": ["assigned_records"],
  Department: ["department"],
  Country: ["country"],
  Territory: ["territory"],
};

export const INITIAL_CREATE_ROLE_FORM: CreateRoleFormValues = {
  name: "",
  description: "",
  status: "active",
  highRisk: false,
  selectedPermissions: [],
  permissionMatrix: createEmptyRoleMatrixGrants(),
  dataScopeIds: ["own_records", "assigned_records"],
};
