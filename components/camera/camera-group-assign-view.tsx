'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import type { Camera } from '@/types/camera'
import { Box, IconButton, Paper, Tooltip } from '@mui/material'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { CameraListView } from './camera-list-view'
import { CameraToolbar } from './camera-toolbar'
import { CameraAssignCamerasPanel } from './camera-assign-cameras-panel'
import { CameraAssignPanelHeader } from './camera-assign-panel-header'
import type { CameraAssignRowSelection } from './camera-list-view'

export type CameraAssignPanelId = 'groups' | 'in-folder' | 'all'

function camInGroup(c: Camera, groupId: string): boolean {
  return (c.groupIds ?? []).includes(groupId)
}

function CameraGroupTreeCard({
  selectedAssignGroupId,
  onSelectAssignGroup,
  isFullscreen,
  onToggleFullscreen,
}: {
  selectedAssignGroupId: string | null
  onSelectAssignGroup: (groupId: string) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      <CameraAssignPanelHeader
        title="Groups"
        subtitle="Select a folder to assign cameras"
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />
      <CameraToolbar mode="groups" layout="card" />
      <CameraListView
        mode="groups"
        embed
        embedInCard
        selectedAssignGroupId={selectedAssignGroupId}
        onSelectAssignGroup={onSelectAssignGroup}
      />
    </Paper>
  )
}

function TransferArrowControls({
  selectedAssignGroupId,
  selectedPoolIds,
  selectedInGroupIds,
  onAddSelected,
  onRemoveSelected,
}: {
  selectedAssignGroupId: string | null
  selectedPoolIds: Set<string>
  selectedInGroupIds: Set<string>
  onAddSelected: () => void
  onRemoveSelected: () => void
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 2,
        p: 0.5,
        border: 1,
        borderColor: 'divider',
        pointerEvents: 'auto',
      }}
    >
      <Tooltip title="Add selected cameras to folder" placement="left">
        <span>
          <IconButton
            size="small"
            color="primary"
            disabled={!selectedAssignGroupId || selectedPoolIds.size === 0}
            onClick={onAddSelected}
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Remove selected from folder" placement="left">
        <span>
          <IconButton
            size="small"
            disabled={!selectedAssignGroupId || selectedInGroupIds.size === 0}
            onClick={onRemoveSelected}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export function CameraGroupAssignView() {
  const cameras = useCameraStore((s) => s.cameras)
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const selectedAssignGroupId = useCameraStore((s) => s.selectedAssignGroupId)
  const setSelectedAssignGroupId = useCameraStore((s) => s.setSelectedAssignGroupId)
  const addCamerasToParentGroup = useCameraStore((s) => s.addCamerasToParentGroup)
  const removeCamerasFromParentGroup = useCameraStore((s) => s.removeCamerasFromParentGroup)
  const setSelectedCamera = useCameraStore((s) => s.setSelectedCamera)

  const [selectedInGroupIds, setSelectedInGroupIds] = useState<Set<string>>(new Set())
  const [selectedPoolIds, setSelectedPoolIds] = useState<Set<string>>(new Set())
  const [dropHighlight, setDropHighlight] = useState(false)
  const [fullscreenPanel, setFullscreenPanel] = useState<CameraAssignPanelId | null>(null)
  /** Panel width percentages [groups, in-folder, all] — used to position transfer arrows. */
  const [panelLayout, setPanelLayout] = useState<number[]>([28, 36, 36])

  const toggleFullscreen = (panel: CameraAssignPanelId) => {
    setFullscreenPanel((prev) => (prev === panel ? null : panel))
  }

  useEffect(() => {
    if (!fullscreenPanel) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenPanel(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [fullscreenPanel])

  const selectedGroup = useMemo(
    () => cameraGroups.find((g) => g.id === selectedAssignGroupId) ?? null,
    [cameraGroups, selectedAssignGroupId],
  )

  useEffect(() => {
    if (selectedAssignGroupId && cameraGroups.some((g) => g.id === selectedAssignGroupId)) return
    const roots = cameraGroups.filter((g) => (g.parentGroupIds ?? []).length === 0)
    setSelectedAssignGroupId(roots[0]?.id ?? null)
  }, [cameraGroups, selectedAssignGroupId, setSelectedAssignGroupId])

  useEffect(() => {
    setSelectedInGroupIds(new Set())
    setSelectedPoolIds(new Set())
  }, [selectedAssignGroupId])

  const camerasInGroupSource = useMemo(() => {
    if (!selectedAssignGroupId) return []
    return cameras.filter((c) => camInGroup(c, selectedAssignGroupId))
  }, [cameras, selectedAssignGroupId])

  const availableCamerasSource = useMemo(() => {
    if (!selectedAssignGroupId) return [...cameras]
    return cameras.filter((c) => !camInGroup(c, selectedAssignGroupId))
  }, [cameras, selectedAssignGroupId])

  const addToGroup = useCallback(
    (cameraIds: string[]) => {
      if (!selectedAssignGroupId || cameraIds.length === 0) return
      const toAdd = cameraIds.filter((id) => {
        const c = cameras.find((x) => x.id === id)
        return c && !camInGroup(c, selectedAssignGroupId)
      })
      if (toAdd.length === 0) return
      addCamerasToParentGroup(selectedAssignGroupId, toAdd, { closeAddModal: false })
    },
    [selectedAssignGroupId, cameras, addCamerasToParentGroup],
  )

  const removeFromGroup = useCallback(
    (cameraIds: string[]) => {
      if (!selectedAssignGroupId || cameraIds.length === 0) return
      removeCamerasFromParentGroup(selectedAssignGroupId, cameraIds)
      setSelectedInGroupIds((prev) => {
        const next = new Set(prev)
        cameraIds.forEach((id) => next.delete(id))
        return next
      })
    },
    [selectedAssignGroupId, removeCamerasFromParentGroup],
  )

  const toggleInGroupSelect = (id: string) => {
    setSelectedInGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSelectedPoolIds(new Set())
  }

  const togglePoolSelect = (id: string) => {
    setSelectedPoolIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setSelectedInGroupIds(new Set())
  }

  const handleAddSelected = () => addToGroup([...selectedPoolIds])
  const handleRemoveSelected = () => removeFromGroup([...selectedInGroupIds])

  const handleDragStart = (cameraId: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData('text/camera-id', cameraId)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!selectedAssignGroupId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDropHighlight(true)
  }

  const handleDragLeave = () => setDropHighlight(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDropHighlight(false)
    const id = e.dataTransfer.getData('text/camera-id')
    if (id) addToGroup([id])
  }

  const inFolderSelection: CameraAssignRowSelection = {
    selectedIds: selectedInGroupIds,
    onToggleSelect: toggleInGroupSelect,
    onRowDoubleClick: (camera) => setSelectedCamera(camera),
  }

  const poolSelection: CameraAssignRowSelection = {
    selectedIds: selectedPoolIds,
    onToggleSelect: togglePoolSelect,
    onRowDoubleClick: (camera) => {
      if (!selectedAssignGroupId) return
      addToGroup([camera.id])
    },
    isRowDraggable: () => Boolean(selectedAssignGroupId),
    onRowDragStart: (camera, e) => handleDragStart(camera.id)(e),
  }

  const groupsPanel = (
    <CameraGroupTreeCard
      selectedAssignGroupId={selectedAssignGroupId}
      onSelectAssignGroup={setSelectedAssignGroupId}
      isFullscreen={fullscreenPanel === 'groups'}
      onToggleFullscreen={() => toggleFullscreen('groups')}
    />
  )

  const inFolderPanel = (
    <CameraAssignCamerasPanel
      storageKey="explorer-list-table:camera-assign-in-folder"
      title="Cameras in folder"
      subtitle={selectedGroup ? selectedGroup.name : 'Select a group on the left'}
      sourceCameras={camerasInGroupSource}
      emptyMessage={
        selectedAssignGroupId
          ? 'No cameras in this folder. Add from the list on the right (double-click, drag, or arrow).'
          : 'Select a group to manage its cameras.'
      }
      assignRowSelection={selectedAssignGroupId ? inFolderSelection : undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      dropActive={dropHighlight}
      isFullscreen={fullscreenPanel === 'in-folder'}
      onToggleFullscreen={() => toggleFullscreen('in-folder')}
    />
  )

  const allCamerasPanel = (
      <CameraAssignCamerasPanel
        storageKey="explorer-list-table:camera-assign-all"
        title="All cameras"
        subtitle={
          selectedAssignGroupId
            ? 'Cameras not in this folder — double-click or drag to add'
            : 'Select a group to add cameras'
        }
        sourceCameras={availableCamerasSource}
        emptyMessage={
          selectedAssignGroupId
            ? 'All cameras are already in this folder.'
            : 'Select a group on the left to assign cameras.'
        }
        assignRowSelection={selectedAssignGroupId ? poolSelection : undefined}
      isFullscreen={fullscreenPanel === 'all'}
      onToggleFullscreen={() => toggleFullscreen('all')}
    />
  )

  const panelShellSx = {
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  }

  if (fullscreenPanel) {
    const fullscreenContent =
      fullscreenPanel === 'groups'
        ? groupsPanel
        : fullscreenPanel === 'in-folder'
          ? inFolderPanel
          : allCamerasPanel

    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          p: 1.5,
        }}
      >
        <Box sx={{ ...panelShellSx, flex: 1 }}>{fullscreenContent}</Box>
      </Box>
    )
  }

  const transferArrowLeft =
    panelLayout.length >= 2 ? panelLayout[0]! + panelLayout[1]! : 64

  return (
    <Box sx={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="camera-group-assign-layout"
        className="flex-1 min-h-0 min-w-0"
        onLayout={(sizes) => {
          if (sizes.length >= 3) setPanelLayout(sizes)
        }}
      >
        <ResizablePanel id="groups" defaultSize={28} minSize={16}>
          <Box sx={panelShellSx}>{groupsPanel}</Box>
        </ResizablePanel>

        <ResizableHandle withHandle className="!w-1.5" />

        <ResizablePanel id="in-folder" defaultSize={36} minSize={16}>
          <Box sx={panelShellSx}>{inFolderPanel}</Box>
        </ResizablePanel>

        <ResizableHandle withHandle className="!w-1.5" />

        <ResizablePanel id="all-cameras" defaultSize={36} minSize={16}>
          <Box sx={panelShellSx}>{allCamerasPanel}</Box>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: `${transferArrowLeft}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      >
        <TransferArrowControls
          selectedAssignGroupId={selectedAssignGroupId}
          selectedPoolIds={selectedPoolIds}
          selectedInGroupIds={selectedInGroupIds}
          onAddSelected={handleAddSelected}
          onRemoveSelected={handleRemoveSelected}
        />
      </Box>
    </Box>
  )
}
