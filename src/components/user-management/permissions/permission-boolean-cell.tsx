'use client'

import { Switch } from '@mui/material'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'

export function PermissionBooleanCell({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label: string
}) {
  return (
    <Switch
      size="small"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      inputProps={{ 'aria-label': label }}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': {
          color: BITRIX_ACCESS_UI.primaryBlue,
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
          backgroundColor: BITRIX_ACCESS_UI.primaryBlue,
        },
      }}
    />
  )
}
