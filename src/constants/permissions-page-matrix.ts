import type { MatrixAction, MatrixColumnKey, PermissionMatrixModule } from '@/src/types/permissions-page'

export const MATRIX_ACTIONS: MatrixAction[] = [
  "view",
  "read",
  "create",
  "edit",
  "delete",
  "admin",
  "export",
  "print",
  "restore",
  "archive",
  "share",
  "manage",
];

export const MATRIX_COLUMNS: { key: MatrixColumnKey; labelKey: string }[] = [
  { key: "all", labelKey: "all" },
  { key: "view", labelKey: "view" },
  { key: "read", labelKey: "read" },
  { key: "create", labelKey: "create" },
  { key: "edit", labelKey: "edit" },
  { key: "delete", labelKey: "delete" },
  { key: "admin", labelKey: "admin" },
  { key: "export", labelKey: "export" },
  { key: "print", labelKey: "print" },
  { key: "restore", labelKey: "restore" },
  { key: "archive", labelKey: "archive" },
  { key: "share", labelKey: "share" },
  { key: "manage", labelKey: "manage" },
];

export const ROLE_FILTER_OPTIONS = [
  { id: "admin", label: "Admin" },
  { id: "tenant_admin", label: "Tenant Admin" },
  { id: "operations_manager", label: "Operations Manager" },
  { id: "viewer", label: "Viewer" },
] as const;

export const RESOURCE_TYPE_OPTIONS = [
  { id: "all", labelKey: "allResources" },
  { id: "module", labelKey: "module" },
] as const;

export const MODULE_FILTER_OPTIONS = [
  { id: "all", labelKey: "allModules" },
  { id: "finance", labelKey: "finance" },
  { id: "operations", labelKey: "operations" },
  { id: "sales", labelKey: "sales" },
] as const;

/** Matrix rows — 25 modules matching the permission matrix mock. */
export const PERMISSION_MATRIX_MODULES: PermissionMatrixModule[] = [
  { id: "approve_levels", name: "Approve levels", description: "Manage approve levels", resourceType: "module" },
  { id: "budget_maintenance", name: "Budget maintenance", description: "Maintain budget definitions", resourceType: "module" },
  { id: "global", name: "Global", description: "Global configuration and lookups", resourceType: "module" },
  { id: "pay_list", name: "Pay list", description: "View and manage pay lists", resourceType: "module" },
  { id: "finance_overview", name: "Finance overview dashboard", description: "Finance KPIs and overview widgets", resourceType: "module" },
  { id: "sales_overview", name: "Sales overview dashboard", description: "Sales KPIs and overview widgets", resourceType: "module" },
  { id: "invoice_processing", name: "Invoice processing", description: "Create and process invoices", resourceType: "module" },
  { id: "payment_runs", name: "Payment runs", description: "Schedule and execute payment runs", resourceType: "module" },
  { id: "vendor_master", name: "Vendor master", description: "Vendor records and banking details", resourceType: "module" },
  { id: "customer_master", name: "Customer master", description: "Customer accounts and credit limits", resourceType: "module" },
  { id: "gl_journals", name: "GL journals", description: "General ledger journal entries", resourceType: "module" },
  { id: "tax_codes", name: "Tax codes", description: "Tax code maintenance", resourceType: "module" },
  { id: "cost_centers", name: "Cost centers", description: "Cost center hierarchy", resourceType: "module" },
  { id: "projects", name: "Projects", description: "Project setup and WBS", resourceType: "module" },
  { id: "timesheets", name: "Timesheets", description: "Employee timesheet entry", resourceType: "module" },
  { id: "expense_claims", name: "Expense claims", description: "Submit and approve expenses", resourceType: "module" },
  { id: "purchase_orders", name: "Purchase orders", description: "PO creation and approval", resourceType: "module" },
  { id: "inventory", name: "Inventory", description: "Stock levels and movements", resourceType: "module" },
  { id: "work_orders", name: "Work orders", description: "Operations work order management", resourceType: "module" },
  { id: "assets", name: "Assets", description: "Fixed asset register", resourceType: "module" },
  { id: "reports_catalog", name: "Reports catalog", description: "Browse and run standard reports", resourceType: "module" },
  { id: "report_designer", name: "Report designer", description: "Design custom reports", resourceType: "module" },
  { id: "audit_trail", name: "Audit trail", description: "View system audit events", resourceType: "module" },
  { id: "user_admin", name: "User administration", description: "Users, groups, and roles", resourceType: "module" },
  { id: "system_settings", name: "System settings", description: "Tenant and integration settings", resourceType: "module" },
];

const ADMIN_GRANT_ENTRIES: [string, MatrixAction[]][] = [
  ["approve_levels", ["share", "manage"]],
  ["budget_maintenance", ["read", "edit", "manage"]],
  ["global", ["view", "read", "admin"]],
  ["pay_list", ["read", "export", "print"]],
  ["finance_overview", ["view", "read"]],
  ["sales_overview", ["view"]],
  ["invoice_processing", ["create", "edit", "delete"]],
  ["payment_runs", ["read", "manage"]],
  ["vendor_master", ["read", "create", "edit"]],
  ["customer_master", ["read", "edit"]],
  ["gl_journals", ["read", "create", "export"]],
  ["tax_codes", ["read", "manage"]],
  ["cost_centers", ["view", "read"]],
  ["projects", ["read", "create", "edit", "archive"]],
  ["timesheets", ["read", "create"]],
  ["expense_claims", ["read", "manage"]],
  ["purchase_orders", ["read", "create", "edit"]],
  ["inventory", ["read", "edit"]],
  ["work_orders", ["read", "edit", "manage"]],
  ["assets", ["read", "restore"]],
  ["reports_catalog", ["read", "export", "print"]],
  ["report_designer", ["read", "create"]],
  ["audit_trail", ["read", "export"]],
  ["user_admin", ["read", "create", "edit", "delete", "admin"]],
  ["system_settings", ["read", "admin", "manage"]],
];

/** Default grants for Admin role. */
export function createAdminMatrixGrants(): Record<string, Set<MatrixAction>> {
  const grants: Record<string, Set<MatrixAction>> = {};
  PERMISSION_MATRIX_MODULES.forEach((m) => {
    grants[m.id] = new Set();
  });
  ADMIN_GRANT_ENTRIES.forEach(([id, actions]) => {
    grants[id] = new Set(actions);
  });
  return grants;
}

export function createEmptyMatrixGrants(): Record<string, Set<MatrixAction>> {
  const grants: Record<string, Set<MatrixAction>> = {};
  PERMISSION_MATRIX_MODULES.forEach((m) => {
    grants[m.id] = new Set();
  });
  return grants;
}

export function cloneGrants(
  source: Record<string, Set<MatrixAction>>,
): Record<string, Set<MatrixAction>> {
  const next: Record<string, Set<MatrixAction>> = {};
  for (const [moduleId, actions] of Object.entries(source)) {
    next[moduleId] = new Set(actions);
  }
  return next;
}
