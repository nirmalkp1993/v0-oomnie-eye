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
import { DEFAULT_EFFECTIVE_USER_ID, EFFECTIVE_PREVIEW_USERS } from '@/src/constants/effective-preview'
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

const EFFECTIVE_PREVIEW_COLUMNS = ['Resource', 'Type', 'Module', 'Action'] as const

export function EffectivePreviewTab() {
  const [userId, setUserId] = useState(DEFAULT_EFFECTIVE_USER_ID)

  const user = useMemo(
    () => EFFECTIVE_PREVIEW_USERS.find((u) => u.id === userId) ?? EFFECTIVE_PREVIEW_USERS[0],
    [userId]
  )

  if (!user) return null

  const permissionCount = user.permissions.length
  const roleCount = user.roles.length

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
          description="Aggregated grants for a user across all assigned roles."
          sx={{ mb: 0, flex: '1 1 280px' }}
        />
        <FormControl size="small" sx={{ ...umFilterSelectSx, minWidth: 200 }}>
          <Select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ fontWeight: 500, ...myDrawingsBodyPrimaryTypographySx }}
          >
            {EFFECTIVE_PREVIEW_USERS.map((u) => (
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
            Effective roles ({roleCount}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {user.roles.map((role) => (
              <Chip key={role} label={role} size="small" sx={rolePillSx} />
            ))}
          </Box>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ ...settingsBodyPrimarySx, fontWeight: 600 }}>
            {permissionCount} effective permissions
          </Typography>
          <Typography variant="caption" sx={settingsBodySecondarySx}>
            Merged from all roles assigned to this user
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
          {user.permissions.length === 0 ? (
            <TableRow hover={false}>
              <TableCell colSpan={4} sx={{ ...myDrawingsTableCellSx, py: 6, textAlign: 'center' }}>
                <Typography sx={myDrawingsBodySecondaryTypographySx}>
                  No effective permissions for this user.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            user.permissions.map((row) => (
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
