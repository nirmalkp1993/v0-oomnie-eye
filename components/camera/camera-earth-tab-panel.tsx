'use client'

import type { ReactNode, SyntheticEvent } from 'react'
import { Box } from '@mui/material'
import { globalSettingsDialogTabsSx } from '@/src/components/settings/settings-module-tabs.styles'
import { PL_CARD_SPACING } from '@/src/components/theme/professional-light-theme'

/** MUI tab strip — Professional Light dialog tabs */
export const cameraEarthTabsSx = {
  ...globalSettingsDialogTabsSx,
  mx: -3,
  px: 3,
  mb: 0,
  '& .MuiSvgIcon-root': { fontSize: 24 },
} as const

export function CameraEarthTabPanel({
  children,
  value,
  index,
}: {
  children: ReactNode
  value: number
  index: number
}) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ py: PL_CARD_SPACING }}>
      {value === index ? children : null}
    </Box>
  )
}

export type CameraDetailTabId = 'details' | 'stream' | 'scheduleRecording' | 'logs'

export const CAMERA_DETAIL_TAB_INDEX: Record<CameraDetailTabId, number> = {
  details: 0,
  stream: 1,
  scheduleRecording: 2,
  logs: 3,
}

export const CAMERA_DETAIL_TAB_IDS: CameraDetailTabId[] = [
  'details',
  'stream',
  'scheduleRecording',
  'logs',
]

export function cameraDetailTabIndex(tab: CameraDetailTabId): number {
  return CAMERA_DETAIL_TAB_INDEX[tab]
}

export function cameraDetailTabFromIndex(index: number): CameraDetailTabId {
  return CAMERA_DETAIL_TAB_IDS[index] ?? 'details'
}

export function handleCameraDetailTabChange(
  _: SyntheticEvent,
  newIndex: number,
  setActiveTab: (tab: CameraDetailTabId) => void,
) {
  setActiveTab(cameraDetailTabFromIndex(newIndex))
}
