'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  useCameraStore,
  countCamerasInGroupSubtree,
  type CameraTableGroupNode,
} from '@/lib/camera-store'
import type { Camera, CameraGroup } from '@/types/camera'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  Settings,
  Play,
  Square,
  ChevronRight,
  ChevronDown,
  Folder,
  Video,
  FolderPlus,
  Camera as CameraIcon,
} from 'lucide-react'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import { applyCameraListFilters } from '@/lib/explorer-list-table/camera-table'
import { cn } from '@/lib/utils'
import { Box, Paper } from '@mui/material'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'

const CELL_DASH = '-'

function collectAllGroupIds(nodes: CameraTableGroupNode[]): string[] {
  const ids: string[] = []
  const walk = (n: CameraTableGroupNode) => {
    ids.push(n.group.id)
    n.children.forEach(walk)
  }
  nodes.forEach(walk)
  return ids
}

function nameIndent(depth: number) {
  return depth > 0 ? { marginLeft: 8 + depth * 16 } : undefined
}

export function CameraListView() {
  const cameras = useCameraStore((s) => s.cameras)
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const searchQuery = useCameraStore((s) => s.searchQuery)
  const getCameraTableTree = useCameraStore((s) => s.getCameraTableTree)

  const { visibleColumns, filters } = useExplorerListTable()

  const rawTree = useMemo(
    () => getCameraTableTree(),
    [getCameraTableTree, cameras, cameraGroups, searchQuery]
  )

  const { rootTrees, rootCameras } = useMemo(
    () =>
      applyCameraListFilters(rawTree.rootTrees, rawTree.rootCameras, filters, (groupId) =>
        countCamerasInGroupSubtree(groupId, cameras, cameraGroups)
      ),
    [rawTree, filters, cameras, cameraGroups]
  )

  const setSelectedCamera = useCameraStore((s) => s.setSelectedCamera)
  const setCameraToDelete = useCameraStore((s) => s.setCameraToDelete)
  const setIsDeleteDialogOpen = useCameraStore((s) => s.setIsDeleteDialogOpen)
  const setGroupToDelete = useCameraStore((s) => s.setGroupToDelete)
  const setIsDeleteGroupDialogOpen = useCameraStore((s) => s.setIsDeleteGroupDialogOpen)
  const setSubgroupModalParentId = useCameraStore((s) => s.setSubgroupModalParentId)
  const setAddCamerasModalGroupId = useCameraStore((s) => s.setAddCamerasModalGroupId)
  const updateCamera = useCameraStore((s) => s.updateCamera)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const colSpan = visibleColumns.length

  useEffect(() => {
    if (!searchQuery.trim()) return
    setExpanded((prev) => {
      const next = { ...prev }
      for (const id of collectAllGroupIds(rootTrees)) {
        next[id] = true
      }
      return next
    })
  }, [searchQuery, rootTrees])

  const toggleGroup = useCallback((groupId: string) => {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }, [])

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
          <TableCell key={columnId} className="font-medium text-foreground">
            <div
              className={cn(
                'flex items-center gap-2 pl-1',
                depth > 0 && 'border-l border-border pl-3'
              )}
              style={nameIndent(depth)}
            >
              <Video className="size-4 shrink-0 text-muted-foreground" />
              {camera.name}
            </div>
          </TableCell>
        )
      case 'ip':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {camera.ip}
          </TableCell>
        )
      case 'items':
        return (
          <TableCell key={columnId} className="text-center text-muted-foreground">
            {CELL_DASH}
          </TableCell>
        )
      case 'type':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            camera
          </TableCell>
        )
      case 'cameraId':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {camera.cameraId}
          </TableCell>
        )
      case 'port':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {camera.port}
          </TableCell>
        )
      case 'apiBaseUrl':
        return (
          <TableCell
            key={columnId}
            className="max-w-[200px] truncate font-mono text-xs text-muted-foreground"
          >
            {camera.apiBaseUrl}
          </TableCell>
        )
      case 'telnetUsername':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {camera.telnetUsername}
          </TableCell>
        )
      case 'status':
        return (
          <TableCell key={columnId}>
            <Badge
              variant="secondary"
              className={
                camera.status === 'live'
                  ? 'border-live/30 bg-live/20 text-live'
                  : camera.status === 'connecting'
                    ? 'border-warning/30 bg-warning/20 text-warning'
                    : 'border-stopped/30 bg-stopped/20 text-stopped'
              }
            >
              {camera.status === 'live'
                ? 'LIVE'
                : camera.status === 'connecting'
                  ? 'CONNECTING'
                  : 'STOPPED'}
            </Badge>
          </TableCell>
        )
      case 'actions':
        return (
          <TableCell key={columnId} className="text-right">
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => toggleStatus(camera, e)}
                className="text-muted-foreground hover:text-primary"
              >
                {camera.status === 'live' ? (
                  <Square className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCamera(camera)
                }}
                className="text-muted-foreground hover:text-primary"
              >
                <Settings className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => handleDeleteCamera(camera, e)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </TableCell>
        )
      default:
        return null
    }
  }

  const renderGroupCell = (
    columnId: string,
    node: CameraTableGroupNode,
    depth: number,
    count: number,
    isOpen: boolean
  ) => {
    switch (columnId) {
      case 'name':
        return (
          <TableCell key={columnId} className="font-medium text-foreground">
            <div
              className={cn(
                'flex items-center gap-2 pl-1',
                depth > 0 && 'border-l border-border pl-3'
              )}
              style={nameIndent(depth)}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleGroup(node.group.id)
                }}
              >
                {isOpen ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </Button>
              <Folder className="size-4 shrink-0 text-primary" />
              <span>{node.group.name}</span>
            </div>
          </TableCell>
        )
      case 'ip':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {CELL_DASH}
          </TableCell>
        )
      case 'items':
        return (
          <TableCell key={columnId} className="text-center text-muted-foreground">
            {count}
          </TableCell>
        )
      case 'type':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            group
          </TableCell>
        )
      case 'cameraId':
      case 'port':
      case 'apiBaseUrl':
      case 'telnetUsername':
      case 'status':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {CELL_DASH}
          </TableCell>
        )
      case 'actions':
        return (
          <TableCell key={columnId} className="text-right" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => handleDeleteGroup(node.group, e)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </TableCell>
        )
      default:
        return null
    }
  }

  const renderCameraRow = (camera: Camera, depth: number, rowKey: string) => (
    <TableRow
      key={rowKey}
      className="cursor-pointer border-border hover:bg-primary/5"
      onClick={() => setSelectedCamera(camera)}
    >
      {visibleColumns.map((col) => renderCameraCell(col.id, camera, depth))}
    </TableRow>
  )

  const renderGroupNode = (node: CameraTableGroupNode, depth: number, pathKey: string): React.ReactNode => {
    const rowKey = pathKey ? `${pathKey}>${node.group.id}` : node.group.id
    const isOpen = expanded[node.group.id] ?? true
    const count = countCamerasInGroupSubtree(node.group.id, cameras, cameraGroups)

    return (
      <Fragment key={rowKey}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <TableRow
              className="cursor-pointer border-border bg-muted/30 hover:bg-muted/50"
              onClick={() => toggleGroup(node.group.id)}
            >
              {visibleColumns.map((col) =>
                renderGroupCell(col.id, node, depth, count, isOpen)
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
            <ContextMenuItem
              className="cursor-pointer gap-2"
              onSelect={() => setAddCamerasModalGroupId(node.group.id)}
            >
              <CameraIcon className="size-4" />
              Add camera
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {isOpen && (
          <>
            {node.children.map((ch) => renderGroupNode(ch, depth + 1, rowKey))}
            {node.cameras.map((cam) => (
              <Fragment key={`${cam.id}@${rowKey}`}>
                {renderCameraRow(cam, depth + 1, `${cam.id}@${rowKey}`)}
              </Fragment>
            ))}
          </>
        )}
      </Fragment>
    )
  }

  const isEmpty = rootTrees.length === 0 && rootCameras.length === 0

  return (
    <Paper elevation={0} sx={(theme) => ({ overflow: 'hidden', ...getEnterpriseSettingsCardSx(theme) })}>
      <Box sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {visibleColumns.map((col) => (
              <TableHead
                key={col.id}
                className={cn('font-semibold text-primary', col.headerClassName)}
                style={{ fontWeight: 600, fontSize: '0.875rem' }}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rootTrees.map((node) => renderGroupNode(node, 0, ''))}
          {rootCameras.map((camera) => (
            <Fragment key={camera.id}>{renderCameraRow(camera, 0, camera.id)}</Fragment>
          ))}
          {isEmpty && (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                No cameras found. Add a new camera or adjust search and filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </Box>
    </Paper>
  )
}
