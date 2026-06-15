'use client'

import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined'
import { Box } from '@mui/material'
import { BITRIX_ACCESS_UI, getModuleAccentColor } from '@/src/constants/bitrix-access-ui'

const MODULE_ICONS: Record<string, typeof PersonOutlineIcon> = {
  customer_master: PersonOutlineIcon,
  vendor_master: StorefrontOutlinedIcon,
  expense_claims: ReceiptLongOutlinedIcon,
  invoice_processing: DescriptionOutlinedIcon,
  finance_overview: DashboardOutlinedIcon,
  sales_overview: AssessmentOutlinedIcon,
  user_admin: PersonOutlineIcon,
  system_settings: SettingsOutlinedIcon,
  inventory: Inventory2OutlinedIcon,
  reports_catalog: AssessmentOutlinedIcon,
  report_designer: AssessmentOutlinedIcon,
}

export function BitrixModuleIcon({ moduleId }: { moduleId: string }) {
  const Icon = MODULE_ICONS[moduleId] ?? BusinessOutlinedIcon
  const color = getModuleAccentColor(moduleId)
  const size = BITRIX_ACCESS_UI.moduleIconSize

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon sx={{ fontSize: size * 0.58, color: '#fff' }} />
    </Box>
  )
}
