'use client'

import { useMemo, useState } from 'react'
import { Box, Breadcrumbs, Link, Paper, Typography } from '@mui/material'
import { CameraAssignPanelHeader } from './camera-assign-panel-header'
import {
  ExplorerListTableProvider,
  useExplorerListTable,
} from '@/components/tables/explorer-list-table-context'
import { CAMERA_LIST_COLUMNS } from '@/lib/explorer-list-table/camera-table'
import { filterPanelCameras } from '@/lib/camera-panel-filters'
import { findCameraTableGroupNode, useCameraStore } from '@/lib/camera-store'
import { EnterpriseExplorerToolbar } from '@/src/components/enterprise'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import type { Camera } from '@/types/camera'
import { CameraCardView } from './camera-card-view'
import { CameraListView } from './camera-list-view'
import type { CameraAssignRowSelection } from './camera-list-view'
import {
  cameraBreadcrumbCurrentSx,
  cameraBreadcrumbLinkSx,
  cameraBreadcrumbsSx,
} from './camera-module.styles'

export interface AssignFolderBreadcrumbItem {
  id: string
  name: string
}

function CameraAssignInFolderToolbar({
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
      searchPlaceholder="Search folders and cameras..."
      resultCount={0}
      resultLabel="item"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      showViewModeToggle
      showTableControls
    />
  )
}

function CameraAssignInFolderBody({
  activeFolderId,
  folderExplorerDepth,
  panelSearch,
  emptyMessage,
  assignRowSelection,
  onOpenSubfolder,
  panelSearchHint,
}: {
  activeFolderId: string | null
  folderExplorerDepth: number
  panelSearch: string
  emptyMessage: string
  assignRowSelection?: CameraAssignRowSelection
  onOpenSubfolder: (groupId: string) => void
  panelSearchHint?: boolean
}) {
  const { filters } = useExplorerListTable()
  const viewMode = useCameraStore((s) => s.viewMode)
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const getCameraTableTree = useCameraStore((s) => s.getCameraTableTree)
  const cameras = useCameraStore((s) => s.cameras)

  const { folderIds, folderCameras } = useMemo(() => {
    if (!activeFolderId) return { folderIds: [] as string[], folderCameras: [] as Camera[] }

    const raw = getCameraTableTree()
    const node = findCameraTableGroupNode(raw.rootTrees, activeFolderId)

    if (!node) return { folderIds: [] as string[], folderCameras: [] as Camera[] }

    const q = panelSearch.trim().toLowerCase()
    const childIds = node.children
      .map((n) => n.group)
      .filter((g) => !q || g.name.toLowerCase().includes(q))
      .map((g) => g.id)

    const cams = filterPanelCameras(node.cameras, panelSearch, filters)

    return { folderIds: childIds, folderCameras: cams }
  }, [activeFolderId, getCameraTableTree, cameras, cameraGroups, panelSearch, filters])

  const isEmpty = !activeFolderId || (folderIds.length === 0 && folderCameras.length === 0)

  if (isEmpty) {
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
          {!activeFolderId
            ? 'Select a group on the left.'
            : panelSearch.trim() || panelSearchHint
              ? 'No folders or cameras match your search or filters.'
              : emptyMessage}
        </Typography>
      </Box>
    )
  }

  if (viewMode === 'card') {
    return (
      <CameraCardView
        mode="groups"
        scopedGroupFolderId={activeFolderId}
        scopedSubfolderIds={folderIds}
        onOpenScopedSubfolder={onOpenSubfolder}
        scopedCameras={folderCameras}
        embedInCard
        assignRowSelection={assignRowSelection}
        panelSearchActive={Boolean(panelSearch.trim())}
        hideBreadcrumbs
        folderExplorerDepth={folderExplorerDepth}
      />
    )
  }

  return (
    <CameraListView
      mode="groups"
      scopedGroupFolderId={activeFolderId}
      scopedSubfolderIds={folderIds}
      onOpenScopedSubfolder={onOpenSubfolder}
      scopedCameras={folderCameras}
      embed
      embedInCard
      assignRowSelection={assignRowSelection}
    />
  )
}

export interface CameraAssignInFolderPanelProps {
  storageKey: string
  title: string
  subtitle?: string
  activeFolderId: string | null
  breadcrumbItems: AssignFolderBreadcrumbItem[]
  onBreadcrumbNavigate: (segmentIndex: number) => void
  onOpenSubfolder: (groupId: string) => void
  emptyMessage: string
  assignRowSelection?: CameraAssignRowSelection
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  dropActive?: boolean
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export function CameraAssignInFolderPanel({
  storageKey,
  title,
  subtitle,
  activeFolderId,
  breadcrumbItems,
  onBreadcrumbNavigate,
  onOpenSubfolder,
  emptyMessage,
  assignRowSelection,
  onDragOver,
  onDragLeave,
  onDrop,
  dropActive,
  isFullscreen = false,
  onToggleFullscreen,
}: CameraAssignInFolderPanelProps) {
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

      {breadcrumbItems.length > 0 ? (
        <Box sx={{ px: 1, pt: 0, pb: 0.5 }}>
          <Breadcrumbs aria-label="folder breadcrumb" separator="›" sx={cameraBreadcrumbsSx}>
            {breadcrumbItems.map((item, i) => {
              const isLast = i === breadcrumbItems.length - 1
              if (isLast) {
                return (
                  <Typography
                    key={item.id}
                    variant="body2"
                    noWrap
                    title={item.name}
                    sx={{
                      ...cameraBreadcrumbCurrentSx,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 300,
                    }}
                  >
                    {item.name}
                  </Typography>
                )
              }
              return (
                <Link
                  key={item.id}
                  component="button"
                  type="button"
                  variant="body2"
                  underline="hover"
                  title={item.name}
                  onClick={() => onBreadcrumbNavigate(i)}
                  sx={cameraBreadcrumbLinkSx}
                >
                  {item.name}
                </Link>
              )
            })}
          </Breadcrumbs>
        </Box>
      ) : null}

      <ExplorerListTableProvider storageKey={storageKey} columns={CAMERA_LIST_COLUMNS}>
        <CameraAssignInFolderToolbar searchQuery={panelSearch} onSearchChange={setPanelSearch} />
        <CameraAssignInFolderBody
          activeFolderId={activeFolderId}
          folderExplorerDepth={Math.max(0, breadcrumbItems.length - 1)}
          panelSearch={panelSearch}
          emptyMessage={emptyMessage}
          assignRowSelection={assignRowSelection}
          onOpenSubfolder={onOpenSubfolder}
          panelSearchHint
        />
      </ExplorerListTableProvider>
    </Paper>
  )
}
