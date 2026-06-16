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
  { id: 'own_records', title: 'Own records', description: 'Only records owned by the user' },
  { id: 'assigned_records', title: 'Assigned records', description: 'Records assigned to the user' },
  { id: 'department', title: 'Department', description: 'All records in the user department' },
  { id: 'country', title: 'Country', description: 'Records in assigned countries' },
  { id: 'territory', title: 'Territory', description: 'Records in assigned territories' },
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
