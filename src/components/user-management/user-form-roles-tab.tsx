'use client'

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Shield } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { RolePermissionMatrixReadonly } from '@/src/components/user-management/role-permission-matrix-readonly'
import { selectionCardSx } from '@/src/components/user-management/user-detail/user-detail-styles'
import {
  DEFAULT_USER_ROLE_ID,
  getAssignableUserRoles,
  getDefaultUserRole,
} from '@/src/constants/user-detail'
import { getUserRoleMatrixGrants } from '@/src/constants/user-role-permission-matrix'
import type { UserRoleOption } from '@/src/types/user-management'

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

export function UserFormRolesTab({
  roleIds,
  onRoleIdsChange,
  readOnly = false,
}: {
  roleIds: string[]
  onRoleIdsChange: (roleIds: string[]) => void
  readOnly?: boolean
}) {
  const defaultRole = getDefaultUserRole()
  const usesDefaultRole = roleIds.length === 0
  const [searchInput, setSearchInput] = useState('')
  const [focusedRoleId, setFocusedRoleId] = useState<string | null>(null)

  const selectedRoles = useMemo(
    () =>
      roleIds
        .map((id) => getAssignableUserRoles().find((role) => role.id === id))
        .filter((role): role is UserRoleOption => Boolean(role)),
    [roleIds],
  )

  const availableRoles = useMemo(
    () => getAssignableUserRoles().filter((role) => !roleIds.includes(role.id)),
    [roleIds],
  )

  const focusedRole = useMemo(() => {
    if (focusedRoleId === DEFAULT_USER_ROLE_ID) return defaultRole
    return selectedRoles.find((role) => role.id === focusedRoleId) ?? null
  }, [defaultRole, focusedRoleId, selectedRoles])

  const matrixGrants = useMemo(
    () => (focusedRole ? getUserRoleMatrixGrants(focusedRole.id) : null),
    [focusedRole],
  )

  useEffect(() => {
    if (usesDefaultRole) {
      setFocusedRoleId(DEFAULT_USER_ROLE_ID)
      return
    }
    if (!focusedRoleId || !roleIds.includes(focusedRoleId)) {
      setFocusedRoleId(selectedRoles[0]?.id ?? null)
    }
  }, [focusedRoleId, roleIds, selectedRoles, usesDefaultRole])

  const addRole = (role: UserRoleOption) => {
    if (roleIds.includes(role.id)) return
    onRoleIdsChange([...roleIds, role.id])
    setFocusedRoleId(role.id)
    setSearchInput('')
  }

  const removeRole = (roleId: string) => {
    onRoleIdsChange(roleIds.filter((id) => id !== roleId))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <EarthDialogSectionCard
        title="Assigned roles"
        icon={Shield}
        tooltip="Roles define what this user can access within the tenant"
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
      >
        {!readOnly ? (
          <DialogFormField label="Search roles" htmlFor="userFormRoleSearch">
            <Autocomplete
              id="userFormRoleSearch"
              options={availableRoles}
              value={null}
              inputValue={searchInput}
              onInputChange={(_, value) => setSearchInput(value)}
              onChange={(_, role) => {
                if (role) addRole(role)
              }}
              getOptionLabel={(role) => role.name}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              noOptionsText={
                availableRoles.length === 0 && roleIds.length > 0
                  ? 'All assignable roles are already selected'
                  : 'No roles match your search'
              }
              renderInput={(params) => (
                <TextField {...params} placeholder="Search role name…" sx={outlineFieldSx} />
              )}
              renderOption={(props, role) => (
                <Box component="li" {...props} key={role.id}>
                  <Box sx={{ py: 0.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {role.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </DialogFormField>
        ) : null}

        <Box
          sx={{
            mt: readOnly ? 0 : 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 1.5, py: 1, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {usesDefaultRole
                ? 'Default role assigned'
                : `Selected roles (${selectedRoles.length})`}
            </Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            {usesDefaultRole ? (
              <Box
                component="button"
                type="button"
                onClick={() => setFocusedRoleId(DEFAULT_USER_ROLE_ID)}
                sx={{
                  ...selectionCardSx(focusedRoleId === DEFAULT_USER_ROLE_ID),
                  width: '100%',
                  border: 0,
                  textAlign: 'left',
                  font: 'inherit',
                  color: 'inherit',
                  cursor: 'pointer',
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {defaultRole.name}
                    </Typography>
                    <Chip label="Default" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {defaultRole.description}
                  </Typography>
                </Box>
              </Box>
            ) : selectedRoles.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                No roles assigned.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedRoles.map((role) => {
                  const selected = focusedRoleId === role.id
                  return (
                    <Box
                      key={role.id}
                      sx={{
                        ...selectionCardSx(selected),
                        alignItems: 'center',
                        p: 1,
                        gap: 0.75,
                      }}
                    >
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setFocusedRoleId(role.id)}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          border: 0,
                          bgcolor: 'transparent',
                          p: 0,
                          m: 0,
                          textAlign: 'left',
                          cursor: 'pointer',
                          font: 'inherit',
                          color: 'inherit',
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {role.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {role.description}
                        </Typography>
                      </Box>
                      {!readOnly ? (
                        <Tooltip title="Remove role">
                          <IconButton
                            size="small"
                            aria-label={`Remove ${role.name}`}
                            onClick={() => removeRole(role.id)}
                            sx={{ flexShrink: 0 }}
                          >
                            <CloseOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>

        {usesDefaultRole && !readOnly ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -0.5 }}>
            Add a role above to replace the default assignment.
          </Typography>
        ) : null}
      </EarthDialogSectionCard>

      {focusedRole && matrixGrants ? (
        <RolePermissionMatrixReadonly grants={matrixGrants} />
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
          Select a role to preview its permission matrix.
        </Typography>
      )}
    </Box>
  )
}
