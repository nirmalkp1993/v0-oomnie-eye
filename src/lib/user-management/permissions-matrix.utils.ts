import { MATRIX_ACTIONS, PERMISSION_MATRIX_MODULES } from '@/src/constants/permissions-page-matrix'
import type { MatrixAction, MatrixSummary, PermissionMatrixModule } from '@/src/types/permissions-page'

export function isRowFullyGranted(actions: Set<MatrixAction>): boolean {
  return MATRIX_ACTIONS.every((a) => actions.has(a));
}

export function isActionGranted(
  grants: Record<string, Set<MatrixAction>>,
  moduleId: string,
  action: MatrixAction,
): boolean {
  return grants[moduleId]?.has(action) ?? false;
}

export function toggleAction(
  grants: Record<string, Set<MatrixAction>>,
  moduleId: string,
  action: MatrixAction,
): Record<string, Set<MatrixAction>> {
  const next = { ...grants, [moduleId]: new Set(grants[moduleId] ?? []) };
  if (next[moduleId].has(action)) {
    next[moduleId].delete(action);
  } else {
    next[moduleId].add(action);
  }
  return next;
}

export function toggleRowAll(
  grants: Record<string, Set<MatrixAction>>,
  moduleId: string,
): Record<string, Set<MatrixAction>> {
  const current = grants[moduleId] ?? new Set<MatrixAction>();
  const selectAll = !isRowFullyGranted(current);
  return {
    ...grants,
    [moduleId]: selectAll ? new Set(MATRIX_ACTIONS) : new Set(),
  };
}

export function filterModules(
  modules: PermissionMatrixModule[],
  search: string,
  moduleFilter: string,
): PermissionMatrixModule[] {
  const q = search.trim().toLowerCase();
  return modules.filter((m) => {
    if (moduleFilter !== "all") {
      const financeIds = [
        "budget_maintenance",
        "pay_list",
        "finance_overview",
        "invoice_processing",
        "payment_runs",
        "vendor_master",
        "gl_journals",
        "tax_codes",
      ];
      const salesIds = ["sales_overview", "customer_master"];
      const opsIds = ["work_orders", "inventory", "purchase_orders", "timesheets"];
      if (moduleFilter === "finance" && !financeIds.includes(m.id)) return false;
      if (moduleFilter === "sales" && !salesIds.includes(m.id)) return false;
      if (moduleFilter === "operations" && !opsIds.includes(m.id)) return false;
    }
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });
}

export function computeMatrixSummary(
  grants: Record<string, Set<MatrixAction>>,
): MatrixSummary {
  let assigned = 0;
  const byAction: Partial<Record<MatrixAction, number>> = {};

  PERMISSION_MATRIX_MODULES.forEach((m) => {
    const actions = grants[m.id];
    if (!actions || actions.size === 0) return;
    assigned += 1;
    actions.forEach((action) => {
      byAction[action] = (byAction[action] ?? 0) + 1;
    });
  });

  return {
    assigned,
    denied: 0,
    inherited: 0,
    byAction,
  };
}
