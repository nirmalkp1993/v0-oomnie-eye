'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import type { GroupSelectableUser } from '@/src/types/user-management'
import { outlineFieldSx } from './add-group-modal.styles'

export interface StaticMembersPickerProps {
  users: GroupSelectableUser[]
  selectedUserIds: string[]
  onToggleUser: (userId: string) => void
  disabled?: boolean
}

function normalizeSearch(s: string): string {
  return s.trim().toLowerCase()
}

export function StaticMembersPicker({
  users,
  selectedUserIds,
  onToggleUser,
  disabled = false,
}: StaticMembersPickerProps) {
  const [search, setSearch] = useState('')

  const query = useMemo(() => normalizeSearch(search), [search])

  const visibleUsers = useMemo(() => {
    if (!query) return users
    return users.filter((u) => {
      const hay = `${u.name} ${u.email}`.toLowerCase()
      return hay.includes(query)
    })
  }, [query, users])

  const selectedCount = selectedUserIds.length

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          sx={{
            flex: '1 1 200px',
            minWidth: 180,
            ...outlineFieldSx,
          }}
        />
        <Chip
          label={`${selectedCount} selected`}
          size="small"
          sx={{
            height: 28,
            fontWeight: 600,
            bgcolor: 'action.selected',
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      </Box>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        {visibleUsers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            No users match your search.
          </Typography>
        ) : (
          visibleUsers.map((user, index) => {
            const selected = selectedUserIds.includes(user.id)
            return (
              <Box key={user.id}>
                {index > 0 ? <Divider /> : null}
                <Box
                  component="button"
                  type="button"
                  disabled={disabled}
                  onClick={() => onToggleUser(user.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    width: '100%',
                    p: 1.75,
                    border: 'none',
                    bgcolor: 'transparent',
                    cursor: disabled ? 'default' : 'pointer',
                    textAlign: 'left',
                    font: 'inherit',
                    color: 'inherit',
                    '&:hover': disabled ? undefined : { bgcolor: 'action.hover' },
                  }}
                >
                  <Checkbox checked={selected} size="small" sx={{ p: 0, mt: 0.25 }} tabIndex={-1} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )
          })
        )}
      </Box>
    </Box>
  )
}
