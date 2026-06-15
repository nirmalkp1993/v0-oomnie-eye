'use client'

import { memo, useCallback, useMemo } from 'react'
import AddIcon from '@mui/icons-material/Add'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import {
  BITRIX_ACTION_LABELS,
  getModuleDisplayName,
} from '@/src/constants/permissions-page-matrix'
import {
  BITRIX_ACCESS_UI,
  bitrixHeaderCellSx,
  bitrixTableCellSx,
} from '@/src/constants/bitrix-access-ui'
import {
  getBitrixGrant,
  getBooleanGrant,
  getStandardActionsForModule,
  isSystemRole,
} from '@/src/lib/user-management/bitrix-permissions.utils'
import type {
  BitrixAccessGrants,
  BitrixBooleanGrants,
  PermissionMatrixModule,
  ScopeGrantValue,
} from '@/src/types/permissions-page'
import { BitrixModuleIcon } from './bitrix-module-icon'
import { PermissionBooleanCell } from './permission-boolean-cell'
import { PermissionScopeCell } from './permission-scope-cell'
import { RoleColumnHeader } from './role-column-header'
import { RolesHeaderCell, useVisibleGridRoles } from './roles-grid-toolbar'
import type { RoleListItem } from '@/src/types/user-management'

function colSpanForRoles(roleCount: number) {
  return roleCount + 3
}

export const BitrixAccessGrid = memo(function BitrixAccessGrid({
  modules,
  expandedModuleIds,
  visibleRoleIds,
  onVisibleRoleIdsChange,
  onToggleModule,
  onExpandAll,
  onCollapseAll,
  scopeGrants,
  booleanGrants,
  onPatchScopeGrant,
  onPatchBooleanGrant,
  onAssignUsers,
}: {
  modules: PermissionMatrixModule[]
  expandedModuleIds: ReadonlySet<string>
  visibleRoleIds: ReadonlySet<string>
  onVisibleRoleIdsChange: (ids: Set<string>) => void
  onToggleModule: (moduleId: string) => void
  onExpandAll: () => void
  onCollapseAll: () => void
  scopeGrants: BitrixAccessGrants
  booleanGrants: BitrixBooleanGrants
  onPatchScopeGrant: (
    moduleId: string,
    action: string,
    roleId: string,
    value: ScopeGrantValue,
  ) => void
  onPatchBooleanGrant: (moduleId: string, permId: string, roleId: string, value: boolean) => void
  onAssignUsers?: (roleId: string) => void
}) {
  const visibleRoles = useVisibleGridRoles(visibleRoleIds)
  const colSpan = colSpanForRoles(visibleRoles.length)

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fff',
        overflow: 'hidden',
      }}
    >
      <TableContainer sx={{ flex: 1, maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
        <Table
          stickyHeader
          size="small"
          sx={{
            minWidth: 900,
            fontFamily: BITRIX_ACCESS_UI.fontFamily,
            '& .MuiTableCell-root': { fontFamily: 'inherit' },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  ...bitrixHeaderCellSx,
                  position: 'sticky',
                  left: 0,
                  zIndex: 5,
                  minWidth: BITRIX_ACCESS_UI.actionColumnWidth,
                  py: 1.5,
                  verticalAlign: 'top',
                  height: 'auto',
                }}
              >
                <RolesHeaderCell
                  visibleRoleIds={visibleRoleIds}
                  onVisibleRoleIdsChange={onVisibleRoleIdsChange}
                  onExpandAll={onExpandAll}
                  onCollapseAll={onCollapseAll}
                />
              </TableCell>
              {visibleRoles.map((role) => (
                <TableCell
                  key={role.id}
                  align="center"
                  sx={{
                    ...bitrixHeaderCellSx,
                    minWidth: BITRIX_ACCESS_UI.roleColumnMinWidth,
                    py: 1.25,
                    verticalAlign: 'top',
                    height: 'auto',
                  }}
                >
                  <RoleColumnHeader
                    role={role}
                    onAssignUsers={
                      onAssignUsers ? (r) => onAssignUsers(r.id) : undefined
                    }
                  />
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  ...bitrixHeaderCellSx,
                  minWidth: 52,
                  py: 1.25,
                  verticalAlign: 'middle',
                  height: 'auto',
                }}
              >
                <IconButton
                  size="small"
                  aria-label="Add role"
                  sx={{
                    width: 32,
                    height: 32,
                    color: BITRIX_ACCESS_UI.primaryBlue,
                    border: `1.5px solid ${BITRIX_ACCESS_UI.borderColor}`,
                    borderRadius: '50%',
                    '&:hover': { bgcolor: '#e8f7fc', borderColor: BITRIX_ACCESS_UI.primaryBlue },
                  }}
                >
                  <AddIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </TableCell>
              <TableCell
                sx={{
                  ...bitrixHeaderCellSx,
                  width: 28,
                  p: 0.5,
                  borderRight: 'none',
                  height: 'auto',
                }}
              >
                <ChevronRightIcon sx={{ fontSize: 16, color: BITRIX_ACCESS_UI.textSecondary }} />
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {modules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} sx={{ py: 6, textAlign: 'center', border: 'none' }}>
                  <Typography variant="body2" color="text.secondary">
                    No modules match your search.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              modules.map((module) => (
                <ModuleSection
                  key={module.id}
                  module={module}
                  expanded={expandedModuleIds.has(module.id)}
                  onToggle={() => onToggleModule(module.id)}
                  visibleRoles={visibleRoles}
                  scopeGrants={scopeGrants}
                  booleanGrants={booleanGrants}
                  onPatchScopeGrant={onPatchScopeGrant}
                  onPatchBooleanGrant={onPatchBooleanGrant}
                  colSpan={colSpan}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
})

const ModuleSection = memo(function ModuleSection({
  module,
  expanded,
  onToggle,
  visibleRoles,
  scopeGrants,
  booleanGrants,
  onPatchScopeGrant,
  onPatchBooleanGrant,
  colSpan,
}: {
  module: PermissionMatrixModule
  expanded: boolean
  onToggle: () => void
  visibleRoles: RoleListItem[]
  scopeGrants: BitrixAccessGrants
  booleanGrants: BitrixBooleanGrants
  onPatchScopeGrant: (
    moduleId: string,
    action: string,
    roleId: string,
    value: ScopeGrantValue,
  ) => void
  onPatchBooleanGrant: (moduleId: string, permId: string, roleId: string, value: boolean) => void
  colSpan: number
}) {
  const displayName = getModuleDisplayName(module)
  const actions = useMemo(() => getStandardActionsForModule(module), [module])

  return (
    <>
      <TableRow
        id={`bitrix-module-${module.id}`}
        hover
        sx={{
          bgcolor: expanded ? '#fff' : BITRIX_ACCESS_UI.sectionBg,
          cursor: 'pointer',
          '& td': { borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}` },
          '&:hover': { bgcolor: BITRIX_ACCESS_UI.rowHoverBg },
        }}
        onClick={onToggle}
      >
        <TableCell
          colSpan={colSpan}
          sx={{
            py: 0.875,
            px: 1.5,
            height: 40,
            position: 'sticky',
            left: 0,
            borderRight: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {expanded ? (
              <ExpandLessIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
            ) : (
              <ExpandMoreIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
            )}
            <BitrixModuleIcon moduleId={module.id} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.875rem', color: BITRIX_ACCESS_UI.textPrimary }}
            >
              {displayName}
            </Typography>
          </Box>
        </TableCell>
      </TableRow>

      {expanded
        ? actions.map((action) => (
            <ActionRow
              key={`${module.id}-${action}`}
              moduleId={module.id}
              action={action}
              visibleRoles={visibleRoles}
              scopeGrants={scopeGrants}
              onPatchScopeGrant={onPatchScopeGrant}
            />
          ))
        : null}

      {expanded
        ? module.booleanPermissions?.map((perm) => (
            <BooleanRow
              key={`${module.id}-${perm.id}`}
              moduleId={module.id}
              permId={perm.id}
              permLabel={perm.label}
              visibleRoles={visibleRoles}
              booleanGrants={booleanGrants}
              onPatchBooleanGrant={onPatchBooleanGrant}
            />
          ))
        : null}
    </>
  )
})

const ActionRow = memo(function ActionRow({
  moduleId,
  action,
  visibleRoles,
  scopeGrants,
  onPatchScopeGrant,
}: {
  moduleId: string
  action: string
  visibleRoles: RoleListItem[]
  scopeGrants: BitrixAccessGrants
  onPatchScopeGrant: (
    moduleId: string,
    action: string,
    roleId: string,
    value: ScopeGrantValue,
  ) => void
}) {
  const handleChange = useCallback(
    (roleId: string, value: ScopeGrantValue) => {
      onPatchScopeGrant(moduleId, action, roleId, value)
    },
    [moduleId, action, onPatchScopeGrant],
  )

  return (
    <TableRow
      hover={false}
      sx={{
        bgcolor: '#fff',
        '&:hover': { bgcolor: BITRIX_ACCESS_UI.rowHoverBg },
        '& td': bitrixTableCellSx,
      }}
    >
      <TableCell
        sx={{
          pl: 5,
          position: 'sticky',
          left: 0,
          zIndex: 1,
          bgcolor: 'inherit',
          minWidth: BITRIX_ACCESS_UI.actionColumnWidth,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontSize: '0.8125rem', color: BITRIX_ACCESS_UI.textPrimary }}
        >
          {BITRIX_ACTION_LABELS[action] ?? action}
        </Typography>
      </TableCell>
      {visibleRoles.map((role) => {
        const locked = isSystemRole(role.id)
        const value = getBitrixGrant(scopeGrants, moduleId, action, role.id)
        const lockedScope: ScopeGrantValue =
          role.id === 'role-super-admin' ? 'global_all_tenants' : 'all_tenant_data'

        return (
          <TableCell
            key={role.id}
            align="center"
            sx={{ minWidth: BITRIX_ACCESS_UI.roleColumnMinWidth }}
          >
            <PermissionScopeCell
              value={locked ? lockedScope : value}
              disabled={locked}
              label={`${BITRIX_ACTION_LABELS[action]} for ${role.name}`}
              onChange={(next) => handleChange(role.id, next)}
            />
          </TableCell>
        )
      })}
      <TableCell />
      <TableCell sx={{ borderRight: 'none' }} />
    </TableRow>
  )
})

const BooleanRow = memo(function BooleanRow({
  moduleId,
  permId,
  permLabel,
  visibleRoles,
  booleanGrants,
  onPatchBooleanGrant,
}: {
  moduleId: string
  permId: string
  permLabel: string
  visibleRoles: RoleListItem[]
  booleanGrants: BitrixBooleanGrants
  onPatchBooleanGrant: (moduleId: string, permId: string, roleId: string, value: boolean) => void
}) {
  return (
    <TableRow
      hover={false}
      sx={{
        bgcolor: '#fff',
        '&:hover': { bgcolor: BITRIX_ACCESS_UI.rowHoverBg },
        '& td': bitrixTableCellSx,
      }}
    >
      <TableCell
        sx={{
          pl: 5,
          position: 'sticky',
          left: 0,
          zIndex: 1,
          bgcolor: 'inherit',
        }}
      >
        <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: BITRIX_ACCESS_UI.textPrimary }}>
          {permLabel}
        </Typography>
      </TableCell>
      {visibleRoles.map((role) => {
        const locked = isSystemRole(role.id)
        const checked = locked
          ? true
          : getBooleanGrant(booleanGrants, moduleId, permId, role.id)
        return (
          <TableCell key={role.id} align="center">
            <PermissionBooleanCell
              checked={checked}
              disabled={locked}
              label={`${permLabel} for ${role.name}`}
              onChange={(next) => onPatchBooleanGrant(moduleId, permId, role.id, next)}
            />
          </TableCell>
        )
      })}
      <TableCell />
      <TableCell sx={{ borderRight: 'none' }} />
    </TableRow>
  )
})
