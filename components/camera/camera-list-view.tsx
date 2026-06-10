'use client'

import { Fragment, useCallback, useEffect, useMemo } from 'react'
import {
  useCameraStore,
  countCamerasInGroupSubtree,
  type CameraTableGroupNode,
} from '@/lib/camera-store'
import type { Camera, CameraGroup } from '@/types/camera'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import StopIcon from '@mui/icons-material/Stop'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { FolderPlus, Camera as CameraIconLucide } from 'lucide-react'
import { ExplorerTableHeaderRow } from '@/components/tables/explorer-table-header-row'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import {
  applyCameraListFilters,
  getCameraFilterValues,
  getCameraGroupFilterValues,
} from '@/lib/explorer-list-table/camera-table'
import { getSortedTreeSiblings } from '@/lib/explorer-list-table/tree-sort'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import { MyDrawingsTreeDepthIndicators } from '@/src/components/tables/my-drawings-tree-depth-indicators'
import {
  CAMERA_TABLE,
  cameraBodyPrimaryTypographySx,
  cameraBodyRowSx,
  cameraBodySecondaryTypographySx,
  cameraTableBodySx,
  cameraTableCellSx,
  cameraTableHeadSx,
  cameraTableSx,
} from './camera-module.styles'

const CELL_DASH = '—'

function collectAllGroupIds(nodes: CameraTableGroupNode[]): string[] {
  const ids: string[] = []
  const walk = (n: CameraTableGroupNode) => {
    ids.push(n.group.id)
    n.children.forEach(walk)
  }
  nodes.forEach(walk)
  return ids
}

function NameCellShell({
  depth,
  isFolder = false,
  children,
}: {
  depth: number
  isFolder?: boolean
  children: React.ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        pl: depth > 0 ? `${depth * 24}px` : 0,
        position: 'relative',
        minWidth: 0,
      }}
    >
      <MyDrawingsTreeDepthIndicators depth={depth} isFolder={isFolder} />
      {children}
    </Box>
  )
}

function SecondaryCellText({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body2" noWrap sx={cameraBodySecondaryTypographySx}>
      {children}
    </Typography>
  )
}

function statusColor(status: Camera['status']): string {
  if (status === 'live') return '#16a34a'
  if (status === 'connecting') return '#ed6c02'
  return '#6b7280'
}

import type { CameraManagementMode } from './camera-management-mode'

export interface CameraAssignRowSelection {
  selectedIds: Set<string>
  onToggleSelect: (cameraId: string) => void
  onRowDoubleClick?: (camera: Camera) => void
  isRowDraggable?: (camera: Camera) => boolean
  onRowDragStart?: (camera: Camera, e: React.DragEvent) => void
}

/** Single-select camera for recording history (camera recording module). */
export interface CameraRecordingRowSelection {
  selectedCameraId: string | null
  onSelectCamera: (camera: Camera) => void
}

interface CameraListViewProps {
  mode: CameraManagementMode
  /** Embedded in the camera-group assign layout (left column). */
  embed?: boolean
  /** Parent card supplies the outer Paper — render table only. */
  embedInCard?: boolean
  /** Highlights and selects folder for the assignment panels. */
  selectedAssignGroupId?: string | null
  onSelectAssignGroup?: (groupId: string) => void
  /** Flat camera list for assign panels (middle / right). */
  scopedCameras?: Camera[]
  /** Assign in-folder panel: current folder and its direct subfolders. */
  scopedGroupFolderId?: string | null
  scopedSubfolderIds?: string[]
  onOpenScopedSubfolder?: (groupId: string) => void
  assignRowSelection?: CameraAssignRowSelection
  recordingSelection?: CameraRecordingRowSelection
}

export function CameraListView({
  mode,
  embed = false,
  embedInCard = false,
  selectedAssignGroupId = null,
  onSelectAssignGroup,
  scopedCameras,
  scopedGroupFolderId = null,
  scopedSubfolderIds,
  onOpenScopedSubfolder,
  assignRowSelection,
  recordingSelection,
}: CameraListViewProps) {
  const assignGroupMode = mode === 'groups' && Boolean(onSelectAssignGroup)
  const isAssignFolderExplorer =
    scopedGroupFolderId != null && scopedSubfolderIds != null && scopedCameras != null
  const isScopedCameraList = scopedCameras != null && !isAssignFolderExplorer
  const cameras = useCameraStore((s) => s.cameras)
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const searchQuery = useCameraStore((s) => s.searchQuery)
  const getCameraTableTree = useCameraStore((s) => s.getCameraTableTree)

  const { visibleColumns, filters, sort } = useExplorerListTable()

  const getFilteredCameras = useCameraStore((s) => s.getFilteredCameras)

  const rawTree = useMemo(
    () => getCameraTableTree(),
    [getCameraTableTree, cameras, cameraGroups, searchQuery],
  )

  const { rootTrees, rootCameras } = useMemo(
    () =>
      applyCameraListFilters(rawTree.rootTrees, rawTree.rootCameras, filters, (groupId) =>
        countCamerasInGroupSubtree(groupId, cameras, cameraGroups),
      ),
    [rawTree, filters, cameras, cameraGroups],
  )

  const getSortedSiblings = useCallback(
    (groups: CameraTableGroupNode[], leaves: Camera[]) =>
      getSortedTreeSiblings(
        groups,
        leaves,
        sort,
        (node) => {
          const count = countCamerasInGroupSubtree(node.group.id, cameras, cameraGroups)
          return sort
            ? (getCameraGroupFilterValues(node.group, count)[sort.columnId] ?? '')
            : ''
        },
        (c) => (sort ? (getCameraFilterValues(c)[sort.columnId] ?? '') : ''),
      ),
    [sort, cameras, cameraGroups],
  )

  const setSelectedCamera = useCameraStore((s) => s.setSelectedCamera)
  const setCameraToDelete = useCameraStore((s) => s.setCameraToDelete)
  const setIsDeleteDialogOpen = useCameraStore((s) => s.setIsDeleteDialogOpen)
  const setGroupToDelete = useCameraStore((s) => s.setGroupToDelete)
  const setIsDeleteGroupDialogOpen = useCameraStore((s) => s.setIsDeleteGroupDialogOpen)
  const setSubgroupModalParentId = useCameraStore((s) => s.setSubgroupModalParentId)
  const setAddCamerasModalGroupId = useCameraStore((s) => s.setAddCamerasModalGroupId)
  const updateCamera = useCameraStore((s) => s.updateCamera)
  const listGroupExpanded = useCameraStore((s) => s.listGroupExpanded)
  const toggleListGroupExpanded = useCameraStore((s) => s.toggleListGroupExpanded)

  const colSpan = visibleColumns.length

  useEffect(() => {
    if (!searchQuery.trim()) return
    const { listGroupExpanded: expanded, setListGroupExpanded: setExpanded } =
      useCameraStore.getState()
    for (const id of collectAllGroupIds(rootTrees)) {
      if (!expanded[id]) setExpanded(id, true)
    }
  }, [searchQuery, rootTrees])

  const toggleGroup = useCallback(
    (groupId: string) => {
      toggleListGroupExpanded(groupId)
    },
    [toggleListGroupExpanded],
  )

  const handleDeleteCamera = (camera: Camera, e: React.MouseEvent) => {
    e.stopPropagation()
    setCameraToDelete(camera)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteGroup = (group: CameraGroup, e: React.MouseEvent) => {
    e.stopPropagation()
    setGroupToDelete(group)
    setIsDeleteGroupDialogOpen(true)
  }

  const toggleStatus = (camera: Camera, e: React.MouseEvent) => {
    e.stopPropagation()
    updateCamera(camera.id, {
      status: camera.status === 'live' ? 'stopped' : 'live',
    })
  }

  const renderCameraCell = (columnId: string, camera: Camera, depth: number) => {
    switch (columnId) {
      case 'name':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <NameCellShell depth={depth}>
              <Box
                sx={{
                  width: 28,
                  minWidth: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SubdirectoryArrowRightIcon sx={{ fontSize: 14, color: CAMERA_TABLE.border }} />
              </Box>
              <VideocamOutlinedIcon
                sx={{ fontSize: 20, color: CAMERA_TABLE.folderClosed, flexShrink: 0 }}
              />
              <Typography variant="body2" noWrap sx={cameraBodyPrimaryTypographySx}>
                {camera.name}
              </Typography>
            </NameCellShell>
          </TableCell>
        )
      case 'ip':
      case 'cameraId':
      case 'port':
      case 'telnetUsername':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <SecondaryCellText>
              {columnId === 'ip'
                ? camera.ip
                : columnId === 'cameraId'
                  ? camera.cameraId
                  : columnId === 'port'
                    ? camera.port
                    : camera.telnetUsername}
            </SecondaryCellText>
          </TableCell>
        )
      case 'items':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <SecondaryCellText>{CELL_DASH}</SecondaryCellText>
          </TableCell>
        )
      case 'type':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <SecondaryCellText>camera</SecondaryCellText>
          </TableCell>
        )
      case 'apiBaseUrl':
        return (
          <TableCell key={columnId} sx={{ ...cameraTableCellSx, maxWidth: 200 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                ...cameraBodySecondaryTypographySx,
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '12px',
              }}
            >
              {camera.apiBaseUrl}
            </Typography>
          </TableCell>
        )
      case 'status':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Roboto, sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: statusColor(camera.status),
              }}
            >
              {camera.status === 'live'
                ? 'LIVE'
                : camera.status === 'connecting'
                  ? 'CONNECTING'
                  : 'STOPPED'}
            </Typography>
          </TableCell>
        )
      case 'actions':
        return (
          <TableCell key={columnId} align="right" sx={{ ...cameraTableCellSx, width: 120, minWidth: 120 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
              <IconButton
                size="small"
                onClick={(e) => toggleStatus(camera, e)}
                sx={{ color: CAMERA_TABLE.folderClosed }}
              >
                {camera.status === 'live' ? (
                  <StopIcon fontSize="small" />
                ) : (
                  <PlayArrowIcon fontSize="small" />
                )}
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCamera(camera)
                }}
                sx={{ color: CAMERA_TABLE.folderClosed }}
              >
                <SettingsOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => handleDeleteCamera(camera, e)}
                sx={{ color: CAMERA_TABLE.folderClosed }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </TableCell>
        )
      default:
        return null
    }
  }

  const renderAssignFolderGroupRow = (group: CameraGroup, depth: number, count: number) => {
    return (
      <TableRow
        key={group.id}
        hover={false}
        onClick={() => onOpenScopedSubfolder?.(group.id)}
        sx={cameraBodyRowSx({ depth })}
      >
        {visibleColumns.map((col) => {
          switch (col.id) {
            case 'name':
              return (
                <TableCell key={col.id} sx={cameraTableCellSx}>
                  <NameCellShell depth={depth} isFolder>
                    <Box
                      sx={{
                        width: 28,
                        minWidth: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ChevronRightIcon fontSize="small" sx={{ color: CAMERA_TABLE.folderClosed }} />
                    </Box>
                    <FolderIcon sx={{ fontSize: 20, color: CAMERA_TABLE.folderClosed, flexShrink: 0 }} />
                    <Typography variant="body2" noWrap sx={cameraBodyPrimaryTypographySx}>
                      {group.name}
                    </Typography>
                  </NameCellShell>
                </TableCell>
              )
            case 'ip':
            case 'cameraId':
            case 'port':
            case 'apiBaseUrl':
            case 'telnetUsername':
            case 'status':
              return (
                <TableCell key={col.id} sx={cameraTableCellSx}>
                  <SecondaryCellText>{CELL_DASH}</SecondaryCellText>
                </TableCell>
              )
            case 'items':
              return (
                <TableCell key={col.id} sx={cameraTableCellSx}>
                  <SecondaryCellText>{count}</SecondaryCellText>
                </TableCell>
              )
            case 'type':
              return (
                <TableCell key={col.id} sx={cameraTableCellSx}>
                  <SecondaryCellText>group</SecondaryCellText>
                </TableCell>
              )
            case 'actions':
              return (
                <TableCell
                  key={col.id}
                  align="right"
                  sx={{ ...cameraTableCellSx, width: 120, minWidth: 120 }}
                />
              )
            default:
              return null
          }
        })}
      </TableRow>
    )
  }

  const renderGroupCell = (
    columnId: string,
    node: CameraTableGroupNode,
    depth: number,
    count: number,
    isOpen: boolean,
  ) => {
    switch (columnId) {
      case 'name':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <NameCellShell depth={depth} isFolder>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleGroup(node.group.id)
                }}
                aria-label={isOpen ? `Collapse ${node.group.name}` : `Expand ${node.group.name}`}
                sx={{
                  width: 28,
                  minWidth: 28,
                  maxWidth: 28,
                  height: 28,
                  p: 0.25,
                  mr: 0.5,
                }}
              >
                {isOpen ? (
                  <ExpandMoreIcon fontSize="small" sx={{ color: CAMERA_TABLE.folderOpen }} />
                ) : (
                  <ChevronRightIcon fontSize="small" sx={{ color: CAMERA_TABLE.folderClosed }} />
                )}
              </IconButton>
              {isOpen ? (
                <FolderOpenIcon sx={{ fontSize: 20, color: CAMERA_TABLE.folderOpen, flexShrink: 0 }} />
              ) : (
                <FolderIcon sx={{ fontSize: 20, color: CAMERA_TABLE.folderClosed, flexShrink: 0 }} />
              )}
              <Typography variant="body2" noWrap sx={cameraBodyPrimaryTypographySx}>
                {node.group.name}
              </Typography>
            </NameCellShell>
          </TableCell>
        )
      case 'ip':
      case 'cameraId':
      case 'port':
      case 'apiBaseUrl':
      case 'telnetUsername':
      case 'status':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <SecondaryCellText>{CELL_DASH}</SecondaryCellText>
          </TableCell>
        )
      case 'items':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <SecondaryCellText>{count}</SecondaryCellText>
          </TableCell>
        )
      case 'type':
        return (
          <TableCell key={columnId} sx={cameraTableCellSx}>
            <SecondaryCellText>group</SecondaryCellText>
          </TableCell>
        )
      case 'actions':
        return (
          <TableCell
            key={columnId}
            align="right"
            sx={{ ...cameraTableCellSx, width: 120, minWidth: 120 }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={(e) => handleDeleteGroup(node.group, e)}
              sx={{ color: CAMERA_TABLE.folderClosed }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </TableCell>
        )
      default:
        return null
    }
  }

  const renderCameraRow = (camera: Camera, depth: number, rowKey: string) => {
    const isAssignSelected = assignRowSelection?.selectedIds.has(camera.id) ?? false
    const isRecordingSelected = recordingSelection?.selectedCameraId === camera.id
    return (
      <TableRow
        key={rowKey}
        hover={false}
        draggable={assignRowSelection?.isRowDraggable?.(camera) ?? false}
        onDragStart={
          assignRowSelection?.onRowDragStart
            ? (e) => assignRowSelection.onRowDragStart!(camera, e)
            : undefined
        }
        onClick={() => {
          if (recordingSelection) {
            recordingSelection.onSelectCamera(camera)
            return
          }
          if (assignRowSelection) {
            assignRowSelection.onToggleSelect(camera.id)
            return
          }
          setSelectedCamera(camera)
        }}
        onDoubleClick={() => assignRowSelection?.onRowDoubleClick?.(camera)}
        sx={{
          ...cameraBodyRowSx({ depth }),
          ...(isAssignSelected || isRecordingSelected
            ? {
                bgcolor: 'action.selected',
                '&:hover': { bgcolor: 'action.selected' },
              }
            : {}),
        }}
      >
        {visibleColumns.map((col) => renderCameraCell(col.id, camera, depth))}
      </TableRow>
    )
  }

  const handleGroupRowClick = (groupId: string) => {
    if (assignGroupMode && onSelectAssignGroup) {
      onSelectAssignGroup(groupId)
      return
    }
    toggleGroup(groupId)
  }

  const renderGroupNode = (node: CameraTableGroupNode, depth: number, pathKey: string): React.ReactNode => {
    const rowKey = pathKey ? `${pathKey}>${node.group.id}` : node.group.id
    const isOpen = listGroupExpanded[node.group.id] ?? true
    const count = countCamerasInGroupSubtree(node.group.id, cameras, cameraGroups)
    const isAssignSelected = assignGroupMode && selectedAssignGroupId === node.group.id

    return (
      <Fragment key={rowKey}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <TableRow
              hover={false}
              onClick={() => handleGroupRowClick(node.group.id)}
              sx={{
                ...cameraBodyRowSx({ depth }),
                ...(isAssignSelected
                  ? {
                      bgcolor: 'action.selected',
                      '&:hover': { bgcolor: 'action.selected' },
                    }
                  : {}),
              }}
            >
              {visibleColumns.map((col) =>
                renderGroupCell(col.id, node, depth, count, isOpen),
              )}
            </TableRow>
          </ContextMenuTrigger>
          <ContextMenuContent className="min-w-[11rem] border-border bg-popover">
            <ContextMenuItem
              className="cursor-pointer gap-2"
              onSelect={() => setSubgroupModalParentId(node.group.id)}
            >
              <FolderPlus className="size-4" />
              Create subgroup
            </ContextMenuItem>
            {!assignGroupMode ? (
              <ContextMenuItem
                className="cursor-pointer gap-2"
                onSelect={() => setAddCamerasModalGroupId(node.group.id)}
              >
                <CameraIconLucide className="size-4" />
                Add camera
              </ContextMenuItem>
            ) : null}
          </ContextMenuContent>
        </ContextMenu>
        {isOpen &&
          getSortedSiblings(node.children, node.cameras).map((sibling) =>
            sibling.kind === 'group' ? (
              <Fragment key={`g-${sibling.node.group.id}@${rowKey}`}>
                {renderGroupNode(sibling.node, depth + 1, rowKey)}
              </Fragment>
            ) : (
              <Fragment key={`${sibling.item.id}@${rowKey}`}>
                {renderCameraRow(sibling.item, depth + 1, `${sibling.item.id}@${rowKey}`)}
              </Fragment>
            ),
          )}
      </Fragment>
    )
  }

  const flatCameras = useMemo(() => {
    const cameras = scopedCameras ?? getFilteredCameras()
    return getSortedTreeSiblings(
      [] as CameraTableGroupNode[],
      cameras,
      sort,
      () => '',
      (c) => (sort ? (getCameraFilterValues(c)[sort.columnId] ?? '') : ''),
    )
      .filter((sibling) => sibling.kind === 'leaf')
      .map((sibling) => sibling.item)
  }, [scopedCameras, getFilteredCameras, sort])

  const assignFolderSubgroups = useMemo(() => {
    if (!isAssignFolderExplorer || !scopedSubfolderIds) return []
    return scopedSubfolderIds
      .map((id) => cameraGroups.find((g) => g.id === id))
      .filter((g): g is CameraGroup => g != null)
  }, [isAssignFolderExplorer, scopedSubfolderIds, cameraGroups])

  const assignFolderSiblings = useMemo(() => {
    if (!isAssignFolderExplorer) return []
    return getSortedTreeSiblings(
      assignFolderSubgroups.map((group) => ({
        group,
        cameras: [],
        children: [],
      })),
      flatCameras,
      sort,
      (node) => {
        const count = countCamerasInGroupSubtree(node.group.id, cameras, cameraGroups)
        return sort
          ? (getCameraGroupFilterValues(node.group, count)[sort.columnId] ?? '')
          : ''
      },
      (c) => (sort ? (getCameraFilterValues(c)[sort.columnId] ?? '') : ''),
    )
  }, [isAssignFolderExplorer, assignFolderSubgroups, flatCameras, sort, cameras, cameraGroups])

  const isEmpty = isAssignFolderExplorer
    ? assignFolderSubgroups.length === 0 && flatCameras.length === 0
    : isScopedCameraList
      ? flatCameras.length === 0
      : mode === 'cameras'
        ? flatCameras.length === 0
        : rootTrees.length === 0 && rootCameras.length === 0

  const tableContainerSx = {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    overflowX: 'auto',
    overflowY: 'auto',
    pb: 1,
    boxSizing: 'border-box',
    ...(embed || embedInCard ? { height: '100%' } : {}),
  } as const

  const tableContent = (
    <TableContainer sx={tableContainerSx}>
      <Table stickyHeader size="small" sx={cameraTableSx}>
        <TableHead sx={cameraTableHeadSx}>
          <ExplorerTableHeaderRow variant="drawings" />
        </TableHead>
        <TableBody sx={cameraTableBodySx}>
          {isAssignFolderExplorer
            ? assignFolderSiblings.map((sibling) =>
                sibling.kind === 'group' ? (
                  <Fragment key={sibling.node.group.id}>
                    {renderAssignFolderGroupRow(
                      sibling.node.group,
                      0,
                      countCamerasInGroupSubtree(sibling.node.group.id, cameras, cameraGroups),
                    )}
                  </Fragment>
                ) : (
                  <Fragment key={sibling.item.id}>
                    {renderCameraRow(sibling.item, 0, sibling.item.id)}
                  </Fragment>
                ),
              )
            : mode === 'cameras' || isScopedCameraList
            ? flatCameras.map((camera) => (
                <Fragment key={camera.id}>{renderCameraRow(camera, 0, camera.id)}</Fragment>
              ))
            : getSortedSiblings(rootTrees, rootCameras).map((sibling) =>
                sibling.kind === 'group' ? (
                  <Fragment key={sibling.node.group.id}>
                    {renderGroupNode(sibling.node, 0, '')}
                  </Fragment>
                ) : (
                  <Fragment key={sibling.item.id}>
                    {renderCameraRow(sibling.item, 0, sibling.item.id)}
                  </Fragment>
                ),
              )}
          {isEmpty && (
            <TableRow hover={false}>
              <TableCell colSpan={colSpan} sx={{ ...cameraTableCellSx, height: 128, textAlign: 'center' }}>
                <Typography variant="body2" sx={cameraBodySecondaryTypographySx}>
                  {isAssignFolderExplorer
                    ? 'This folder is empty. Add cameras from the list on the right or open a subgroup.'
                    : isScopedCameraList || mode === 'cameras'
                      ? 'No cameras found. Add a new camera or adjust search and filters.'
                      : 'No groups or cameras found. Create a new group or adjust search and filters.'}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

  if (embedInCard) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {tableContent}
      </Box>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        overflow: 'hidden',
        ...getEnterpriseSettingsCardSx(theme),
        ...(embed
          ? {
              flex: 1,
              minHeight: 0,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }
          : {}),
      })}
    >
      {tableContent}
    </Paper>
  )
}
