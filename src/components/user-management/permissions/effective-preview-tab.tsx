'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useBitrixPermissions } from '@/src/contexts/bitrix-permissions-context'
import { MOCK_USERS } from '@/src/mock-data/users'
import {
  resolveEffectiveGrants,
  toEffectivePreviewRows,
} from '@/src/lib/user-management/permission-resolver'
import { PermissionsDrawingsTableShell } from './permissions-drawings-table-shell'
import { PermissionsSectionTitle } from './permissions-section-title'
import {
  myDrawingsBodyPrimaryTypographySx,
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsHeaderTypographySx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
  rolePillSx,
  settingsBodyPrimarySx,
  settingsBodySecondarySx,
  umFilterSelectSx,
} from './permissions-shared-styles'

const EFFECTIVE_PREVIEW_COLUMNS = ['Resource', 'Type', 'Module', 'Action / Scope'] as const

export function EffectivePreviewTab() {
  const { scopeGrants, booleanGrants } = useBitrixPermissions()
  const [userId, setUserId] = useState(MOCK_USERS[0]?.id ?? '1')

  const resolved = useMemo(
    () => resolveEffectiveGrants(userId, scopeGrants, booleanGrants),
    [userId, scopeGrants, booleanGrants],
  )

  const rows = useMemo(() => toEffectivePreviewRows(resolved), [resolved])

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
        }}
      >
        <PermissionsSectionTitle
          title="Effective permissions"
          description="Computed from Access permissions grid, direct roles, and group inheritance."
          sx={{ mb: 0, flex: '1 1 280px' }}
        />
        <FormControl size="small" sx={{ ...umFilterSelectSx, minWidth: 200 }}>
          <Select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ fontWeight: 500, ...myDrawingsBodyPrimaryTypographySx }}
          >
            {MOCK_USERS.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: { xs: 2, md: 4 },
          mb: 2.5,
          py: 1.5,
          px: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={settingsBodySecondarySx}>
            Effective roles ({resolved.roleNames.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {resolved.roleNames.length === 0 ? (
              <Typography variant="body2" sx={settingsBodySecondarySx}>
                None
              </Typography>
            ) : (
              resolved.roleNames.map((role) => (
                <Chip key={role} label={role} size="small" sx={rolePillSx} />
              ))
            )}
          </Box>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ ...settingsBodyPrimarySx, fontWeight: 600 }}>
            {rows.length} effective permissions
          </Typography>
          <Typography variant="caption" sx={settingsBodySecondarySx}>
            Merged from roles and groups for {resolved.userName}
          </Typography>
        </Box>
      </Box>

      <PermissionsDrawingsTableShell maxHeight={520} aria-label="Effective permissions">
        <TableHead sx={myDrawingsTableHeadSx}>
          <TableRow hover={false}>
            {EFFECTIVE_PREVIEW_COLUMNS.map((label) => (
              <TableCell key={label} sx={myDrawingsTableCellSx}>
                <Typography variant="body2" noWrap sx={myDrawingsHeaderTypographySx}>
                  {label}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={myDrawingsTableBodySx}>
          {rows.length === 0 ? (
            <TableRow hover={false}>
              <TableCell colSpan={4} sx={{ ...myDrawingsTableCellSx, py: 6, textAlign: 'center' }}>
                <Typography sx={myDrawingsBodySecondaryTypographySx}>
                  No effective permissions for this user.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} hover={false} sx={myDrawingsBodyRowSx()}>
                <TableCell sx={myDrawingsTableCellSx}>
                  <Typography variant="body2" sx={myDrawingsBodyPrimaryTypographySx}>
                    {row.resource}
                  </Typography>
                </TableCell>
                <TableCell sx={myDrawingsTableCellSx}>
                  <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                    {row.resourceType}
                  </Typography>
                </TableCell>
                <TableCell sx={myDrawingsTableCellSx}>
                  <Typography variant="body2" sx={myDrawingsBodyPrimaryTypographySx}>
                    {row.module}
                  </Typography>
                </TableCell>
                <TableCell sx={myDrawingsTableCellSx}>
                  <Typography variant="body2" sx={{ ...myDrawingsBodyPrimaryTypographySx, fontWeight: 600 }}>
                    {row.action}
                  </Typography>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </PermissionsDrawingsTableShell>
    </Box>
  )
}
