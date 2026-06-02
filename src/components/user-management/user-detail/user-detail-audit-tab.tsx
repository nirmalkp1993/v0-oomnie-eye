'use client'

import { Box, Stack, Typography } from '@mui/material'
import { History } from 'lucide-react'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { MOCK_USER_AUDIT } from '@/src/constants/user-detail'
import { auditCardSx } from './user-detail-styles'

export function UserDetailAuditTab() {
  return (
    <EarthDialogSectionCard
      title="Audit trail"
      icon={History}
      tooltip="Recent activity for this user"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
    >
      <Stack spacing={1.25}>
        {MOCK_USER_AUDIT.map((entry) => (
          <Box key={entry.id} sx={auditCardSx}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {entry.action}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {entry.context}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              {entry.date}
            </Typography>
          </Box>
        ))}
      </Stack>
    </EarthDialogSectionCard>
  )
}
