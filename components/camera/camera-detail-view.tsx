'use client'

import { useEffect } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { Box, Chip, Container, IconButton, Tooltip, Typography } from '@mui/material'
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
  { value: 'details', label: 'Camera Details', icon: <InfoOutlinedIcon /> },
  { value: 'stream', label: 'Stream Configuration', icon: <VideocamOutlinedIcon /> },
  { value: 'logs', label: 'Camera Log', icon: <TerminalOutlinedIcon /> },
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
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          py: 3,
          px: { xs: 2, sm: 3 },
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <Tooltip title="Back to cameras">
            <IconButton
              onClick={() => setSelectedCamera(null)}
              aria-label="Back to cameras"
              edge="start"
              sx={{ ml: -1, color: 'text.secondary' }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h4"
            component="h1"
            color="warning.light"
            noWrap
            sx={{ flex: 1, minWidth: 0 }}
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

        <EnterpriseSettingsTabs
          value={activeTab}
          onChange={(v) => setActiveTab(v as CameraTab)}
          ariaLabel="Camera detail tabs"
          tabs={DETAIL_TABS}
          variant="page"
        />

        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0, width: '100%', minWidth: 0 }}>
          {activeTab === 'details' && <CameraDetailsTab />}
          {activeTab === 'stream' && <StreamConfigTab />}
          {activeTab === 'recording' && <RecordingTab />}
          {activeTab === 'schedule' && <ScheduleTab />}
          {activeTab === 'logs' && <CameraLogTab />}
        </Box>
      </Container>
    </Box>
  )
}
