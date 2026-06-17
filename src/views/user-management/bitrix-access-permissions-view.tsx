'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import SearchIcon from '@mui/icons-material/Search'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import {
  myDrawingsSearchFieldSx,
  myDrawingsToolbarIconButtonSx,
  myDrawingsToolbarOutlineButtonSx,
  myDrawingsToolbarRowSx,
  myDrawingsToolbarShellSx,
  umFilterSelectSx,
} from '@/src/components/user-management/permissions/permissions-shared-styles'
import {
  APP_PERMISSION_LEAF_MODULES,
  BITRIX_ACCESS_MODULES,
} from '@/src/constants/permissions-page-matrix'
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
import { RoleColumnVisibilityPicker } from '@/src/components/user-management/permissions/roles-grid-toolbar'
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
      <Paper
        elevation={0}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          ...getEnterpriseSettingsCardSx(theme),
        })}
      >
        <Box sx={myDrawingsToolbarShellSx}>
          <Box
            sx={{
              ...myDrawingsToolbarRowSx,
              flexWrap: 'wrap',
              gap: 1.25,
              minHeight: 44,
            }}
          >
            <FormControl size="small" sx={{ ...umFilterSelectSx, minWidth: 148, flexShrink: 0 }}>
              <Select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                displayEmpty
                variant="outlined"
              >
                <MenuItem value="all">All employees</MenuItem>
                {MOCK_USERS.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
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
                ...myDrawingsSearchFieldSx,
                flex: { xs: '1 1 100%', sm: '1 1 240px' },
                minWidth: { xs: '100%', sm: 220 },
                maxWidth: 520,
                width: { xs: '100%', sm: 'auto' },
                '& .MuiOutlinedInput-root': {
                  height: 36,
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '14px',
                  bgcolor: '#FFFFFF',
                  borderRadius: '10px',
                  pl: 0.5,
                  pr: 1,
                },
                '& .MuiOutlinedInput-input': {
                  py: 0.75,
                  px: 0.5,
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                ml: { xs: 0, md: 'auto' },
              }}
            >
              <IconButton
                size="small"
                aria-label="Collapse all modules"
                onClick={collapseAll}
                sx={myDrawingsToolbarIconButtonSx}
              >
                <UnfoldLessIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Expand all modules"
                onClick={expandAll}
                sx={myDrawingsToolbarIconButtonSx}
              >
                <UnfoldMoreIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <RoleColumnVisibilityPicker
                gridRoles={gridRoles}
                visibleRoleIds={visibleRoleIds}
                onVisibleRoleIdsChange={setVisibleRoleIds}
              />
              <Button size="small" sx={myDrawingsToolbarOutlineButtonSx}>
                Help
              </Button>
            </Box>
          </Box>
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
      </Paper>

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
