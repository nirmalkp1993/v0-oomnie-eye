'use client'

import { useEffect } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import { EnterpriseSettingsTabs } from '@/src/components/enterprise'
import { CameraDetailsTab } from './tabs/camera-details-tab'
import { StreamConfigTab } from './tabs/stream-config-tab'
import { RecordingTab } from './tabs/recording-tab'
import { ScheduleTab } from './tabs/schedule-tab'
import { CameraLogTab } from './tabs/camera-log-tab'
import type { CameraTab } from '@/types/camera'

const DISABLED_DETAIL_TABS = new Set<CameraTab>(['recording', 'schedule'])

const DETAIL_TABS: { value: CameraTab; label: string; icon: React.ReactElement; disabled?: boolean }[] = [
  { value: 'details', label: 'Camera Details', icon: <InfoOutlinedIcon fontSize="small" /> },
  { value: 'stream', label: 'Stream Configuration', icon: <VideocamOutlinedIcon fontSize="small" /> },
  { value: 'recording', label: 'Recording', icon: <VideoLibraryOutlinedIcon fontSize="small" />, disabled: true },
  { value: 'schedule', label: 'Stream Recording Schedule', icon: <CalendarMonthOutlinedIcon fontSize="small" />, disabled: true },
  { value: 'logs', label: 'Camera Log', icon: <TerminalOutlinedIcon fontSize="small" /> },
]

function statusChipColor(status: string): 'success' | 'warning' | 'error' {
  if (status === 'live') return 'success'
  if (status === 'connecting') return 'warning'
  return 'error'
}

export function CameraDetailView() {
  const { selectedCamera, setSelectedCamera, activeTab, setActiveTab } = useCameraStore()

  useEffect(() => {
    if (DISABLED_DETAIL_TABS.has(activeTab)) {
      setActiveTab('details')
    }
  }, [activeTab, setActiveTab])

  if (!selectedCamera) return null

  return (
    <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: 3,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to cameras">
            <IconButton
              size="small"
              onClick={() => setSelectedCamera(null)}
              aria-label="Back to cameras"
              sx={{ color: 'text.secondary' }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h4"
            component="h1"
            color="warning.main"
            noWrap
            sx={{ flex: 1, minWidth: 0, fontWeight: 700 }}
          >
            {selectedCamera.name}
          </Typography>
          <Chip
            label={selectedCamera.status.toUpperCase()}
            size="small"
            color={statusChipColor(selectedCamera.status)}
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </Box>

      <EnterpriseSettingsTabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as CameraTab)}
        ariaLabel="Camera detail tabs"
        tabs={DETAIL_TABS}
      />

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {activeTab === 'details' && <CameraDetailsTab />}
        {activeTab === 'stream' && <StreamConfigTab />}
        {activeTab === 'recording' && <RecordingTab />}
        {activeTab === 'schedule' && <ScheduleTab />}
        {activeTab === 'logs' && <CameraLogTab />}
      </Box>
    </Box>
  )
}
