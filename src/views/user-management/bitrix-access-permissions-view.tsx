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
import { getModulesByCategory } from '@/src/constants/permissions-page-matrix'
import { BITRIX_ACCESS_UI, BITRIX_GRID_ROLE_IDS } from '@/src/constants/bitrix-access-ui'
import { MOCK_USERS } from '@/src/mock-data/users'
import { useBitrixPermissions } from '@/src/contexts/bitrix-permissions-context'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { RoleFormModal } from '@/src/components/modals/role-form-modal'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { PermissionCategorySidebar } from '@/src/components/user-management/permissions/permission-category-sidebar'
import { isDeletableGridRole } from '@/src/lib/user-management/bitrix-permissions.utils'
import type { BitrixModuleCategory } from '@/src/types/permissions-page'
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

type RoleModalState = {
  open: boolean
  mode: 'create' | 'edit'
  role: RoleListItem | null
}

function defaultExpandedForCategory(category: BitrixModuleCategory): Set<string> {
  const modules = getModulesByCategory(category)
  const ids = new Set<string>()
  if (modules[0]) ids.add(modules[0].id)
  if (modules[1]) ids.add(modules[1].id)
  return ids
}

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
  } = useBitrixPermissions()
  const [selectedCategory, setSelectedCategory] = useState<BitrixModuleCategory>('crm')
  const [selectedModuleId, setSelectedModuleId] = useState('customer_master')
  const [expandedModuleIds, setExpandedModuleIds] = useState<Set<string>>(() =>
    defaultExpandedForCategory('crm'),
  )
  const [search, setSearch] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [visibleRoleIds, setVisibleRoleIds] = useState<Set<string>>(
    () => new Set(BITRIX_GRID_ROLE_IDS),
  )
  const [roleModal, setRoleModal] = useState<RoleModalState>({
    open: false,
    mode: 'create',
    role: null,
  })
  const [confirmDeleteRole, setConfirmDeleteRole] = useState<RoleListItem | null>(null)

  const categoryModules = useMemo(() => {
    const list = getModulesByCategory(selectedCategory)
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.displayName?.toLowerCase().includes(q) ?? false) ||
        m.id.includes(q),
    )
  }, [selectedCategory, search])

  const handleAssignUsers = useCallback(
    (roleId: string) => {
      showMessage(`Open Users tab to assign members to role ${roleId}`, 'info')
    },
    [showMessage],
  )

  const handleSelectCategory = useCallback((cat: BitrixModuleCategory) => {
    setSelectedCategory(cat)
    const first = getModulesByCategory(cat)[0]
    setSelectedModuleId(first?.id ?? '')
    setExpandedModuleIds(defaultExpandedForCategory(cat))
  }, [])

  const handleSelectModule = useCallback((id: string) => {
    setSelectedModuleId(id)
    setSelectedCategory('crm')
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
    setExpandedModuleIds(new Set(categoryModules.map((m) => m.id)))
  }, [categoryModules])

  const collapseAll = useCallback(() => {
    setExpandedModuleIds(new Set())
  }, [])

  const openCreateRole = useCallback(() => {
    setRoleModal({ open: true, mode: 'create', role: null })
  }, [])

  const openEditRole = useCallback((role: RoleListItem) => {
    setRoleModal({ open: true, mode: 'edit', role })
  }, [])

  const closeRoleModal = useCallback(() => {
    setRoleModal({ open: false, mode: 'create', role: null })
  }, [])

  const handleSaveRole = useCallback(
    (role: RoleListItem): boolean => {
      if (roleModal.mode === 'create') {
        if (isNameTaken(gridRoles, role.name)) {
          showMessage('A role with this name already exists', 'warning')
          return false
        }
        addGridRole(role)
        setVisibleRoleIds((prev) => {
          const next = new Set(prev)
          next.add(role.id)
          return next
        })
        showMessage(`Role "${role.name}" created — set permissions in the grid`, 'success')
      } else if (roleModal.role) {
        if (isNameTaken(gridRoles, role.name, roleModal.role.id)) {
          showMessage('A role with this name already exists', 'warning')
          return false
        }
        updateGridRole({ ...role, id: roleModal.role.id })
        showMessage(`Role "${role.name}" updated`, 'success')
      }
      closeRoleModal()
      return true
    },
    [addGridRole, closeRoleModal, gridRoles, roleModal.mode, roleModal.role, showMessage, updateGridRole],
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
    setConfirmDeleteRole(null)
    closeRoleModal()
    showMessage(`Role "${deletedName}" deleted`, 'success')
  }, [closeRoleModal, confirmDeleteRole, gridRoles, removeGridRole, showMessage])

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
            placeholder=""
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
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            selectedModuleId={selectedModuleId}
            onSelectModule={handleSelectModule}
            searchQuery={search}
          />

          <BitrixAccessGrid
            modules={categoryModules}
            gridRoles={gridRoles}
            expandedModuleIds={expandedModuleIds}
            visibleRoleIds={visibleRoleIds}
            onVisibleRoleIdsChange={setVisibleRoleIds}
            onToggleModule={handleToggleModule}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onAddRole={openCreateRole}
            onEditRole={openEditRole}
            onDeleteRole={requestDeleteRole}
            scopeGrants={scopeGrants}
            booleanGrants={booleanGrants}
            onPatchScopeGrant={patchScopeGrant}
            onPatchBooleanGrant={patchBooleanGrant}
            onAssignUsers={handleAssignUsers}
          />
        </Box>
      </Box>

      <RoleFormModal
        open={roleModal.open}
        mode={roleModal.mode}
        initial={roleModal.role}
        onClose={closeRoleModal}
        onSubmit={handleSaveRole}
        onDeleteRequest={
          roleModal.role && isDeletableGridRole(roleModal.role.id)
            ? () => {
                const role = roleModal.role as RoleListItem
                closeRoleModal()
                setConfirmDeleteRole(role)
              }
            : undefined
        }
      />

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
    </>
  )
}
