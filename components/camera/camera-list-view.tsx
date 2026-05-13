'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import type { Camera, CameraGroup } from '@/types/camera'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
} from 'lucide-react'

const CELL_DASH = '-'

export function CameraListView() {
  const cameras = useCameraStore((s) => s.cameras)
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const searchQuery = useCameraStore((s) => s.searchQuery)
  const getCameraTableTree = useCameraStore((s) => s.getCameraTableTree)

  const { groupBlocks, rootCameras } = useMemo(
    () => getCameraTableTree(),
    [getCameraTableTree, cameras, cameraGroups, searchQuery],
  )

  const setSelectedCamera = useCameraStore((s) => s.setSelectedCamera)
  const setCameraToDelete = useCameraStore((s) => s.setCameraToDelete)
  const setIsDeleteDialogOpen = useCameraStore((s) => s.setIsDeleteDialogOpen)
  const setGroupToDelete = useCameraStore((s) => s.setGroupToDelete)
  const setIsDeleteGroupDialogOpen = useCameraStore((s) => s.setIsDeleteGroupDialogOpen)
  const updateCamera = useCameraStore((s) => s.updateCamera)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!searchQuery.trim()) return
    setExpanded((prev) => {
      const next = { ...prev }
      for (const { group } of groupBlocks) {
        next[group.id] = true
      }
      return next
    })
  }, [searchQuery, groupBlocks])

  const toggleGroup = (groupId: string) => {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

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

  const memberCount = (groupId: string) => cameras.filter((c) => c.groupId === groupId).length

  const renderCameraRow = (camera: Camera, depth: number) => (
    <TableRow
      key={camera.id}
      className="cursor-pointer border-border hover:bg-primary/5"
      onClick={() => setSelectedCamera(camera)}
    >
      <TableCell className="font-medium text-foreground">
        <div
          className={
            depth > 0
              ? 'flex items-center gap-2 border-l border-border pl-3'
              : 'flex items-center gap-2 pl-1'
          }
          style={depth > 0 ? { marginLeft: 8 + depth * 16 } : undefined}
        >
          <Video className="size-4 shrink-0 text-muted-foreground" />
          {camera.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{camera.ip}</TableCell>
      <TableCell className="text-muted-foreground text-center">{CELL_DASH}</TableCell>
      <TableCell className="text-muted-foreground">camera</TableCell>
      <TableCell className="text-muted-foreground">{camera.cameraId}</TableCell>
      <TableCell className="text-muted-foreground">{camera.port}</TableCell>
      <TableCell className="text-muted-foreground font-mono text-xs max-w-[200px] truncate">
        {camera.apiBaseUrl}
      </TableCell>
      <TableCell className="text-muted-foreground">{camera.telnetUsername}</TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={
            camera.status === 'live'
              ? 'bg-live/20 text-live border-live/30'
              : camera.status === 'connecting'
                ? 'bg-warning/20 text-warning border-warning/30'
                : 'bg-stopped/20 text-stopped border-stopped/30'
          }
        >
          {camera.status === 'live'
            ? 'LIVE'
            : camera.status === 'connecting'
              ? 'CONNECTING'
              : 'STOPPED'}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => toggleStatus(camera, e)}
            className="text-muted-foreground hover:text-primary"
          >
            {camera.status === 'live' ? <Square className="size-4" /> : <Play className="size-4" />}
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
    </TableRow>
  )

  const isEmpty = groupBlocks.length === 0 && rootCameras.length === 0

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="text-primary font-semibold min-w-[200px]">Name</TableHead>
            <TableHead className="text-primary font-semibold">IP</TableHead>
            <TableHead className="text-primary font-semibold text-center w-[72px]">Items</TableHead>
            <TableHead className="text-primary font-semibold w-[88px]">Type</TableHead>
            <TableHead className="text-primary font-semibold">Camera ID</TableHead>
            <TableHead className="text-primary font-semibold">Port</TableHead>
            <TableHead className="text-primary font-semibold">API Base URL</TableHead>
            <TableHead className="text-primary font-semibold">Telnet Username</TableHead>
            <TableHead className="text-primary font-semibold">Status</TableHead>
            <TableHead className="text-primary font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupBlocks.map(({ group, cameras: groupCameras }) => {
            const count = memberCount(group.id)
            const isOpen = expanded[group.id] ?? true
            const sorted = [...groupCameras].sort((a, b) => a.name.localeCompare(b.name))
            return (
              <Fragment key={group.id}>
                <TableRow
                  className="cursor-pointer border-border bg-muted/30 hover:bg-muted/50"
                  onClick={() => toggleGroup(group.id)}
                >
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleGroup(group.id)
                        }}
                      >
                        {isOpen ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </Button>
                      <Folder className="size-4 shrink-0 text-primary" />
                      <span>{group.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{CELL_DASH}</TableCell>
                  <TableCell className="text-muted-foreground text-center">{count}</TableCell>
                  <TableCell className="text-muted-foreground">group</TableCell>
                  <TableCell className="text-muted-foreground">{CELL_DASH}</TableCell>
                  <TableCell className="text-muted-foreground">{CELL_DASH}</TableCell>
                  <TableCell className="text-muted-foreground">{CELL_DASH}</TableCell>
                  <TableCell className="text-muted-foreground">{CELL_DASH}</TableCell>
                  <TableCell className="text-muted-foreground">{CELL_DASH}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => handleDeleteGroup(group, e)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
                {isOpen &&
                  sorted.map((camera) => <Fragment key={camera.id}>{renderCameraRow(camera, 1)}</Fragment>)}
              </Fragment>
            )
          })}

          {rootCameras.map((camera) => (
            <Fragment key={camera.id}>{renderCameraRow(camera, 0)}</Fragment>
          ))}

          {isEmpty && (
            <TableRow>
              <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                No cameras found. Add a new camera to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
