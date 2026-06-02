'use client'

import { useCallback, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import {
  cloneGrants,
  createAdminMatrixGrants,
  createEmptyMatrixGrants,
  MATRIX_COLUMNS,
  MODULE_FILTER_OPTIONS,
  PERMISSION_MATRIX_MODULES,
  RESOURCE_TYPE_OPTIONS,
  ROLE_FILTER_OPTIONS,
} from '@/src/constants/permissions-page-matrix'
import type { MatrixAction, PermissionMatrixModule } from '@/src/types/permissions-page'
import {
  computeMatrixSummary,
  filterModules,
  isActionGranted,
  isRowFullyGranted,
  toggleAction,
  toggleRowAll,
} from '@/src/lib/user-management/permissions-matrix.utils'
import { PermissionsDrawingsTableShell } from './permissions-drawings-table-shell'
import { PermissionMatrixCell } from './permission-matrix-cell'
import { PermissionsSectionTitle } from './permissions-section-title'
import { PermissionsSummaryPanel } from './permissions-summary-panel'
import {
  myDrawingsBodyPrimaryTypographySx,
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsHeaderTypographySx,
  myDrawingsSearchFieldSx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
  myDrawingsToolbarOutlineButtonSx,
  permissionsMatrixActionCellSx,
  permissionsStickyModuleBodySx,
  permissionsStickyModuleHeaderSx,
  umFilterSelectSx,
} from './permissions-shared-styles'

const ACTION_LABELS: Record<string, string> = {
  all: 'All',
  view: 'View',
  read: 'Read',
  create: 'Create',
  edit: 'Edit',
  delete: 'Delete',
  admin: 'Admin',
  export: 'Export',
  print: 'Print',
  restore: 'Restore',
  archive: 'Archive',
  share: 'Share',
  manage: 'Manage',
}

const ROLE_PRESETS: Record<string, () => Record<string, Set<MatrixAction>>> = {
  admin: createAdminMatrixGrants,
  tenant_admin: createAdminMatrixGrants,
  operations_manager: createEmptyMatrixGrants,
  viewer: createEmptyMatrixGrants,
}

export function PermissionMatrixTab() {
  const [roleId, setRoleId] = useState('admin')
  const [resourceType, setResourceType] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(true)
  const [grants, setGrants] = useState(createAdminMatrixGrants)

  const handleRoleChange = useCallback((nextRole: string) => {
    setRoleId(nextRole)
    const factory = ROLE_PRESETS[nextRole] ?? createEmptyMatrixGrants
    setGrants(cloneGrants(factory()))
  }, [])

  const visibleModules = useMemo(
    () =>
      filterModules(PERMISSION_MATRIX_MODULES, search, moduleFilter).filter(
        (m) => resourceType === 'all' || m.resourceType === resourceType
      ),
    [search, moduleFilter, resourceType]
  )

  const summary = useMemo(() => computeMatrixSummary(grants), [grants])
  const itemCount = PERMISSION_MATRIX_MODULES.length

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2.5,
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        <PermissionsSectionTitle
          title="Permission matrix"
          description="Configure module-level grants for the selected role preset."
        />

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
          }}
        >
          <FormControl size="small" sx={umFilterSelectSx}>
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={roleId} onChange={(e) => handleRoleChange(e.target.value)}>
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={umFilterSelectSx}>
            <InputLabel>Resource type</InputLabel>
            <Select
              label="Resource type"
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
            >
              {RESOURCE_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.id === 'all' ? 'All resources' : 'Module'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={umFilterSelectSx}>
            <InputLabel>Module</InputLabel>
            <Select label="Module" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
              {MODULE_FILTER_OPTIONS.map((opt) => (
                <MenuItem key={opt.id} value={opt.id}>
                  {opt.id === 'all' ? 'All modules' : opt.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder="Search modules…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ...myDrawingsSearchFieldSx, flex: '1 1 220px', maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={() => setExpanded((v) => !v)}
            sx={myDrawingsToolbarOutlineButtonSx}
          >
            {expanded ? `Collapse all (${itemCount})` : `Expand all (${itemCount})`}
          </Button>
        </Box>

        <PermissionsDrawingsTableShell maxHeight={560} aria-label="Permission matrix">
          <TableHead sx={myDrawingsTableHeadSx}>
            <TableRow hover={false}>
              <TableCell sx={permissionsStickyModuleHeaderSx}>
                <Typography variant="body2" noWrap sx={myDrawingsHeaderTypographySx}>
                  Module
                </Typography>
              </TableCell>
              {MATRIX_COLUMNS.map((col) => (
                <TableCell key={col.key} align="center" sx={myDrawingsTableCellSx}>
                  <Typography variant="body2" noWrap sx={myDrawingsHeaderTypographySx}>
                    {ACTION_LABELS[col.key] ?? col.key}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={myDrawingsTableBodySx}>
            {visibleModules.length === 0 ? (
              <TableRow hover={false}>
                <TableCell colSpan={MATRIX_COLUMNS.length + 1} sx={{ ...myDrawingsTableCellSx, py: 6, textAlign: 'center' }}>
                  <Typography sx={myDrawingsBodySecondaryTypographySx}>No modules match your filters.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              visibleModules.map((module: PermissionMatrixModule) => {
                const rowActions = grants[module.id] ?? new Set<MatrixAction>()
                const allGranted = isRowFullyGranted(rowActions)
                return (
                  <TableRow key={module.id} hover={false} sx={myDrawingsBodyRowSx()}>
                    <TableCell sx={permissionsStickyModuleBodySx}>
                      <Typography variant="body2" sx={{ ...myDrawingsBodyPrimaryTypographySx, fontWeight: 600 }}>
                        {module.name}
                      </Typography>
                      {expanded ? (
                        <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx} display="block">
                          {module.description}
                        </Typography>
                      ) : null}
                    </TableCell>
                    {MATRIX_COLUMNS.map((col) => {
                      if (col.key === 'all') {
                        return (
                          <TableCell key={col.key} sx={permissionsMatrixActionCellSx}>
                            <PermissionMatrixCell
                              granted={allGranted}
                              onToggle={() => setGrants((prev) => toggleRowAll(prev, module.id))}
                              label={`Toggle all for ${module.name}`}
                            />
                          </TableCell>
                        )
                      }
                      const action = col.key
                      const granted = isActionGranted(grants, module.id, action)
                      return (
                        <TableCell key={col.key} sx={permissionsMatrixActionCellSx}>
                          <PermissionMatrixCell
                            granted={granted}
                            onToggle={() => setGrants((prev) => toggleAction(prev, module.id, action))}
                            label={`${action} for ${module.name}`}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </PermissionsDrawingsTableShell>
      </Box>

      <PermissionsSummaryPanel summary={summary} />
    </Box>
  )
}
