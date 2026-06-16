'use client'

import { useEffect, useState } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import { Box, Button, Tab, Tabs } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import { CameraEarthTabPanel, cameraEarthTabsSx } from '@/components/camera/camera-earth-tab-panel'
import { EarthDialogShell } from '@/src/components/modals/earth-dialog-shell'
import { UserStatusBadge } from '@/src/components/user-management/user-status-badge'
import { UserDetailAccessTab } from '@/src/components/user-management/user-detail/user-detail-access-tab'
import { UserDetailAuditTab } from '@/src/components/user-management/user-detail/user-detail-audit-tab'
import { UserDetailProfileTab } from '@/src/components/user-management/user-detail/user-detail-profile-tab'
import type { UserListItem } from '@/src/types/user-management'

type UserDetailTabId = 'profile' | 'access' | 'audit'

const TAB_INDEX: Record<UserDetailTabId, number> = {
  profile: 0,
  access: 1,
  audit: 2,
}

export interface UserDetailModalProps {
  user: UserListItem | null
  open: boolean
  onClose: () => void
  onUserChange: (user: UserListItem) => void
  onEditProfile?: (user: UserListItem) => void
}

export function UserDetailModal({
  user,
  open,
  onClose,
  onUserChange,
  onEditProfile,
}: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<UserDetailTabId>('profile')

  useEffect(() => {
    if (open) setActiveTab('profile')
  }, [open, user?.id])

  if (!open || !user) return null

  const tabIndex = TAB_INDEX[activeTab]

  return (
    <EarthDialogShell
      open={open}
      onClose={onClose}
      title={user.name}
      description={user.email}
      headerIcon={<PersonIcon sx={{ fontSize: 28 }} />}
      maxWidth="6xl"
      showOpacityControl
      footer={
        onEditProfile ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 1 }}>
            <Button variant="outlined" onClick={onClose} sx={{ textTransform: 'none' }}>
              Close
            </Button>
            <Button
              variant="contained"
              startIcon={<EditOutlinedIcon />}
              onClick={() => onEditProfile(user)}
              sx={{ textTransform: 'none' }}
            >
              Edit profile
            </Button>
          </Box>
        ) : undefined
      }
    >
      <Box sx={{ px: 3, pt: 0, pb: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <UserStatusBadge status={user.status} />
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(_, idx) => {
            const tabs: UserDetailTabId[] = ['profile', 'access', 'audit']
            const id = tabs[idx]
            if (id) setActiveTab(id)
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={cameraEarthTabsSx}
        >
          <Tab icon={<PersonOutlineOutlinedIcon />} label="Profile" iconPosition="start" />
          <Tab icon={<SecurityOutlinedIcon />} label="Roles & Groups" iconPosition="start" />
          <Tab icon={<HistoryOutlinedIcon />} label="Audit" iconPosition="start" />
        </Tabs>

        <Box
          sx={{
            minHeight: 400,
            maxHeight: 'min(520px, 58vh)',
            overflow: 'auto',
            mx: -0.5,
            px: 0.5,
          }}
        >
          <CameraEarthTabPanel value={tabIndex} index={0}>
            <UserDetailProfileTab user={user} />
          </CameraEarthTabPanel>
          <CameraEarthTabPanel value={tabIndex} index={1}>
            <UserDetailAccessTab user={user} onUserChange={onUserChange} />
          </CameraEarthTabPanel>
          <CameraEarthTabPanel value={tabIndex} index={2}>
            <UserDetailAuditTab user={user} />
          </CameraEarthTabPanel>
        </Box>
      </Box>
    </EarthDialogShell>
  )
}
