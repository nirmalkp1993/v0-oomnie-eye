'use client'

import {
  Box,
  Checkbox,
  ListItemText,
  MenuItem,
  TextField,
  type SelectChangeEvent,
} from '@mui/material'
import { PlacemarkInfoTooltip } from '@/src/components/earth/placemark-card/placemark-info-tooltip'
import { MOCK_GROUPS } from '@/src/mock-data/groups'

function formatUserGroupTriggerLabel(selectedIds: string[]): string {
  if (selectedIds.length === 0) return 'None'
  const names = selectedIds
    .map((id) => MOCK_GROUPS.find((group) => group.id === id)?.name)
    .filter((name): name is string => Boolean(name))
  if (names.length <= 2) return names.join(', ')
  return `${names.length} user groups selected`
}

export function UserGroupMultiSelect({
  value,
  onChange,
}: {
  value: string[]
  onChange: (groupIds: string[]) => void
}) {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const next = event.target.value
    onChange(typeof next === 'string' ? next.split(',') : next)
  }

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          User Group
          <PlacemarkInfoTooltip
            title="Select one or more groups from the Groups module"
            placement="top"
          />
        </Box>
      }
      value={value}
      onChange={handleChange}
      SelectProps={{
        multiple: true,
        displayEmpty: true,
        renderValue: () => formatUserGroupTriggerLabel(value),
      }}
    >
      {MOCK_GROUPS.map((group) => (
        <MenuItem key={group.id} value={group.id}>
          <Checkbox checked={value.includes(group.id)} size="small" />
          <ListItemText primary={group.name} />
        </MenuItem>
      ))}
    </TextField>
  )
}
