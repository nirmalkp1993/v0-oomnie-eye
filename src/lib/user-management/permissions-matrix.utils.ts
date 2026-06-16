import { MATRIX_ACTIONS, APP_PERMISSION_LEAF_MODULES } from '@/src/constants/permissions-page-matrix'
import type { MatrixAction, MatrixSummary, PermissionMatrixModule } from '@/src/types/permissions-page'

export function isRowFullyGranted(actions: Set<MatrixAction>): boolean {
  return MATRIX_ACTIONS.every((a) => actions.has(a))
}

export function isActionGranted(
  grants: Record<string, Set<MatrixAction>>,
  moduleId: string,
  action: MatrixAction,
): boolean {
  return grants[moduleId]?.has(action) ?? false
}

export function toggleAction(
  grants: Record<string, Set<MatrixAction>>,
  moduleId: string,
  action: MatrixAction,
): Record<string, Set<MatrixAction>> {
  const next = { ...grants, [moduleId]: new Set(grants[moduleId] ?? []) }
  if (next[moduleId].has(action)) {
    next[moduleId].delete(action)
  } else {
    next[moduleId].add(action)
  }
  return next
}

export function toggleRowAll(
  grants: Record<string, Set<MatrixAction>>,
  moduleId: string,
): Record<string, Set<MatrixAction>> {
  const current = grants[moduleId] ?? new Set<MatrixAction>()
  const selectAll = !isRowFullyGranted(current)
  return {
    ...grants,
    [moduleId]: selectAll ? new Set(MATRIX_ACTIONS) : new Set(),
  }
}

export function filterModules(
  modules: PermissionMatrixModule[],
  search: string,
): PermissionMatrixModule[] {
  const q = search.trim().toLowerCase()
  if (!q) return modules
  return modules.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      (m.displayName?.toLowerCase().includes(q) ?? false),
  )
}

export function computeMatrixSummary(
  grants: Record<string, Set<MatrixAction>>,
): MatrixSummary {
  let assigned = 0
  const byAction: Partial<Record<MatrixAction, number>> = {}

  APP_PERMISSION_LEAF_MODULES.forEach((m) => {
    const actions = grants[m.id]
    if (!actions || actions.size === 0) return
    assigned += 1
    actions.forEach((action) => {
      byAction[action] = (byAction[action] ?? 0) + 1
    })
  })

  return {
    assigned,
    denied: 0,
    inherited: 0,
    byAction,
  }
}
