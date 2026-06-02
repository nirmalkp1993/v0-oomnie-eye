'use client'

import { useCallback, useMemo, useState } from 'react'
import RefreshIcon from '@mui/icons-material/Refresh'
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
  AUDITOR_FIELD_GRANTS,
  cloneFieldGrants,
  DEFAULT_FIELD_GRANTS,
  FIELD_FORM_OPTIONS,
  FIELD_PERMISSION_COLUMNS,
  FIELD_ROLE_OPTIONS,
} from '@/src/constants/field-permissions'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import type { FieldPermissionFlag } from '@/src/types/field-permissions'
import { filterFormFields, getFieldsForForm, toggleFieldFlag } from '@/src/lib/user-management/field-permissions.utils'
import { PermissionsDrawingsTableShell } from './permissions-drawings-table-shell'
import { PermissionMatrixCell } from './permission-matrix-cell'
import { PermissionsSectionTitle } from './permissions-section-title'
import {
  myDrawingsBodyPrimaryTypographySx,
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsHeaderTypographySx,
  myDrawingsPrimaryButtonSx,
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

const FLAG_LABELS: Record<string, string> = {
  visible: 'Visible',
  readOnly: 'Read only',
  masked: 'Masked',
  required: 'Required',
  exportable: 'Exportable',
  printable: 'Printable',
  denyExport: 'Deny export',
  denyPrint: 'Deny print',
}

const ROLE_GRANTS: Record<string, typeof DEFAULT_FIELD_GRANTS> = {
  auditor: AUDITOR_FIELD_GRANTS,
  admin: DEFAULT_FIELD_GRANTS,
  tenant_admin: DEFAULT_FIELD_GRANTS,
  operations_manager: DEFAULT_FIELD_GRANTS,
  viewer: DEFAULT_FIELD_GRANTS,
}

export function FieldPermissionsTab() {
  const { showMessage } = useAdminSnackbar()
  const [roleId, setRoleId] = useState('auditor')
  const [formId, setFormId] = useState('user_management_form')
  const [search, setSearch] = useState('')
  const [grants, setGrants] = useState(() => cloneFieldGrants(AUDITOR_FIELD_GRANTS))
  const [savedSnapshot, setSavedSnapshot] = useState(() => cloneFieldGrants(AUDITOR_FIELD_GRANTS))

  const allFields = useMemo(() => getFieldsForForm(formId), [formId])
  const visibleFields = useMemo(() => filterFormFields(allFields, search), [allFields, search])

  const handleRoleChange = useCallback((nextRole: string) => {
    setRoleId(nextRole)
    const preset = ROLE_GRANTS[nextRole] ?? DEFAULT_FIELD_GRANTS
    const cloned = cloneFieldGrants(preset)
    setGrants(cloned)
    setSavedSnapshot(cloneFieldGrants(preset))
  }, [])

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <PermissionsSectionTitle
          title="Field permissions"
          description="Control visibility and export rules per form field."
          sx={{ mb: 0 }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon fontSize="small" />}
            onClick={() => {
              const preset = ROLE_GRANTS[roleId] ?? DEFAULT_FIELD_GRANTS
              setGrants(cloneFieldGrants(preset))
              showMessage('Defaults applied', 'info')
            }}
            sx={myDrawingsToolbarOutlineButtonSx}
          >
            Defaults
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setGrants(cloneFieldGrants(savedSnapshot))
              showMessage('Changes reset', 'info')
            }}
            sx={myDrawingsToolbarOutlineButtonSx}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            disableElevation
            size="small"
            onClick={() => {
              setSavedSnapshot(cloneFieldGrants(grants))
              showMessage('Field permissions saved')
            }}
            sx={myDrawingsPrimaryButtonSx}
          >
            Save
          </Button>
        </Box>
      </Box>

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
            {FIELD_ROLE_OPTIONS.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ ...umFilterSelectSx, minWidth: { sm: 240 } }}>
          <InputLabel>Form / report</InputLabel>
          <Select label="Form / report" value={formId} onChange={(e) => setFormId(e.target.value)}>
            {FIELD_FORM_OPTIONS.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="Search fields…"
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
      </Box>

      <PermissionsDrawingsTableShell maxHeight={480} aria-label="Field permissions matrix">
        <TableHead sx={myDrawingsTableHeadSx}>
          <TableRow hover={false}>
            <TableCell sx={{ ...permissionsStickyModuleHeaderSx, minWidth: 200 }}>
              <Typography variant="body2" noWrap sx={myDrawingsHeaderTypographySx}>
                Field
              </Typography>
            </TableCell>
            {FIELD_PERMISSION_COLUMNS.map((col) => (
              <TableCell key={col.key} align="center" sx={myDrawingsTableCellSx}>
                <Typography variant="body2" noWrap sx={myDrawingsHeaderTypographySx}>
                  {FLAG_LABELS[col.key] ?? col.key}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={myDrawingsTableBodySx}>
          {visibleFields.map((field) => (
            <TableRow key={field.id} hover={false} sx={myDrawingsBodyRowSx()}>
              <TableCell sx={permissionsStickyModuleBodySx}>
                <Typography variant="body2" sx={{ ...myDrawingsBodyPrimaryTypographySx, fontWeight: 600 }}>
                  {field.label}
                </Typography>
                <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                  {field.key}
                </Typography>
              </TableCell>
              {FIELD_PERMISSION_COLUMNS.map((col) => {
                const flags = grants[field.id]
                const granted = flags?.[col.key] ?? false
                return (
                  <TableCell key={col.key} sx={permissionsMatrixActionCellSx}>
                    <PermissionMatrixCell
                      granted={granted}
                      onToggle={() =>
                        setGrants((prev) => toggleFieldFlag(prev, field.id, col.key as FieldPermissionFlag))
                      }
                      label={`${FLAG_LABELS[col.key]} for ${field.label}`}
                    />
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </PermissionsDrawingsTableShell>
    </Box>
  )
}
