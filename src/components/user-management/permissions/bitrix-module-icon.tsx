'use client'

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { Box } from '@mui/material'
import { BITRIX_ACCESS_UI, getModuleAccentColor } from '@/src/constants/bitrix-access-ui'

const MODULE_ICONS: Record<string, typeof PersonOutlineIcon> = {
  earth: PublicOutlinedIcon,
  dashboard: DashboardOutlinedIcon,
  reports: AssessmentOutlinedIcon,
  alerts: NotificationsOutlinedIcon,
  camera: CameraAltOutlinedIcon,
  camera_devices: CameraAltOutlinedIcon,
  camera_groups: FolderOutlinedIcon,
  camera_recording: VideocamOutlinedIcon,
  user_management: ShieldOutlinedIcon,
  um_users: PersonOutlineIcon,
  um_groups: GroupsOutlinedIcon,
  um_roles: AdminPanelSettingsOutlinedIcon,
  um_permissions: ShieldOutlinedIcon,
  settings: SettingsOutlinedIcon,
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
