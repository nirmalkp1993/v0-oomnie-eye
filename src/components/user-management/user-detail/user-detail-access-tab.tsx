'use client'

import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Checkbox, Radio, Stack, Typography } from '@mui/material'
import { Shield, UsersRound } from 'lucide-react'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import {
  AVAILABLE_USER_GROUPS,
  AVAILABLE_USER_ROLES,
  catalogIdToRoleName,
  groupNameToCatalogId,
  roleNameToCatalogId,
} from '@/src/constants/user-detail'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import type { UserListItem } from '@/src/types/user-management'
import { selectionCardSx } from './user-detail-styles'

function initialRoleId(user: UserListItem): string | null {
  for (const name of user.roles) {
    const id = roleNameToCatalogId(name)
    if (id) return id
  }
  return AVAILABLE_USER_ROLES[1]?.id ?? null
}

function initialGroupIds(user: UserListItem): Set<string> {
  const ids = new Set<string>()
  for (const name of user.groups) {
    const id = groupNameToCatalogId(name)
    if (id) ids.add(id)
  }
  return ids
}

export function UserDetailAccessTab({
  user,
  onUserChange,
}: {
  user: UserListItem
  onUserChange: (user: UserListItem) => void
}) {
  const { showMessage } = useAdminSnackbar()
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(() => initialRoleId(user))
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(() => initialGroupIds(user))
  const [savingRoles, setSavingRoles] = useState(false)
  const [savingGroups, setSavingGroups] = useState(false)

  useEffect(() => {
    setSelectedRoleId(initialRoleId(user))
    setSelectedGroupIds(initialGroupIds(user))
  }, [user.id])

  const handleSaveRoles = useCallback(async () => {
    if (!selectedRoleId) return
    setSavingRoles(true)
    try {
      const roleName = catalogIdToRoleName(selectedRoleId)
      onUserChange({
        ...user,
        roles: roleName ? [roleName] : [],
      })
      showMessage('Role assignment saved')
    } finally {
      setSavingRoles(false)
    }
  }, [user, selectedRoleId, onUserChange, showMessage])

  const handleSaveGroups = useCallback(async () => {
    setSavingGroups(true)
    try {
      const groups = AVAILABLE_USER_GROUPS.filter((g) => selectedGroupIds.has(g.id)).map(
        (g) => g.name
      )
      onUserChange({ ...user, groups })
      showMessage('Group membership saved')
    } finally {
      setSavingGroups(false)
    }
  }, [user, selectedGroupIds, onUserChange, showMessage])

  const toggleGroup = useCallback((groupId: string) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <EarthDialogSectionCard
        title="Assigned role"
        icon={Shield}
        tooltip="Primary role for this user within the tenant"
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => void handleSaveRoles()}
            disabled={savingRoles || !selectedRoleId}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Save role
          </Button>
        </Box>
        <Stack spacing={1.25}>
          {AVAILABLE_USER_ROLES.map((role) => {
            const selected = selectedRoleId === role.id
            return (
              <Box
                key={role.id}
                component="button"
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                sx={{
                  ...selectionCardSx(selected),
                  width: '100%',
                  textAlign: 'left',
                  font: 'inherit',
                  color: 'inherit',
                }}
              >
                <Radio checked={selected} size="small" sx={{ p: 0, mt: 0.25 }} tabIndex={-1} />
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
      </EarthDialogSectionCard>

      <EarthDialogSectionCard
        title="Group membership"
        icon={UsersRound}
        tooltip="Groups this user belongs to"
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.secondary}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <Button
            size="small"
            variant="text"
            onClick={() => void handleSaveGroups()}
            disabled={savingGroups}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Save groups
          </Button>
        </Box>
        <Stack spacing={1.25}>
          {AVAILABLE_USER_GROUPS.map((group) => {
            const selected = selectedGroupIds.has(group.id)
            return (
              <Box
                key={group.id}
                component="button"
                type="button"
                onClick={() => toggleGroup(group.id)}
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
                    {group.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.description}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Stack>
      </EarthDialogSectionCard>
    </Box>
  )
}
