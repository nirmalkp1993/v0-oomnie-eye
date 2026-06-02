'use client'

import { Box, Checkbox, Typography } from '@mui/material'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { DATA_SCOPE_OPTIONS } from '@/src/constants/role-catalog'
import type { DataScopeId } from '@/src/types/user-management'
import { selectionCardSx } from '@/src/components/user-management/user-detail/user-detail-styles'
import { MapPin } from 'lucide-react'

export function DataScopePicker({
  selectedScopeIds,
  onToggleScope,
  disabled = false,
}: {
  selectedScopeIds: DataScopeId[]
  onToggleScope: (scopeId: DataScopeId) => void
  disabled?: boolean
}) {
  return (
    <EarthDialogSectionCard
      title="Data scope"
      icon={MapPin}
      tooltip="Record visibility boundaries for this role"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.warning}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Choose which records users with this role can access.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.25,
        }}
      >
        {DATA_SCOPE_OPTIONS.map((scope) => {
          const selected = selectedScopeIds.includes(scope.id)
          return (
            <Box
              key={scope.id}
              component="button"
              type="button"
              disabled={disabled}
              onClick={() => onToggleScope(scope.id)}
              sx={{
                ...selectionCardSx(selected),
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
                color: 'inherit',
              }}
            >
              <Checkbox checked={selected} size="small" sx={{ p: 0, mt: 0.25 }} tabIndex={-1} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {scope.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {scope.description}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </EarthDialogSectionCard>
  )
}
