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
import { PermissionCategorySidebar } from '@/src/components/user-management/permissions/permission-category-sidebar'
import type { BitrixModuleCategory } from '@/src/types/permissions-page'

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

function defaultExpandedForCategory(category: BitrixModuleCategory): Set<string> {
  const modules = getModulesByCategory(category)
  const ids = new Set<string>()
  if (modules[0]) ids.add(modules[0].id)
  if (modules[1]) ids.add(modules[1].id)
  return ids
}

export function BitrixAccessPermissionsView() {
  const { showMessage } = useAdminSnackbar()
  const { scopeGrants, booleanGrants, patchScopeGrant, patchBooleanGrant } = useBitrixPermissions()
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

  useEffect(() => {
    if (!selectedModuleId) return
    const el = document.getElementById(`bitrix-module-${selectedModuleId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [selectedModuleId])

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: BITRIX_ACCESS_UI.borderColor,
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
          bgcolor: BITRIX_ACCESS_UI.headerBg,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150, flexShrink: 0 }}>
          <Select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            displayEmpty
            variant="outlined"
            sx={{
              fontSize: '0.875rem',
              bgcolor: '#fff',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: BITRIX_ACCESS_UI.borderColor,
              },
            }}
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
          placeholder=""
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 200,
            maxWidth: 640,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
              bgcolor: '#fff',
              borderRadius: 2,
              '& fieldset': { borderColor: BITRIX_ACCESS_UI.borderColor },
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" sx={{ color: BITRIX_ACCESS_UI.textSecondary }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          size="small"
          sx={{
            ml: 'auto',
            textTransform: 'none',
            color: 'text.primary',
            fontWeight: 400,
            fontSize: '0.875rem',
            minWidth: 'auto',
            px: 1.5,
            borderRadius: 2,
            border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
            bgcolor: '#fff',
            '&:hover': { bgcolor: BITRIX_ACCESS_UI.sectionBg },
          }}
        >
          Help
        </Button>
      </Box>

      <Box sx={{ display: 'flex', minHeight: 480 }}>
        <PermissionCategorySidebar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          selectedModuleId={selectedModuleId}
          onSelectModule={handleSelectModule}
          searchQuery={search}
        />

        <BitrixAccessGrid
          modules={categoryModules}
          expandedModuleIds={expandedModuleIds}
          visibleRoleIds={visibleRoleIds}
          onVisibleRoleIdsChange={setVisibleRoleIds}
          onToggleModule={handleToggleModule}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          scopeGrants={scopeGrants}
          booleanGrants={booleanGrants}
          onPatchScopeGrant={patchScopeGrant}
          onPatchBooleanGrant={patchBooleanGrant}
          onAssignUsers={handleAssignUsers}
        />
      </Box>
    </Box>
  )
}
