'use client'

import { useMemo } from 'react'
import { Box, Button, Checkbox, FormControlLabel, Typography } from '@mui/material'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { ROLE_PERMISSION_MODULES } from '@/src/constants/role-catalog'
import { modulePermissionKeys, permissionKey } from '@/src/lib/user-management/add-role-form.utils'
import { Shield } from 'lucide-react'

export function PermissionsEditor({
  selectedPermissions,
  onTogglePermission,
  onSetModulePermissions,
  disabled = false,
}: {
  selectedPermissions: string[]
  onTogglePermission: (key: string) => void
  onSetModulePermissions: (moduleId: string, keys: string[], selected: boolean) => void
  disabled?: boolean
}) {
  const selectedSet = useMemo(() => new Set(selectedPermissions), [selectedPermissions])

  return (
    <EarthDialogSectionCard
      title="Permissions"
      icon={Shield}
      tooltip="Module and action grants for this role"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {selectedPermissions.length} selected
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 320, overflowY: 'auto' }}>
        {ROLE_PERMISSION_MODULES.map((module) => {
          const keys = modulePermissionKeys(module.id, module.actions)
          const allSelected = keys.every((k) => selectedSet.has(k))
          return (
            <Box
              key={module.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1.5,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {module.label}
                </Typography>
                <Button
                  size="small"
                  disabled={disabled}
                  onClick={() => onSetModulePermissions(module.id, keys, !allSelected)}
                  sx={{ textTransform: 'none', fontWeight: 500, minWidth: 0 }}
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </Button>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                  gap: 0.5,
                }}
              >
                {module.actions.map((action) => {
                  const key = permissionKey(module.id, action)
                  return (
                    <FormControlLabel
                      key={key}
                      disabled={disabled}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedSet.has(key)}
                          onChange={() => onTogglePermission(key)}
                        />
                      }
                      label={<Typography variant="body2">{action}</Typography>}
                    />
                  )
                })}
              </Box>
            </Box>
          )
        })}
      </Box>
    </EarthDialogSectionCard>
  )
}
