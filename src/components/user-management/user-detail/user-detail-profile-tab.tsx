'use client'

import { Box, Typography } from '@mui/material'
import { Briefcase, UserRound } from 'lucide-react'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import type { UserListItem } from '@/src/types/user-management'

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  )
}

export function UserDetailProfileTab({ user }: { user: UserListItem }) {
  const dash = '—'

  const fields = [
    { label: 'Phone', value: user.phone?.trim() || dash },
    { label: 'Job title', value: user.jobTitle?.trim() || dash },
    { label: 'Department', value: user.department?.trim() || dash },
    { label: 'Business unit', value: user.businessUnit?.trim() || dash },
    { label: 'Territory', value: user.territory?.trim() || dash },
    { label: 'Office', value: user.office?.trim() || dash },
    { label: 'Region', value: user.region?.trim() || dash },
    { label: 'Last login', value: user.lastLogin?.trim() || dash },
  ]

  const customEntries = user.customAttributes
    ? Object.entries(user.customAttributes)
    : []

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <EarthDialogSectionCard
        title="Profile"
        icon={UserRound}
        tooltip="Contact and organization details"
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            columnGap: 3,
            rowGap: 2.5,
          }}
        >
          {fields.map((field) => (
            <ProfileField key={field.label} label={field.label} value={field.value} />
          ))}
        </Box>
      </EarthDialogSectionCard>

      <EarthDialogSectionCard
        title="Custom attributes"
        icon={Briefcase}
        tooltip="Key-value metadata for this user"
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.secondary}
      >
        {customEntries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No custom attributes defined.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              columnGap: 3,
              rowGap: 2,
            }}
          >
            {customEntries.map(([key, value]) => (
              <ProfileField key={key} label={key} value={value} />
            ))}
          </Box>
        )}
      </EarthDialogSectionCard>
    </Box>
  )
}
