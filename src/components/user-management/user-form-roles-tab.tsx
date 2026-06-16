'use client'

import { useMemo } from 'react'
import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import { Shield } from 'lucide-react'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { RolePermissionMatrixReadonly } from '@/src/components/user-management/role-permission-matrix-readonly'
import { SELECT_EMPTY_VALUE } from '@/src/constants/add-user'
import { AVAILABLE_USER_ROLES } from '@/src/constants/user-detail'
import { getUserRoleMatrixGrants } from '@/src/constants/user-role-permission-matrix'
import type { UserRoleOption } from '@/src/types/user-management'

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

export function UserFormRolesTab({
  roleId,
  onRoleChange,
  readOnly = false,
}: {
  roleId: string
  onRoleChange: (roleId: string) => void
  readOnly?: boolean
}) {
  const selectedRole = useMemo(
    () => AVAILABLE_USER_ROLES.find((role) => role.id === roleId) ?? null,
    [roleId],
  )

  const matrixGrants = useMemo(
    () => (roleId && roleId !== SELECT_EMPTY_VALUE ? getUserRoleMatrixGrants(roleId) : null),
    [roleId],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <EarthDialogSectionCard
        title="Assigned role"
        icon={Shield}
        tooltip="Role defines what this user can access within the tenant"
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
      >
        <DialogFormField label="Role" htmlFor="userFormRole">
          <Autocomplete
            id="userFormRole"
            options={AVAILABLE_USER_ROLES}
            value={selectedRole}
            disabled={readOnly}
            onChange={(_, role: UserRoleOption | null) => {
              if (!readOnly) onRoleChange(role?.id ?? SELECT_EMPTY_VALUE)
            }}
            getOptionLabel={(role) => role.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={readOnly ? undefined : 'Search roles…'}
                sx={outlineFieldSx}
              />
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
            noOptionsText="No roles match your search"
          />
        </DialogFormField>
        {selectedRole ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: -1 }}>
            {selectedRole.description}
          </Typography>
        ) : null}
      </EarthDialogSectionCard>

      {selectedRole && matrixGrants ? (
        <EarthDialogSectionCard
          title="Permission matrix"
          icon={Shield}
          tooltip="Module permissions granted by the selected role"
          accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
        >
          <RolePermissionMatrixReadonly grants={matrixGrants} />
        </EarthDialogSectionCard>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
          Select a role to preview its permission matrix.
        </Typography>
      )}
    </Box>
  )
}
