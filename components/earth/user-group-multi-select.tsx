'use client'

import {
  Checkbox,
  ListItemText,
  MenuItem,
  TextField,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
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
      label="User Group"
      value={value}
      onChange={handleChange}
      InputLabelProps={{ shrink: true }}
      SelectProps={{
        multiple: true,
        displayEmpty: true,
        renderValue: (selected) => {
          const ids = selected as string[]
          if (ids.length === 0) {
            return (
              <Typography variant="body2" fontStyle="italic" color="text.secondary">
                None
              </Typography>
            )
          }
          return formatUserGroupTriggerLabel(ids)
        },
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
