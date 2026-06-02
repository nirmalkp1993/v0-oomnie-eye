'use client'

import { Box, Checkbox, Stack, Typography } from '@mui/material'
import { GROUP_INHERITABLE_ROLES } from '@/src/constants/add-group'
import { roleCardSx } from './add-group-modal.styles'

export interface InheritedRolesPickerProps {
  selectedRoleIds: string[]
  onToggleRole: (roleId: string) => void
  disabled?: boolean
}

export function InheritedRolesPicker({
  selectedRoleIds,
  onToggleRole,
  disabled = false,
}: InheritedRolesPickerProps) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Members of this group inherit the selected roles in addition to roles assigned directly to them.
      </Typography>
      <Stack spacing={1.25}>
        {GROUP_INHERITABLE_ROLES.map((role) => {
          const selected = selectedRoleIds.includes(role.id)
          return (
            <Box
              key={role.id}
              component="button"
              type="button"
              disabled={disabled}
              onClick={() => onToggleRole(role.id)}
              sx={roleCardSx(selected)}
            >
              <Checkbox checked={selected} size="small" sx={{ p: 0, mt: 0.25 }} tabIndex={-1} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {role.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {role.description}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}
