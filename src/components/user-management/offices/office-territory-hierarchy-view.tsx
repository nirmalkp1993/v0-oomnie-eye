'use client'

import { useCallback, useEffect, useMemo, useState, type DragEvent } from 'react'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { Box, IconButton, Tooltip } from '@mui/material'
import { useOfficeStore } from '@/lib/office-store'
import { useOfficeTerritoryAssignmentStore } from '@/lib/office-territory-assignment-store'
import { useOfficeTerritoryPageStore } from '@/lib/office-territory-page-store'
import { useTerritoryStore } from '@/lib/territory-store'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { OFFICE_TERRITORY_DRAG_MIME } from '@/src/constants/office-territories'
import {
  flattenOfficeTree,
  getUnassignedOffices,
} from '@/src/lib/user-management/office-territory-members.utils'
import {
  buildTerritoryAncestorBreadcrumbs,
  findTerritoryNodeById,
} from '@/src/lib/user-management/territory-tree-page.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import { OfficeTerritoryTreePanel } from './office-territory-tree-panel'
import {
  OfficeTerritoryAvailableOfficesPanel,
  OfficeTerritoryMembersPanel,
} from './office-territory-members-panel'

export type OfficeTerritoryPanelId = 'territories' | 'in-territory' | 'unassigned'

function TransferArrowControls({
  activeTerritoryId,
  selectedPoolIds,
  selectedMemberIds,
  onAddSelected,
  onRemoveSelected,
  disabled,
}: {
  activeTerritoryId: string | null
  selectedPoolIds: Set<string>
  selectedMemberIds: Set<string>
  onAddSelected: () => void
  onRemoveSelected: () => void
  disabled: boolean
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
      <Tooltip title="Add selected offices to territory" placement="left">
        <span>
          <IconButton
            size="small"
            color="primary"
            disabled={disabled || !activeTerritoryId || selectedPoolIds.size === 0}
            onClick={onAddSelected}
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Remove selected from territory" placement="left">
        <span>
          <IconButton
            size="small"
            disabled={disabled || !activeTerritoryId || selectedMemberIds.size === 0}
            onClick={onRemoveSelected}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  )
}

export function OfficeTerritoryHierarchyView({
  onOpenCreateRoot,
  onOpenCreateOffice,
  onCreateChild,
  onEditTerritory,
  onDeleteTerritory,
}: {
  onOpenCreateRoot: () => void
  onOpenCreateOffice: () => void
  onCreateChild: (parentId: string) => void
  onEditTerritory: (node: HierarchyTreeNode) => void
  onDeleteTerritory: (node: HierarchyTreeNode) => void
}) {
  const territoryTree = useTerritoryStore((state) => state.tree)
  const officeTree = useOfficeStore((state) => state.tree)
  const assignments = useOfficeTerritoryAssignmentStore((state) => state.assignments)
  const assignToTerritory = useOfficeTerritoryAssignmentStore((state) => state.assignToTerritory)
  const removeFromTerritory = useOfficeTerritoryAssignmentStore((state) => state.removeFromTerritory)
  const selectedTerritoryId = useOfficeTerritoryPageStore((state) => state.selectedTerritoryId)
  const setSelectedTerritoryId = useOfficeTerritoryPageStore((state) => state.setSelectedTerritoryId)

  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [selectedPoolIds, setSelectedPoolIds] = useState<Set<string>>(new Set())
  const [fullscreenPanel, setFullscreenPanel] = useState<OfficeTerritoryPanelId | null>(null)
  const [panelLayout, setPanelLayout] = useState<number[]>([28, 36, 36])
  const [dropHighlight, setDropHighlight] = useState(false)

  const allOffices = useMemo(() => flattenOfficeTree(officeTree), [officeTree])

  const activeTerritory = useMemo(
    () =>
      selectedTerritoryId ? findTerritoryNodeById(territoryTree, selectedTerritoryId) : null,
    [territoryTree, selectedTerritoryId],
  )

  useEffect(() => {
    if (selectedTerritoryId && findTerritoryNodeById(territoryTree, selectedTerritoryId)) {
      return
    }
    setSelectedTerritoryId(territoryTree[0]?.id ?? null)
  }, [territoryTree, selectedTerritoryId, setSelectedTerritoryId])

  const breadcrumbItems = useMemo(() => {
    if (!selectedTerritoryId) return []
    return buildTerritoryAncestorBreadcrumbs(territoryTree, selectedTerritoryId)
  }, [selectedTerritoryId, territoryTree])

  useEffect(() => {
    setSelectedMemberIds(new Set())
    setSelectedPoolIds(new Set())
  }, [selectedTerritoryId])

  const unassignedOffices = useMemo(
    () => getUnassignedOffices(allOffices, assignments),
    [allOffices, assignments],
  )

  const canAssignOffices = Boolean(activeTerritory)

  const addToTerritory = useCallback(
    (officeIds: string[]) => {
      if (!selectedTerritoryId || officeIds.length === 0) return
      assignToTerritory(selectedTerritoryId, officeIds)
      setSelectedPoolIds(new Set())
    },
    [selectedTerritoryId, assignToTerritory],
  )

  const removeFromActiveTerritory = useCallback(
    (officeIds: string[]) => {
      if (!selectedTerritoryId || officeIds.length === 0) return
      removeFromTerritory(officeIds)
      setSelectedMemberIds((prev) => {
        const next = new Set(prev)
        officeIds.forEach((id) => next.delete(id))
        return next
      })
    },
    [selectedTerritoryId, removeFromTerritory],
  )

  const handleDragStart = useCallback(
    (officeId: string) => (e: DragEvent) => {
      e.dataTransfer.setData(OFFICE_TERRITORY_DRAG_MIME, officeId)
      e.dataTransfer.effectAllowed = 'copy'
    },
    [],
  )

  const handleDragOver = useCallback(
    (e: DragEvent) => {
      if (!canAssignOffices) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
      setDropHighlight(true)
    },
    [canAssignOffices],
  )

  const handleDragLeave = useCallback(() => {
    setDropHighlight(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDropHighlight(false)
      if (!canAssignOffices) return
      const id = e.dataTransfer.getData(OFFICE_TERRITORY_DRAG_MIME)
      if (id) addToTerritory([id])
    },
    [canAssignOffices, addToTerritory],
  )

  const territoriesPanel = (
    <OfficeTerritoryTreePanel
      isFullscreen={fullscreenPanel === 'territories'}
      onToggleFullscreen={() =>
        setFullscreenPanel((prev) => (prev === 'territories' ? null : 'territories'))
      }
      onOpenCreateRoot={onOpenCreateRoot}
      onOpenCreateOffice={onOpenCreateOffice}
      onCreateChild={onCreateChild}
      onEditTerritory={onEditTerritory}
      onDeleteTerritory={onDeleteTerritory}
    />
  )

  const inTerritoryPanel = (
    <OfficeTerritoryMembersPanel
      activeTerritory={activeTerritory}
      allOffices={allOffices}
      assignments={assignments}
      breadcrumbItems={breadcrumbItems}
      onBreadcrumbNavigate={(index) => {
        const item = breadcrumbItems[index]
        if (item) setSelectedTerritoryId(item.id)
      }}
      selectedMemberIds={selectedMemberIds}
      onMemberSelectionChange={(ids) => {
        setSelectedMemberIds(new Set(ids))
        setSelectedPoolIds(new Set())
      }}
      onDragOver={canAssignOffices ? handleDragOver : undefined}
      onDragLeave={canAssignOffices ? handleDragLeave : undefined}
      onDrop={canAssignOffices ? handleDrop : undefined}
      dropActive={dropHighlight}
      isFullscreen={fullscreenPanel === 'in-territory'}
      onToggleFullscreen={() =>
        setFullscreenPanel((prev) => (prev === 'in-territory' ? null : 'in-territory'))
      }
    />
  )

  const unassignedPanel = (
    <OfficeTerritoryAvailableOfficesPanel
      activeTerritory={activeTerritory}
      canAssignOffices={canAssignOffices}
      availableOffices={unassignedOffices}
      selectedOfficeIds={selectedPoolIds}
      onPoolSelectionChange={(ids) => {
        setSelectedPoolIds(new Set(ids))
        setSelectedMemberIds(new Set())
      }}
      onOfficeDoubleClick={(officeId) => addToTerritory([officeId])}
      isOfficeDraggable={() => canAssignOffices}
      onOfficeDragStart={(office, e) => handleDragStart(office.id)(e)}
      isFullscreen={fullscreenPanel === 'unassigned'}
      onToggleFullscreen={() =>
        setFullscreenPanel((prev) => (prev === 'unassigned' ? null : 'unassigned'))
      }
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
    const content =
      fullscreenPanel === 'territories'
        ? territoriesPanel
        : fullscreenPanel === 'in-territory'
          ? inTerritoryPanel
          : unassignedPanel

    return (
      <Box sx={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
        <Box sx={{ ...panelShellSx, flex: 1 }}>{content}</Box>
      </Box>
    )
  }

  const transferArrowLeft = panelLayout.length >= 2 ? panelLayout[0]! + panelLayout[1]! : 64

  return (
    <Box sx={{ position: 'relative', flex: 1, minHeight: 0, minWidth: 0, display: 'flex' }}>
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="office-territory-hierarchy-layout"
        className="flex-1 min-h-0 min-w-0"
        onLayout={(sizes) => {
          if (sizes.length >= 3) setPanelLayout(sizes)
        }}
      >
        <ResizablePanel id="territories" defaultSize={28} minSize={16}>
          <Box sx={panelShellSx}>{territoriesPanel}</Box>
        </ResizablePanel>

        <ResizableHandle withHandle className="!w-1.5" />

        <ResizablePanel id="in-territory" defaultSize={36} minSize={16}>
          <Box sx={panelShellSx}>{inTerritoryPanel}</Box>
        </ResizablePanel>

        <ResizableHandle withHandle className="!w-1.5" />

        <ResizablePanel id="unassigned" defaultSize={36} minSize={16}>
          <Box sx={panelShellSx}>{unassignedPanel}</Box>
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
          activeTerritoryId={selectedTerritoryId}
          selectedPoolIds={selectedPoolIds}
          selectedMemberIds={selectedMemberIds}
          onAddSelected={() => addToTerritory([...selectedPoolIds])}
          onRemoveSelected={() => removeFromActiveTerritory([...selectedMemberIds])}
          disabled={!canAssignOffices}
        />
      </Box>
    </Box>
  )
}
