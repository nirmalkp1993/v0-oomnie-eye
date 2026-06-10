'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  Box,
  Breadcrumbs,
  Card,
  Link,
  Tooltip,
  Typography,
} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import HomeIcon from '@mui/icons-material/Home'
import MonitorOutlinedIcon from '@mui/icons-material/MonitorOutlined'
import {
  countCamerasInGroupSubtree,
  findCameraTableGroupNode,
  useCameraStore,
} from '@/lib/camera-store'
import { applyCameraListFilters } from '@/lib/explorer-list-table/camera-table'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import type { Camera, CameraGroup } from '@/types/camera'
import { CameraThumbnailMarkerOverlay } from './camera-thumbnail-marker-editor'
import {
  CAMERA_GRID,
  cameraBreadcrumbCurrentSx,
  cameraBreadcrumbLinkSx,
  cameraBreadcrumbsSx,
  cameraGridCardSx,
  cameraGridContainerSx,
  cameraGridItemSx,
  cameraGridMetaSx,
  cameraGridNameSx,
  cameraGridThumbSx,
  cameraGridWrapSx,
} from './camera-module.styles'
import { MyDrawingsGridCardChrome } from '@/src/components/tables/my-drawings-grid-card-chrome'

function camGroupIds(c: Camera): string[] {
  return c.groupIds ?? []
}

function grpParentIds(g: CameraGroup): string[] {
  return g.parentGroupIds ?? []
}

function directChildCount(folderId: string, groups: CameraGroup[], cameras: Camera[]): number {
  const subfolders = groups.filter((g) => grpParentIds(g).includes(folderId)).length
  const cams = cameras.filter((c) => camGroupIds(c).includes(folderId)).length
  return subfolders + cams
}

function statusLabel(status: Camera['status']): string {
  if (status === 'live') return 'Live'
  if (status === 'connecting') return 'Connecting'
  return 'Stopped'
}

import type { CameraManagementMode } from './camera-management-mode'
import type { CameraAssignRowSelection } from './camera-list-view'

interface CameraCardViewProps {
  mode: CameraManagementMode
  scopedCameras?: Camera[]
  scopedGroupFolderId?: string | null
  scopedSubfolderIds?: string[]
  onOpenScopedSubfolder?: (groupId: string) => void
  hideBreadcrumbs?: boolean
  folderExplorerDepth?: number
  embedInCard?: boolean
  assignRowSelection?: CameraAssignRowSelection
  panelSearchActive?: boolean
}

export function CameraCardView({
  mode,
  scopedCameras,
  scopedGroupFolderId = null,
  scopedSubfolderIds,
  onOpenScopedSubfolder,
  hideBreadcrumbs = false,
  folderExplorerDepth = 0,
  embedInCard = false,
  assignRowSelection,
  panelSearchActive = false,
}: CameraCardViewProps) {
  const isAssignFolderExplorer =
    scopedGroupFolderId != null && scopedSubfolderIds != null && scopedCameras != null
  const isScopedCameraList = scopedCameras != null && !isAssignFolderExplorer
  const cameras = useCameraStore((s) => s.cameras)
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const searchQuery = useCameraStore((s) => s.searchQuery)
  const getCameraTableTree = useCameraStore((s) => s.getCameraTableTree)
  const cardExplorerStack = useCameraStore((s) => s.cardExplorerStack)
  const pushCardExplorerFolder = useCameraStore((s) => s.pushCardExplorerFolder)
  const navigateCardExplorerToSegmentIndex = useCameraStore((s) => s.navigateCardExplorerToSegmentIndex)
  const setSelectedCamera = useCameraStore((s) => s.setSelectedCamera)

  const getFilteredCameras = useCameraStore((s) => s.getFilteredCameras)
  const { filters } = useExplorerListTable()
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null)

  const currentFolderId =
    mode === 'groups' && cardExplorerStack.length > 0
      ? cardExplorerStack[cardExplorerStack.length - 1]
      : null

  const folderDepth = isAssignFolderExplorer
    ? folderExplorerDepth
    : mode === 'groups'
      ? cardExplorerStack.length
      : 0
  const displayLevel = folderDepth + 1

  const { folderCards, cameraCards } = useMemo(() => {
    if (isAssignFolderExplorer) {
      const groups = scopedSubfolderIds
        .map((id) => cameraGroups.find((g) => g.id === id))
        .filter((g): g is CameraGroup => g != null)
      return {
        folderCards: groups,
        cameraCards: scopedCameras,
      }
    }
    if (isScopedCameraList) {
      return {
        folderCards: [] as CameraGroup[],
        cameraCards: scopedCameras,
      }
    }
    if (mode === 'cameras') {
      return {
        folderCards: [] as CameraGroup[],
        cameraCards: getFilteredCameras(),
      }
    }

    const raw = getCameraTableTree()
    const filtered = applyCameraListFilters(
      raw.rootTrees,
      raw.rootCameras,
      filters,
      (groupId) => countCamerasInGroupSubtree(groupId, cameras, cameraGroups)
    )

    if (!currentFolderId) {
      return {
        folderCards: filtered.rootTrees.map((n) => n.group),
        cameraCards: filtered.rootCameras,
      }
    }

    const node = findCameraTableGroupNode(filtered.rootTrees, currentFolderId)
    if (!node) {
      return { folderCards: [] as CameraGroup[], cameraCards: [] as Camera[] }
    }

    return {
      folderCards: node.children.map((n) => n.group),
      cameraCards: node.cameras,
    }
  }, [
    mode,
    isAssignFolderExplorer,
    isScopedCameraList,
    scopedCameras,
    scopedSubfolderIds,
    getCameraTableTree,
    getFilteredCameras,
    filters,
    currentFolderId,
    cameras,
    cameraGroups,
  ])

  const totalItems = folderCards.length + cameraCards.length

  const breadcrumbItems = useMemo(() => {
    if (mode === 'cameras') return []
    const items: { label: string; index: number; isRoot: boolean }[] = [
      { label: 'Root', index: 0, isRoot: true },
    ]
    cardExplorerStack.forEach((id, i) => {
      const g = cameraGroups.find((x) => x.id === id)
      items.push({ label: g?.name ?? id, index: i + 1, isRoot: false })
    })
    return items
  }, [mode, cardExplorerStack, cameraGroups])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        ...(embedInCard ? { minWidth: 0, overflow: 'hidden' } : {}),
      }}
    >
      {mode === 'groups' && !isScopedCameraList && !hideBreadcrumbs && (
        <Box sx={{ px: 1, pt: 0.5, pb: 1 }}>
          <Breadcrumbs aria-label="breadcrumb" separator="›" sx={cameraBreadcrumbsSx}>
            {breadcrumbItems.map((item, i) => {
            const isLast = i === breadcrumbItems.length - 1
            if (isLast) {
              return (
                <Typography
                  key={`${item.label}-${i}`}
                  variant="body2"
                  noWrap
                  title={item.label}
                  sx={{
                    ...cameraBreadcrumbCurrentSx,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 300,
                    ...(item.isRoot && { gap: 0.5 }),
                  }}
                >
                  {item.isRoot && <HomeIcon sx={{ fontSize: 20, flexShrink: 0 }} />}
                  {item.label}
                </Typography>
              )
            }
            return (
              <Link
                key={`${item.label}-${i}`}
                component="button"
                type="button"
                variant="body2"
                underline={item.isRoot ? 'none' : 'hover'}
                title={item.label}
                onClick={() => navigateCardExplorerToSegmentIndex(item.index)}
                sx={
                  item.isRoot
                    ? {
                        ...cameraBreadcrumbCurrentSx,
                        cursor: 'pointer',
                        textDecoration: 'none',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        '&:hover': {
                          color: CAMERA_GRID.textPrimary,
                          bgcolor: 'transparent',
                        },
                      }
                    : cameraBreadcrumbLinkSx
                }
              >
                {item.isRoot && <HomeIcon sx={{ fontSize: 20, flexShrink: 0 }} />}
                {item.label}
              </Link>
            )
          })}
        </Breadcrumbs>
      </Box>
      )}

      <Box sx={cameraGridContainerSx}>
        <Box sx={cameraGridWrapSx}>
          {folderCards.map((group) => {
            const n = directChildCount(group.id, cameraGroups, cameras)
            const isHovered = hoveredFolderId === group.id
            return (
              <Box key={group.id} sx={cameraGridItemSx(folderDepth)}>
                <Card
                  elevation={0}
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => setHoveredFolderId(group.id)}
                  onMouseLeave={() => setHoveredFolderId(null)}
                  onClick={() =>
                    isAssignFolderExplorer
                      ? onOpenScopedSubfolder?.(group.id)
                      : pushCardExplorerFolder(group.id)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (isAssignFolderExplorer) {
                        onOpenScopedSubfolder?.(group.id)
                      } else {
                        pushCardExplorerFolder(group.id)
                      }
                    }
                  }}
                  sx={cameraGridCardSx({ depth: folderDepth })}
                >
                  <MyDrawingsGridCardChrome
                    level={displayLevel}
                    isFolder
                    folderLabel={group.name}
                    onFolderOpen={() =>
                      isAssignFolderExplorer
                        ? onOpenScopedSubfolder?.(group.id)
                        : pushCardExplorerFolder(group.id)
                    }
                  />

                  <Box
                    sx={{
                      p: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.5,
                      height: '100%',
                    }}
                  >
                    <Box sx={cameraGridThumbSx}>
                      {isHovered ? (
                        <FolderOpenIcon sx={{ fontSize: 120, color: '#2932E5' }} />
                      ) : (
                        <FolderIcon sx={{ fontSize: 120, color: '#4A5565' }} />
                      )}
                    </Box>

                    <Tooltip title={group.name} placement="top">
                      <span style={{ display: 'inline-flex', width: '100%' }}>
                        <Typography variant="body2" sx={cameraGridNameSx}>
                          {group.name}
                        </Typography>
                      </span>
                    </Tooltip>

                    <Typography variant="caption" sx={cameraGridMetaSx}>
                      {n} item{n === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                </Card>
              </Box>
            )
          })}

          {cameraCards.map((camera) => {
            const isAssignSelected = assignRowSelection?.selectedIds.has(camera.id) ?? false
            return (
            <Box key={camera.id} sx={cameraGridItemSx(folderDepth)}>
              <Card
                elevation={0}
                role="button"
                tabIndex={0}
                draggable={assignRowSelection?.isRowDraggable?.(camera) ?? false}
                onDragStart={
                  assignRowSelection?.onRowDragStart
                    ? (e) => assignRowSelection.onRowDragStart!(camera, e)
                    : undefined
                }
                onClick={() => {
                  if (assignRowSelection) {
                    assignRowSelection.onToggleSelect(camera.id)
                    return
                  }
                  setSelectedCamera(camera)
                }}
                onDoubleClick={() => assignRowSelection?.onRowDoubleClick?.(camera)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (assignRowSelection) {
                      assignRowSelection.onToggleSelect(camera.id)
                      return
                    }
                    setSelectedCamera(camera)
                  }
                }}
                sx={{
                  ...cameraGridCardSx({ depth: folderDepth }),
                  ...(isAssignSelected
                    ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 }
                    : {}),
                }}
              >
                <MyDrawingsGridCardChrome level={displayLevel} />

                <Box
                  sx={{
                    p: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    height: '100%',
                  }}
                >
                  <Box sx={{ ...cameraGridThumbSx, position: 'relative' }}>
                    {camera.thumbnail ? (
                      <>
                        <Image
                          src={camera.thumbnail}
                          alt={camera.name}
                          width={200}
                          height={200}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                        <CameraThumbnailMarkerOverlay marker={camera.thumbnailMarker} size={24} />
                      </>
                    ) : (
                      <MonitorOutlinedIcon sx={{ fontSize: 64, color: '#4A5565' }} />
                    )}
                  </Box>

                  <Tooltip title={camera.name} placement="top">
                    <span style={{ display: 'inline-flex', width: '100%' }}>
                      <Typography variant="body2" sx={cameraGridNameSx}>
                        {camera.name}
                      </Typography>
                    </span>
                  </Tooltip>

                  <Typography variant="caption" sx={cameraGridMetaSx}>
                    {statusLabel(camera.status)}
                    {camera.ip ? ` · ${camera.ip}` : ''}
                  </Typography>
                </Box>
              </Card>
            </Box>
            )
          })}
        </Box>

        {totalItems === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              height: '100%',
              width: '100%',
              py: 6,
            }}
          >
            <FolderIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
            <Typography
              variant="body1"
              sx={{
                color: '#4A5565',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {panelSearchActive || searchQuery.trim()
                ? 'No cameras found'
                : mode === 'cameras' || isScopedCameraList
                  ? 'No cameras yet. Add a camera to get started.'
                  : 'This folder is empty'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
