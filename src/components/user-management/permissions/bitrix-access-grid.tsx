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
  getBitrixGrantSelection,
  getStandardActionsForModule,
  isSystemRole,
} from '@/src/lib/user-management/bitrix-permissions.utils'
import type {
  BitrixAccessGrants,
  BitrixBooleanGrants,
  PermissionMatrixModule,
  RoleMemberSelection,
  ScopeGrantSelection,
  ScopeGrantValue,
} from '@/src/types/permissions-page'
import { BitrixModuleIcon } from './bitrix-module-icon'
import { PermissionScopeCell } from './permission-scope-cell'
import { RoleColumnHeader } from './role-column-header'
import { RolesHeaderCell, useVisibleGridRoles } from './roles-grid-toolbar'
import type { RoleListItem } from '@/src/types/user-management'

function colSpanForRoles(roleCount: number) {
  return roleCount + 3
}

export const BitrixAccessGrid = memo(function BitrixAccessGrid({
  modules,
  gridRoles,
  expandedModuleIds,
  expandedGroupIds,
  visibleRoleIds,
  onVisibleRoleIdsChange,
  onToggleModule,
  onToggleGroup,
  onExpandAll,
  onCollapseAll,
  onAddRole,
  onDeleteRole,
  onSelectAllPermissions,
  onUnselectAllPermissions,
  onRenameRole,
  onCloneRole,
  renamingRoleId,
  onRenameCommit,
  onRenameCancel,
  scopeGrants,
  booleanGrants,
  onPatchScopeGrant,
  onPatchBooleanGrant,
  onAssignUsers,
  getRoleMemberSelection,
}: {
  modules: PermissionMatrixModule[]
  gridRoles: RoleListItem[]
  expandedModuleIds: ReadonlySet<string>
  expandedGroupIds: ReadonlySet<string>
  visibleRoleIds: ReadonlySet<string>
  onVisibleRoleIdsChange: (ids: Set<string>) => void
  onToggleModule: (moduleId: string) => void
  onToggleGroup: (groupId: string) => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onAddRole: () => void
  onDeleteRole: (role: RoleListItem) => void
  onSelectAllPermissions?: (role: RoleListItem) => void
  onUnselectAllPermissions?: (role: RoleListItem) => void
  onRenameRole?: (role: RoleListItem) => void
  onCloneRole?: (role: RoleListItem) => void
  renamingRoleId?: string | null
  onRenameCommit?: (roleId: string, name: string) => void
  onRenameCancel?: () => void
  scopeGrants: BitrixAccessGrants
  booleanGrants: BitrixBooleanGrants
  onPatchScopeGrant: (
    moduleId: string,
    action: string,
    roleId: string,
    value: ScopeGrantSelection,
  ) => void
  onPatchBooleanGrant: (moduleId: string, permId: string, roleId: string, value: boolean) => void
  onAssignUsers?: (roleId: string) => void
  getRoleMemberSelection?: (roleId: string) => RoleMemberSelection
}) {
  const visibleRoles = useVisibleGridRoles(gridRoles, visibleRoleIds)
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
                  gridRoles={gridRoles}
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
                    memberSelection={getRoleMemberSelection?.(role.id)}
                    isRenaming={renamingRoleId === role.id}
                    onRenameCommit={(name) => onRenameCommit?.(role.id, name)}
                    onRenameCancel={onRenameCancel}
                    onAssignUsers={
                      onAssignUsers ? (r) => onAssignUsers(r.id) : undefined
                    }
                    onSelectAllPermissions={onSelectAllPermissions}
                    onUnselectAllPermissions={onUnselectAllPermissions}
                    onRenameRole={onRenameRole}
                    onCloneRole={onCloneRole}
                    onDeleteRole={onDeleteRole}
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
                  onClick={onAddRole}
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
              modules.map((module) =>
                module.isGroupHeader ? (
                  <GroupHeaderRow
                    key={module.id}
                    module={module}
                    expanded={expandedGroupIds.has(module.id)}
                    onToggle={() => onToggleGroup(module.id)}
                    colSpan={colSpan}
                  />
                ) : (
                  <ModuleSection
                    key={module.id}
                    module={module}
                    expanded={expandedModuleIds.has(module.id)}
                    onToggle={() => onToggleModule(module.id)}
                    visibleRoles={visibleRoles}
                    scopeGrants={scopeGrants}
                    onPatchScopeGrant={onPatchScopeGrant}
                    colSpan={colSpan}
                  />
                ),
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
})

const GroupHeaderRow = memo(function GroupHeaderRow({
  module,
  expanded,
  onToggle,
  colSpan,
}: {
  module: PermissionMatrixModule
  expanded: boolean
  onToggle: () => void
  colSpan: number
}) {
  const displayName = getModuleDisplayName(module)
  const depth = module.depth ?? 0

  return (
    <TableRow
      id={`bitrix-module-${module.id}`}
      hover
      sx={{
        bgcolor: BITRIX_ACCESS_UI.sectionBg,
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
          pl: 1.5 + depth * 2,
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
            sx={{ fontWeight: 700, fontSize: '0.875rem', color: BITRIX_ACCESS_UI.textPrimary }}
          >
            {displayName}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  )
})

const ModuleSection = memo(function ModuleSection({
  module,
  expanded,
  onToggle,
  visibleRoles,
  scopeGrants,
  onPatchScopeGrant,
  colSpan,
}: {
  module: PermissionMatrixModule
  expanded: boolean
  onToggle: () => void
  visibleRoles: RoleListItem[]
  scopeGrants: BitrixAccessGrants
  onPatchScopeGrant: (
    moduleId: string,
    action: string,
    roleId: string,
    value: ScopeGrantSelection,
  ) => void
  colSpan: number
}) {
  const displayName = getModuleDisplayName(module)
  const actions = useMemo(() => getStandardActionsForModule(module), [module])
  const depth = module.depth ?? 0

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
            pl: 1.5 + depth * 2,
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
              indent={depth}
              visibleRoles={visibleRoles}
              scopeGrants={scopeGrants}
              onPatchScopeGrant={onPatchScopeGrant}
            />
          ))
        : null}
    </>
  )
})

const ActionRow = memo(function ActionRow({
  moduleId,
  action,
  indent = 0,
  visibleRoles,
  scopeGrants,
  onPatchScopeGrant,
}: {
  moduleId: string
  action: string
  indent?: number
  visibleRoles: RoleListItem[]
  scopeGrants: BitrixAccessGrants
  onPatchScopeGrant: (
    moduleId: string,
    action: string,
    roleId: string,
    value: ScopeGrantSelection,
  ) => void
}) {
  const handleChange = useCallback(
    (roleId: string, value: ScopeGrantSelection) => {
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
          pl: 5 + indent * 2,
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
        const value = getBitrixGrantSelection(scopeGrants, moduleId, action, role.id)
        const lockedScope: ScopeGrantSelection =
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
