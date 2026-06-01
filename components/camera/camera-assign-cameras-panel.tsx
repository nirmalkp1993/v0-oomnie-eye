'use client'

import { useMemo, useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { CameraAssignPanelHeader } from './camera-assign-panel-header'
import {
  ExplorerListTableProvider,
  useExplorerListTable,
} from '@/components/tables/explorer-list-table-context'
import { CAMERA_LIST_COLUMNS } from '@/lib/explorer-list-table/camera-table'
import { filterPanelCameras } from '@/lib/camera-panel-filters'
import { useCameraStore } from '@/lib/camera-store'
import { EnterpriseExplorerToolbar } from '@/src/components/enterprise'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import type { Camera } from '@/types/camera'
import { CameraCardView } from './camera-card-view'
import { CameraListView } from './camera-list-view'
import type { CameraAssignRowSelection } from './camera-list-view'

function CameraAssignCamerasToolbar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  const { viewMode, setViewMode } = useCameraStore()

  return (
    <EnterpriseExplorerToolbar
      variant="drawings"
      layout="card"
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search cameras..."
      resultCount={0}
      resultLabel="camera"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      showViewModeToggle
      showTableControls
    />
  )
}

function CameraAssignCamerasBody({
  sourceCameras,
  panelSearch,
  emptyMessage,
  assignRowSelection,
  panelSearchHint,
}: {
  sourceCameras: Camera[]
  panelSearch: string
  emptyMessage: string
  assignRowSelection?: CameraAssignRowSelection
  panelSearchHint?: boolean
}) {
  const { filters } = useExplorerListTable()
  const viewMode = useCameraStore((s) => s.viewMode)

  const filteredCameras = useMemo(
    () => filterPanelCameras(sourceCameras, panelSearch, filters),
    [sourceCameras, panelSearch, filters],
  )

  if (filteredCameras.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {panelSearch.trim() || panelSearchHint ? 'No cameras match your search or filters.' : emptyMessage}
        </Typography>
      </Box>
    )
  }

  if (viewMode === 'card') {
    return (
      <CameraCardView
        mode="cameras"
        scopedCameras={filteredCameras}
        embedInCard
        assignRowSelection={assignRowSelection}
        panelSearchActive={Boolean(panelSearch.trim())}
      />
    )
  }

  return (
    <CameraListView
      mode="cameras"
      scopedCameras={filteredCameras}
      embed
      embedInCard
      assignRowSelection={assignRowSelection}
    />
  )
}

export interface CameraAssignCamerasPanelProps {
  storageKey: string
  title: string
  subtitle?: string
  sourceCameras: Camera[]
  emptyMessage: string
  assignRowSelection?: CameraAssignRowSelection
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  dropActive?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function CameraAssignCamerasPanel({
  storageKey,
  title,
  subtitle,
  sourceCameras,
  emptyMessage,
  assignRowSelection,
  onDragOver,
  onDragLeave,
  onDrop,
  dropActive,
  isFullscreen = false,
  onToggleFullscreen,
}: CameraAssignCamerasPanelProps) {
  const [panelSearch, setPanelSearch] = useState('')

  return (
    <Paper
      elevation={0}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...getEnterpriseSettingsCardSx(theme),
        ...(dropActive
          ? {
              outline: `2px dashed ${theme.palette.primary.main}`,
              outlineOffset: -2,
            }
          : {}),
      })}
    >
      <CameraAssignPanelHeader
        title={title}
        subtitle={subtitle}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen ?? (() => {})}
      />

      <ExplorerListTableProvider storageKey={storageKey} columns={CAMERA_LIST_COLUMNS}>
        <CameraAssignCamerasToolbar searchQuery={panelSearch} onSearchChange={setPanelSearch} />
        <CameraAssignCamerasBody
          sourceCameras={sourceCameras}
          panelSearch={panelSearch}
          emptyMessage={emptyMessage}
          assignRowSelection={assignRowSelection}
          panelSearchHint
        />
      </ExplorerListTableProvider>
    </Paper>
  )
}
