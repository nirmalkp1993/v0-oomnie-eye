'use client'

import { useState } from 'react'
import {
  Business as BusinessIcon,
  Groups as GroupsIcon,
  Public as PublicIcon,
} from '@mui/icons-material'
import { Box, Stack, Switch } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { PlacemarkSettingsCard } from '@/src/components/earth/placemark-card'
import { NestedDepartmentPicker } from './nested-department-picker'
import { UserGroupMultiSelect } from './user-group-multi-select'

export function PinPermissionTab({ onFieldChange }: { onFieldChange?: () => void }) {
  const theme = useTheme()
  const [availableToEveryone, setAvailableToEveryone] = useState(false)
  const [departmentIds, setDepartmentIds] = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])

  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <PlacemarkSettingsCard
          title="Department"
          tooltip="Select one or more departments — browse the nested tree or search to filter"
          headerIcon={<BusinessIcon />}
          accentColor={theme.palette.primary.main}
          fullHeight
        >
          <NestedDepartmentPicker
            value={departmentIds}
            onChange={(ids) => {
              setDepartmentIds(ids)
              onFieldChange?.()
            }}
          />
        </PlacemarkSettingsCard>

        <PlacemarkSettingsCard
          title="User Group"
          tooltip="Select one or more groups from user management"
          headerIcon={<GroupsIcon />}
          accentColor={theme.palette.info.main}
          fullHeight
        >
          <UserGroupMultiSelect
            value={groupIds}
            onChange={(ids) => {
              setGroupIds(ids)
              onFieldChange?.()
            }}
          />
        </PlacemarkSettingsCard>
      </Box>

      <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
        <PlacemarkSettingsCard
          title="Available to Everyone"
          tooltip='When enabled, this placemark is visible to all users regardless of department or group restrictions'
          headerIcon={<PublicIcon />}
          accentColor={theme.palette.primary.main}
          fullHeight
          action={
            <Switch
              size="small"
              checked={availableToEveryone}
              onChange={(_, checked) => {
                setAvailableToEveryone(checked)
                onFieldChange?.()
              }}
              inputProps={{ 'aria-label': 'Available to Everyone' }}
            />
          }
        />
      </Box>
    </Stack>
  )
}
