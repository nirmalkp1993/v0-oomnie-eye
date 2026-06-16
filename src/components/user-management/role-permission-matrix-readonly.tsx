'use client'

import type { UserRoleMatrixGrants } from '@/src/constants/user-role-permission-matrix'
import { RolePermissionMatrixTable } from '@/src/components/user-management/roles/role-permission-matrix-table'

export function RolePermissionMatrixReadonly({
  grants,
  maxHeight,
}: {
  grants: UserRoleMatrixGrants
  maxHeight?: number
}) {
  return <RolePermissionMatrixTable grants={grants} readOnly maxHeight={maxHeight} />
}
