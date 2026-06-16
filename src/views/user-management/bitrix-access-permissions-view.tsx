'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import {
  APP_PERMISSION_LEAF_MODULES,
  BITRIX_ACCESS_MODULES,
} from '@/src/constants/permissions-page-matrix'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import {
  DEFAULT_EXPANDED_GROUP_IDS_SET,
  filterAppModules,
  getVisibleGridModules,
} from '@/src/mock-data/app-modules'
import { MOCK_USERS } from '@/src/mock-data/users'
import { useBitrixPermissions } from '@/src/contexts/bitrix-permissions-context'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { PermissionCategorySidebar } from '@/src/components/user-management/permissions/permission-category-sidebar'
import { RoleMembersPickerModal } from '@/src/components/user-management/permissions/role-members-picker-modal'
import {
  createBlankGridRole,
  isDeletableGridRole,
  isSystemRole,
} from '@/src/lib/user-management/bitrix-permissions.utils'
import { resolveUserRoleIds } from '@/src/lib/user-management/permission-resolver'
import type { RoleMemberSelection } from '@/src/types/permissions-page'
import type { RoleListItem } from '@/src/types/user-management'

const BitrixAccessGrid = dynamic(
  () =>
    import('@/src/components/user-management/permissions/bitrix-access-grid').then(
      (m) => m.BitrixAccessGrid,
    ),
  {
    loading: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, py: 8 }}>
        <CircularProgress size={28} />
      </Box>
    ),
    ssr: false,
  },
)

function isNameTaken(roles: RoleListItem[], name: string, excludeId?: string): boolean {
  const normalized = name.trim().toLowerCase()
  return roles.some(
    (r) => r.id !== excludeId && r.name.trim().toLowerCase() === normalized,
  )
}

export function BitrixAccessPermissionsView() {
  const { showMessage } = useAdminSnackbar()
  const {
    gridRoles,
    scopeGrants,
    booleanGrants,
    addGridRole,
    updateGridRole,
    removeGridRole,
    patchScopeGrant,
    patchBooleanGrant,
    bulkSetRoleScopeGrants,
    cloneGridRole,
    getRoleMemberSelection,
    setRoleMemberSelection,
  } = useBitrixPermissions()
  const [selectedModuleId, setSelectedModuleId] = useState('earth')
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(
    () => new Set(DEFAULT_EXPANDED_GROUP_IDS_SET),
  )
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(() => new Set(['earth']))
  const [search, setSearch] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [visibleRoleIds, setVisibleRoleIds] = useState<Set<string>>(
    () => new Set(gridRoles.map((r) => r.id)),
  )
  const [renamingRoleId, setRenamingRoleId] = useState<string | null>(null)
  const [assignModalRole, setAssignModalRole] = useState<RoleListItem | null>(null)
  const [confirmDeleteRole, setConfirmDeleteRole] = useState<RoleListItem | null>(null)

  useEffect(() => {
    const allIds = gridRoles.map((r) => r.id)
    if (employeeFilter === 'all') {
      setVisibleRoleIds(new Set(allIds))
      return
    }
    const roleIds = resolveUserRoleIds(employeeFilter)
    const gridRoleIdSet = new Set(allIds)
    const visible = roleIds.filter((id) => gridRoleIdSet.has(id))
    setVisibleRoleIds(new Set(visible.length > 0 ? visible : allIds))
  }, [employeeFilter, gridRoles])

  const gridModules = useMemo(() => {
    const filtered = filterAppModules(BITRIX_ACCESS_MODULES, search)
    return getVisibleGridModules(filtered, expandedGroupIds)
  }, [search, expandedGroupIds])

  const handleAssignUsers = useCallback(
    (roleId: string) => {
      const role = gridRoles.find((item) => item.id === roleId)
      if (!role) return
      setAssignModalRole(role)
    },
    [gridRoles],
  )

  const handleSaveRoleMembers = useCallback(
    (selection: RoleMemberSelection) => {
      if (!assignModalRole) return
      setRoleMemberSelection(assignModalRole.id, selection)
      const users = selection.userIds.length
      const groups = selection.groupIds.length
      showMessage(
        `${users} user(s) and ${groups} group(s) assigned to "${assignModalRole.name}"`,
        'success',
      )
      setAssignModalRole(null)
    },
    [assignModalRole, setRoleMemberSelection, showMessage],
  )

  const handleToggleGroup = useCallback((groupId: string) => {
    setExpandedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }, [])

  const handleSelectModule = useCallback((id: string) => {
    setSelectedModuleId(id)
    setExpandedModuleIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const handleToggleModule = useCallback((moduleId: string) => {
    setExpandedModuleIds((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedGroupIds(new Set(['camera', 'user_management']))
    setExpandedModuleIds(new Set(APP_PERMISSION_LEAF_MODULES.map((m) => m.id)))
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedGroupIds(new Set())
    setExpandedModuleIds(new Set())
  }, [])

  const openCreateRole = useCallback(() => {
    const role = createBlankGridRole(gridRoles)
    addGridRole(role)
    setVisibleRoleIds((prev) => {
      const next = new Set(prev)
      next.add(role.id)
      return next
    })
    setRenamingRoleId(role.id)
    window.setTimeout(() => {
      showMessage('New role added — set permissions in the grid', 'success')
    }, 200)
  }, [addGridRole, gridRoles, showMessage])

  const handleStartRename = useCallback((role: RoleListItem) => {
    setRenamingRoleId(role.id)
  }, [])

  const handleRenameCancel = useCallback(() => {
    setRenamingRoleId(null)
  }, [])

  const handleRenameCommit = useCallback(
    (roleId: string, name: string) => {
      const trimmed = name.trim()
      const role = gridRoles.find((r) => r.id === roleId)
      if (!role) {
        setRenamingRoleId(null)
        return
      }

      if (!trimmed) {
        showMessage('Role name cannot be empty', 'warning')
        setRenamingRoleId(roleId)
        return
      }

      if (isNameTaken(gridRoles, trimmed, roleId)) {
        showMessage('A role with this name already exists', 'warning')
        setRenamingRoleId(roleId)
        return
      }

      if (trimmed !== role.name) {
        updateGridRole({ ...role, name: trimmed })
        showMessage(`Role renamed to "${trimmed}"`, 'success')
      }
      setRenamingRoleId(null)
    },
    [gridRoles, showMessage, updateGridRole],
  )

  const requestDeleteRole = useCallback(
    (role: RoleListItem) => {
      if (!isDeletableGridRole(role.id)) {
        showMessage('Built-in and system roles cannot be deleted', 'warning')
        return
      }
      setConfirmDeleteRole(role)
    },
    [showMessage],
  )

  const handleSelectAllPermissions = useCallback(
    (role: RoleListItem) => {
      if (isSystemRole(role.id)) {
        showMessage('System role permissions cannot be changed', 'warning')
        return
      }
      bulkSetRoleScopeGrants(role.id, 'all_tenant_data')
      showMessage(`All permissions enabled for "${role.name}"`, 'success')
    },
    [bulkSetRoleScopeGrants, showMessage],
  )

  const handleUnselectAllPermissions = useCallback(
    (role: RoleListItem) => {
      if (isSystemRole(role.id)) {
        showMessage('System role permissions cannot be changed', 'warning')
        return
      }
      bulkSetRoleScopeGrants(role.id, 'deny')
      showMessage(`All permissions disabled for "${role.name}"`, 'success')
    },
    [bulkSetRoleScopeGrants, showMessage],
  )

  const handleCloneRole = useCallback(
    (source: RoleListItem) => {
      const clone = cloneGridRole(source)
      setVisibleRoleIds((prev) => {
        const next = new Set(prev)
        next.add(clone.id)
        return next
      })
      showMessage(`Role "${clone.name}" created as a copy of "${source.name}"`, 'success')
    },
    [cloneGridRole, showMessage],
  )

  const confirmDelete = useCallback(() => {
    if (!confirmDeleteRole) return
    const deletedId = confirmDeleteRole.id
    const deletedName = confirmDeleteRole.name
    removeGridRole(deletedId)
    setVisibleRoleIds((prev) => {
      const next = new Set(prev)
      next.delete(deletedId)
      if (next.size === 0) {
        const fallback = gridRoles.find((r) => r.id !== deletedId)
        if (fallback) next.add(fallback.id)
      }
      return next
    })
    if (renamingRoleId === deletedId) {
      setRenamingRoleId(null)
    }
    setConfirmDeleteRole(null)
    showMessage(`Role "${deletedName}" deleted`, 'success')
  }, [confirmDeleteRole, gridRoles, removeGridRole, renamingRoleId, showMessage])

  useEffect(() => {
    if (!selectedModuleId) return
    const el = document.getElementById(`bitrix-module-${selectedModuleId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedModuleId])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          bgcolor: '#fff',
          border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
          borderRadius: 0.5,
          overflow: 'hidden',
          fontFamily: BITRIX_ACCESS_UI.fontFamily,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.25,
            px: 2,
            minHeight: BITRIX_ACCESS_UI.toolbarHeight,
            borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
            bgcolor: BITRIX_ACCESS_UI.headerBg,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 148, flexShrink: 0 }}>
            <Select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              displayEmpty
              variant="outlined"
              sx={{
                fontSize: '0.8125rem',
                bgcolor: '#fff',
                borderRadius: 1.5,
                height: 34,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: BITRIX_ACCESS_UI.borderColor,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#cfd5da',
                },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.8125rem' }}>
                All employees
              </MenuItem>
              {MOCK_USERS.map((u) => (
                <MenuItem key={u.id} value={u.id} sx={{ fontSize: '0.8125rem' }}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search modules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 180,
              maxWidth: 720,
              '& .MuiOutlinedInput-root': {
                fontSize: '0.8125rem',
                bgcolor: '#fff',
                borderRadius: 1.5,
                height: 34,
                '& fieldset': { borderColor: BITRIX_ACCESS_UI.borderColor },
                '&:hover fieldset': { borderColor: '#cfd5da' },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            size="small"
            sx={{
              ml: { xs: 0, md: 'auto' },
              textTransform: 'none',
              color: BITRIX_ACCESS_UI.textPrimary,
              fontWeight: 400,
              fontSize: '0.8125rem',
              minWidth: 'auto',
              px: 1.75,
              height: 34,
              borderRadius: 1.5,
              border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
              bgcolor: '#fff',
              boxShadow: 'none',
              '&:hover': { bgcolor: BITRIX_ACCESS_UI.sectionBg, boxShadow: 'none' },
            }}
          >
            Help
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flex: 1, minHeight: 520 }}>
          <PermissionCategorySidebar
            expandedGroupIds={expandedGroupIds}
            onToggleGroup={handleToggleGroup}
            selectedModuleId={selectedModuleId}
            onSelectModule={handleSelectModule}
            searchQuery={search}
          />

          <BitrixAccessGrid
            modules={gridModules}
            gridRoles={gridRoles}
            expandedModuleIds={expandedModuleIds}
            expandedGroupIds={expandedGroupIds}
            visibleRoleIds={visibleRoleIds}
            onVisibleRoleIdsChange={setVisibleRoleIds}
            onToggleModule={handleToggleModule}
            onToggleGroup={handleToggleGroup}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onAddRole={openCreateRole}
            onDeleteRole={requestDeleteRole}
            onSelectAllPermissions={handleSelectAllPermissions}
            onUnselectAllPermissions={handleUnselectAllPermissions}
            onRenameRole={handleStartRename}
            onCloneRole={handleCloneRole}
            renamingRoleId={renamingRoleId}
            onRenameCommit={handleRenameCommit}
            onRenameCancel={handleRenameCancel}
            scopeGrants={scopeGrants}
            booleanGrants={booleanGrants}
            onPatchScopeGrant={patchScopeGrant}
            onPatchBooleanGrant={patchBooleanGrant}
            onAssignUsers={handleAssignUsers}
            getRoleMemberSelection={getRoleMemberSelection}
          />
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmDeleteRole != null}
        title="Delete role"
        description={
          confirmDeleteRole
            ? `Remove "${confirmDeleteRole.name}" from the access grid? Users assigned to this role will lose these permissions.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onClose={() => setConfirmDeleteRole(null)}
        onConfirm={confirmDelete}
      />
      <RoleMembersPickerModal
        open={assignModalRole != null}
        role={assignModalRole}
        selection={
          assignModalRole ? getRoleMemberSelection(assignModalRole.id) : { userIds: [], groupIds: [], departmentIds: [] }
        }
        onSave={handleSaveRoleMembers}
        onClose={() => setAssignModalRole(null)}
      />
    </>
  )
}
