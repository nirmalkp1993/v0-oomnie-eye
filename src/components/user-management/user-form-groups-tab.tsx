'use client'

import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import {
  Autocomplete,
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { selectionCardSx } from '@/src/components/user-management/user-detail/user-detail-styles'
import { getGroupMembers } from '@/src/lib/user-management/group-members.utils'
import { MOCK_GROUPS } from '@/src/mock-data/groups'
import type { GroupListItem } from '@/src/types/user-management'

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

function groupInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function UserFormGroupsTab({
  groupIds,
  onGroupIdsChange,
  readOnly = false,
}: {
  groupIds: string[]
  onGroupIdsChange: (groupIds: string[]) => void
  readOnly?: boolean
}) {
  const directoryUsers = useUserDirectoryStore((state) => state.users)
  const [searchInput, setSearchInput] = useState('')
  const [focusedGroupId, setFocusedGroupId] = useState<string | null>(null)

  const selectedGroups = useMemo(
    () =>
      groupIds
        .map((id) => MOCK_GROUPS.find((group) => group.id === id))
        .filter((group): group is GroupListItem => Boolean(group)),
    [groupIds],
  )

  const availableGroups = useMemo(
    () => MOCK_GROUPS.filter((group) => !groupIds.includes(group.id)),
    [groupIds],
  )

  const focusedGroup = useMemo(
    () => selectedGroups.find((group) => group.id === focusedGroupId) ?? null,
    [focusedGroupId, selectedGroups],
  )

  const focusedMembers = useMemo(
    () => (focusedGroup ? getGroupMembers(focusedGroup, directoryUsers) : []),
    [directoryUsers, focusedGroup],
  )

  useEffect(() => {
    if (selectedGroups.length === 0) {
      setFocusedGroupId(null)
      return
    }
    if (!focusedGroupId || !groupIds.includes(focusedGroupId)) {
      setFocusedGroupId(selectedGroups[0]?.id ?? null)
    }
  }, [focusedGroupId, groupIds, selectedGroups])

  const addGroup = (group: GroupListItem) => {
    if (groupIds.includes(group.id)) return
    onGroupIdsChange([...groupIds, group.id])
    setFocusedGroupId(group.id)
    setSearchInput('')
  }

  const removeGroup = (groupId: string) => {
    onGroupIdsChange(groupIds.filter((id) => id !== groupId))
  }

  return (
    <EarthDialogSectionCard
      title="Group membership"
      icon={UsersRound}
      tooltip="Assign this user to one or more groups"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.secondary}
    >
      {!readOnly ? (
        <DialogFormField label="Search groups" htmlFor="userFormGroupSearch">
          <Autocomplete
            id="userFormGroupSearch"
            options={availableGroups}
            value={null}
            inputValue={searchInput}
            onInputChange={(_, value) => setSearchInput(value)}
            onChange={(_, group) => {
              if (group) addGroup(group)
            }}
            getOptionLabel={(group) => group.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            noOptionsText={
              availableGroups.length === 0 && groupIds.length > 0
                ? 'All groups are already assigned'
                : 'No groups match your search'
            }
            renderInput={(params) => (
              <TextField {...params} placeholder="Search group name…" sx={outlineFieldSx} />
            )}
            renderOption={(props, group) => (
              <Box component="li" {...props} key={group.id}>
                <Box sx={{ py: 0.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {group.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.description}
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
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 3fr' },
          gap: 2,
          minHeight: 280,
        }}
      >
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Box sx={{ px: 1.5, py: 1, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Selected groups ({selectedGroups.length})
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {selectedGroups.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                {readOnly ? 'No groups assigned.' : 'No groups selected. Search above to add groups.'}
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {selectedGroups.map((group) => {
                  const selected = focusedGroupId === group.id
                  return (
                    <Box
                      key={group.id}
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
                        onClick={() => setFocusedGroupId(group.id)}
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
                          {group.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {group.type === 'dynamic' ? 'Dynamic' : 'Static'}
                        </Typography>
                      </Box>
                      {!readOnly ? (
                        <Tooltip title="Remove group">
                          <IconButton
                            size="small"
                            aria-label={`Remove ${group.name}`}
                            onClick={() => removeGroup(group.id)}
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

        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <Box sx={{ px: 1.5, py: 1, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {focusedGroup ? `Members · ${focusedGroup.name}` : 'Group members'}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {!focusedGroup ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                Select a group on the left to view its members.
              </Typography>
            ) : focusedMembers.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No members in this group yet.
              </Typography>
            ) : (
              <List dense disablePadding>
                {focusedMembers.map((member, index) => (
                  <Box key={member.id}>
                    {index > 0 ? <Divider component="li" /> : null}
                    <ListItem sx={{ py: 1.25, px: 2 }}>
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar
                          src={member.avatarUrl}
                          alt={member.name}
                          sx={{ width: 32, height: 32, fontSize: 13 }}
                        >
                          {groupInitials(member.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={member.email}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Box>
    </EarthDialogSectionCard>
  )
}
