'use client'

import { Chip, Stack } from '@mui/material'
import type { RoleBadgeTag } from '@/src/types/user-management'

const BADGE_LABELS: Record<RoleBadgeTag, string> = {
  system: 'system',
  'high-risk': 'high-risk',
}

export function RoleBadges({ badges }: { badges: RoleBadgeTag[] }) {
  if (badges.length === 0) return null
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
      {badges.map((tag) => (
        <Chip
          key={tag}
          label={BADGE_LABELS[tag]}
          size="small"
          sx={{
            height: 20,
            fontFamily: 'Roboto, sans-serif',
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'lowercase',
            ...(tag === 'high-risk'
              ? { bgcolor: 'error.main', color: 'error.contrastText', '& .MuiChip-label': { px: 0.75 } }
              : {
                  bgcolor: 'action.selected',
                  color: 'text.secondary',
                  border: '1px solid',
                  borderColor: 'divider',
                }),
          }}
        />
      ))}
    </Stack>
  )
}
