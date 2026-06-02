'use client'

import { useEffect } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { CameraDialogHeaderIcon } from './camera-dialog-header-icon'
import { Box, Chip, Tab, Tabs } from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import { EarthDialogShell } from '@/src/components/modals/earth-dialog-shell'
import { CameraDetailsTab } from './tabs/camera-details-tab'
import { StreamConfigTab } from './tabs/stream-config-tab'
import { ScheduleRecordingTab } from './tabs/schedule-recording-tab'
import { CameraLogTab } from './tabs/camera-log-tab'
import type { CameraTab } from '@/types/camera'
import {
  cameraDetailTabIndex,
  cameraEarthTabsSx,
  CameraEarthTabPanel,
  handleCameraDetailTabChange,
  type CameraDetailTabId,
} from './camera-earth-tab-panel'

const DISABLED_DETAIL_TABS = new Set<CameraTab>(['recording', 'schedule'])

function statusChipColor(status: string): 'success' | 'warning' | 'error' {
  if (status === 'live') return 'success'
  if (status === 'connecting') return 'warning'
  return 'error'
}

function isCameraDetailTab(tab: CameraTab): tab is CameraDetailTabId {
  return (
    tab === 'details' ||
    tab === 'stream' ||
    tab === 'scheduleRecording' ||
    tab === 'logs'
  )
}

export function CameraDetailModal() {
  const { selectedCamera, setSelectedCamera, activeTab, setActiveTab } = useCameraStore()

  useEffect(() => {
    if (DISABLED_DETAIL_TABS.has(activeTab)) {
      setActiveTab('details')
    }
  }, [activeTab, setActiveTab])

  if (!selectedCamera) return null

  const resolvedTab: CameraDetailTabId = isCameraDetailTab(activeTab) ? activeTab : 'details'
  const tabIndex = cameraDetailTabIndex(resolvedTab)

  const setDetailTab = (tab: CameraDetailTabId) => setActiveTab(tab)

  const statusLabel =
    selectedCamera.status === 'live'
      ? 'LIVE'
      : selectedCamera.status === 'connecting'
        ? 'CONNECTING'
        : 'STOPPED'

  return (
    <EarthDialogShell
      open
      onClose={() => setSelectedCamera(null)}
      title={selectedCamera.name}
      description={`${selectedCamera.type} camera · ${selectedCamera.ip}`}
      headerIcon={<CameraDialogHeaderIcon />}
      maxWidth={resolvedTab === 'scheduleRecording' ? '5xl' : '4xl'}
      showOpacityControl
    >
      <Box sx={{ px: 3, pt: 0, pb: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Chip
            label={statusLabel}
            size="small"
            color={statusChipColor(selectedCamera.status)}
            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
          />
        </Box>

        <Tabs
          value={tabIndex}
          onChange={(e, idx) => handleCameraDetailTabChange(e, idx, setDetailTab)}
          variant="scrollable"
          scrollButtons="auto"
          sx={cameraEarthTabsSx}
        >
          <Tab icon={<InfoOutlinedIcon />} label="Camera Details" iconPosition="start" />
          <Tab icon={<VideocamOutlinedIcon />} label="Stream Configuration" iconPosition="start" />
          <Tab
            icon={<ScheduleOutlinedIcon />}
            label="Schedule Recording"
            iconPosition="start"
          />
          <Tab icon={<TerminalOutlinedIcon />} label="Camera Log" iconPosition="start" />
        </Tabs>

        <Box
          sx={{
            minHeight: 400,
            maxHeight:
              resolvedTab === 'scheduleRecording' ? 'min(720px, 72vh)' : 'min(520px, 58vh)',
            overflow: 'auto',
            mx: resolvedTab === 'scheduleRecording' ? -1 : -0.5,
            px: resolvedTab === 'scheduleRecording' ? 1 : 0.5,
          }}
        >
          <CameraEarthTabPanel value={tabIndex} index={0}>
            <CameraDetailsTab />
          </CameraEarthTabPanel>
          <CameraEarthTabPanel value={tabIndex} index={1}>
            <StreamConfigTab />
          </CameraEarthTabPanel>
          <CameraEarthTabPanel value={tabIndex} index={2}>
            <ScheduleRecordingTab />
          </CameraEarthTabPanel>
          <CameraEarthTabPanel value={tabIndex} index={3}>
            <CameraLogTab />
          </CameraEarthTabPanel>
        </Box>
      </Box>
    </EarthDialogShell>
  )
}
