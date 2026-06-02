import type { EffectivePermissionRow, EffectivePreviewUser } from '@/src/types/effective-preview'

function capitalizeAction(action: string): string {
  if (action === "admin") return "Admin";
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function moduleRows(
  moduleId: string,
  actions: string[],
  resourceType = "Module",
): EffectivePermissionRow[] {
  return actions.map((action) => ({
    id: `${moduleId}-${action}`,
    resource: moduleId,
    resourceType,
    module: moduleId,
    action: capitalizeAction(action),
  }));
}

function mergeRows(...sets: EffectivePermissionRow[][]): EffectivePermissionRow[] {
  const seen = new Set<string>();
  const out: EffectivePermissionRow[] = [];
  sets.flat().forEach((row) => {
    if (seen.has(row.id)) return;
    seen.add(row.id);
    out.push(row);
  });
  return out;
}

const CRUD_ASSIGN = ["read", "create", "update", "delete", "assign"];
const CRUD = ["read", "create", "update", "delete"];
const READ_EXPORT = ["read", "export"];

const TENANT_ADMIN_PERMISSIONS = mergeRows(
  moduleRows("users", CRUD_ASSIGN),
  moduleRows("groups", CRUD_ASSIGN),
  moduleRows("roles", CRUD_ASSIGN),
  moduleRows("settings", ["read", "update"]),
  moduleRows("audit", READ_EXPORT),
  moduleRows("dashboards", ["read"]),
  moduleRows("finance", ["read", "update", "approve", "export"]),
  moduleRows("finance_overview", ["view"]),
  moduleRows("finance_summary", ["view", "export", "print"]),
  moduleRows("operations", ["read", "update"]),
  moduleRows("ops_overview", ["view"]),
  moduleRows("reports", READ_EXPORT),
  moduleRows("reports_menu", ["view"]),
  moduleRows("branding", ["configure"]),
  moduleRows("general", ["manage"]),
  moduleRows("admin_menu", ["view"]),
  moduleRows("sidebar", ["view"]),
  moduleRows("topbar", ["view"]),
  moduleRows("approvals", ["view", "approve", "update", "manage"]),
  moduleRows("permission_simulator", ["view", "manage"]),
);

const OPERATIONS_MANAGER_PERMISSIONS = mergeRows(
  moduleRows("operations", ["read", "update"]),
  moduleRows("ops_overview", ["view"]),
  moduleRows("ops_throughput", ["view"]),
  moduleRows("work_orders", ["read", "edit", "manage"]),
  moduleRows("inventory", ["read", "edit"]),
  moduleRows("timesheets", ["read", "create"]),
  moduleRows("purchase_orders", ["read", "create", "edit"]),
  moduleRows("dashboards", ["read"]),
  moduleRows("reports", ["read"]),
);

const VIEWER_PERMISSIONS = mergeRows(
  moduleRows("dashboards", ["read"]),
  moduleRows("reports", ["read"]),
  moduleRows("operations", ["read"]),
  moduleRows("users", ["read"]),
  moduleRows("groups", ["read"]),
  moduleRows("roles", ["read"]),
  moduleRows("audit", ["read"]),
  moduleRows("sidebar", ["view"]),
  moduleRows("topbar", ["view"]),
);

/** Avery: Tenant Admin + Operations Manager (merged, ~52 permissions). */
const AVERY_PERMISSIONS = mergeRows(
  TENANT_ADMIN_PERMISSIONS,
  OPERATIONS_MANAGER_PERMISSIONS,
);

export const EFFECTIVE_PREVIEW_USERS: EffectivePreviewUser[] = [
  {
    id: "avery",
    name: "Avery Chen",
    roles: ["Tenant Admin", "Operations Manager"],
    permissions: AVERY_PERMISSIONS,
  },
  {
    id: "alice",
    name: "Alice Park",
    roles: ["Operations Manager"],
    permissions: OPERATIONS_MANAGER_PERMISSIONS,
  },
  {
    id: "bob",
    name: "Bob Martins",
    roles: ["Viewer"],
    permissions: VIEWER_PERMISSIONS,
  },
];

export const DEFAULT_EFFECTIVE_USER_ID = EFFECTIVE_PREVIEW_USERS[0].id;
