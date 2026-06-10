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
import { CameraAssignInFolderPanel } from './camera-assign-in-folder-panel'
import { CameraAssignPanelHeader } from './camera-assign-panel-header'
import type { CameraAssignRowSelection, CameraRecordingRowSelection } from './camera-list-view'

export type CameraAssignPanelId = 'groups' | 'in-folder' | 'all'

function camInGroup(c: Camera, groupId: string): boolean {
  return (c.groupIds ?? []).includes(groupId)
}

export function CameraGroupTreeCard({
  selectedAssignGroupId,
  onSelectAssignGroup,
  isFullscreen,
  onToggleFullscreen,
  recordingSelection,
  groupsSubtitle = 'Select a folder to assign cameras',
}: {
  selectedAssignGroupId: string | null
  onSelectAssignGroup: (groupId: string) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  recordingSelection?: CameraRecordingRowSelection
  groupsSubtitle?: string
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
        subtitle={groupsSubtitle}
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
        recordingSelection={recordingSelection}
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
  const [inFolderStack, setInFolderStack] = useState<string[]>([])
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
    setInFolderStack([])
  }, [selectedAssignGroupId])

  const activeFolderId = useMemo(() => {
    if (!selectedAssignGroupId) return null
    if (inFolderStack.length === 0) return selectedAssignGroupId
    return inFolderStack[inFolderStack.length - 1] ?? selectedAssignGroupId
  }, [selectedAssignGroupId, inFolderStack])

  const activeFolder = useMemo(
    () => cameraGroups.find((g) => g.id === activeFolderId) ?? null,
    [cameraGroups, activeFolderId],
  )

  const inFolderBreadcrumbs = useMemo(() => {
    if (!selectedAssignGroupId || !selectedGroup) return []
    const items = [{ id: selectedAssignGroupId, name: selectedGroup.name }]
    for (const groupId of inFolderStack) {
      const group = cameraGroups.find((g) => g.id === groupId)
      items.push({ id: groupId, name: group?.name ?? groupId })
    }
    return items
  }, [selectedAssignGroupId, selectedGroup, inFolderStack, cameraGroups])

  useEffect(() => {
    setSelectedInGroupIds(new Set())
    setSelectedPoolIds(new Set())
  }, [activeFolderId])

  const availableCamerasSource = useMemo(() => {
    if (!activeFolderId) return [...cameras]
    return cameras.filter((c) => !camInGroup(c, activeFolderId))
  }, [cameras, activeFolderId])

  const addToGroup = useCallback(
    (cameraIds: string[]) => {
      if (!activeFolderId || cameraIds.length === 0) return
      const toAdd = cameraIds.filter((id) => {
        const c = cameras.find((x) => x.id === id)
        return c && !camInGroup(c, activeFolderId)
      })
      if (toAdd.length === 0) return
      addCamerasToParentGroup(activeFolderId, toAdd, { closeAddModal: false })
    },
    [activeFolderId, cameras, addCamerasToParentGroup],
  )

  const removeFromGroup = useCallback(
    (cameraIds: string[]) => {
      if (!activeFolderId || cameraIds.length === 0) return
      removeCamerasFromParentGroup(activeFolderId, cameraIds)
      setSelectedInGroupIds((prev) => {
        const next = new Set(prev)
        cameraIds.forEach((id) => next.delete(id))
        return next
      })
    },
    [activeFolderId, removeCamerasFromParentGroup],
  )

  const handleOpenInFolderSubfolder = useCallback((groupId: string) => {
    setInFolderStack((prev) => [...prev, groupId])
  }, [])

  const handleInFolderBreadcrumbNavigate = useCallback((segmentIndex: number) => {
    if (segmentIndex <= 0) {
      setInFolderStack([])
      return
    }
    setInFolderStack((prev) => prev.slice(0, segmentIndex))
  }, [])

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
    if (!activeFolderId) return
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
      if (!activeFolderId) return
      addToGroup([camera.id])
    },
    isRowDraggable: () => Boolean(activeFolderId),
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
    <CameraAssignInFolderPanel
      storageKey="explorer-list-table:camera-assign-in-folder"
      title="Cameras in folder"
      subtitle={
        activeFolder
          ? `Managing ${activeFolder.name}`
          : selectedGroup
            ? selectedGroup.name
            : 'Select a group on the left'
      }
      activeFolderId={activeFolderId}
      breadcrumbItems={inFolderBreadcrumbs}
      onBreadcrumbNavigate={handleInFolderBreadcrumbNavigate}
      onOpenSubfolder={handleOpenInFolderSubfolder}
      emptyMessage="No cameras in this folder. Add from the list on the right (double-click, drag, or arrow), or open a subgroup."
      assignRowSelection={activeFolderId ? inFolderSelection : undefined}
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
          activeFolderId
            ? `Add cameras to ${activeFolder?.name ?? 'folder'} — double-click or drag`
            : 'Select a group to add cameras'
        }
        sourceCameras={availableCamerasSource}
        emptyMessage={
          activeFolderId
            ? 'All cameras are already in this folder.'
            : 'Select a group on the left to assign cameras.'
        }
        assignRowSelection={activeFolderId ? poolSelection : undefined}
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
          selectedAssignGroupId={activeFolderId}
          selectedPoolIds={selectedPoolIds}
          selectedInGroupIds={selectedInGroupIds}
          onAddSelected={handleAddSelected}
          onRemoveSelected={handleRemoveSelected}
        />
      </Box>
    </Box>
  )
}
