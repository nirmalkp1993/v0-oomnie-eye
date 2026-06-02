'use client'

import { Box } from '@mui/material'
import { Hexagon, Shield } from 'lucide-react'
import type { RoleIconVariant } from '@/src/types/user-management'

export function RoleIcon({ variant }: { variant: RoleIconVariant }) {
  if (variant === 'shield-danger') {
    return (
      <Box sx={{ display: 'flex', flexShrink: 0, color: 'error.main' }} aria-hidden>
        <Shield size={22} strokeWidth={2} fill="currentColor" fillOpacity={0.15} />
      </Box>
    )
  }
  if (variant === 'shield-default') {
    return (
      <Box sx={{ display: 'flex', flexShrink: 0, color: 'text.secondary' }} aria-hidden>
        <Shield size={22} strokeWidth={2} />
      </Box>
    )
  }
  return (
    <Box sx={{ display: 'flex', flexShrink: 0, color: 'text.disabled' }} aria-hidden>
      <Hexagon size={22} strokeWidth={2} />
    </Box>
  )
}
