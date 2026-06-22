'use client'

import { useMemo, useState, type DragEvent } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { CameraAssignPanelHeader } from '@/components/camera/camera-assign-panel-header'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import type { UserGroupFolderBreadcrumb } from '@/src/components/user-management/groups/user-group-folder-breadcrumbs'
import { OfficeAssignExplorer } from '@/src/components/user-management/offices/office-assign-explorer'
import { getOfficesForTerritory } from '@/src/lib/user-management/office-territory-members.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'
import type { OfficeListItem } from '@/src/types/office-page'

export function OfficeTerritoryMembersPanel({
  activeTerritory,
  allOffices,
  assignments,
  breadcrumbItems,
  onBreadcrumbNavigate,
  selectedMemberIds,
  onMemberSelectionChange,
  onDragOver,
  onDragLeave,
  onDrop,
  dropActive = false,
  isFullscreen,
  onToggleFullscreen,
}: {
  activeTerritory: HierarchyTreeNode | null
  allOffices: OfficeListItem[]
  assignments: Record<string, string>
  breadcrumbItems: UserGroupFolderBreadcrumb[]
  onBreadcrumbNavigate: (segmentIndex: number) => void
  selectedMemberIds: Set<string>
  onMemberSelectionChange: (ids: string[]) => void
  onDragOver?: (e: DragEvent) => void
  onDragLeave?: (e: DragEvent) => void
  onDrop?: (e: DragEvent) => void
  dropActive?: boolean
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  const [panelSearch, setPanelSearch] = useState('')

  const members = useMemo(() => {
    if (!activeTerritory) return []
    return getOfficesForTerritory(activeTerritory.id, allOffices, assignments)
  }, [activeTerritory, allOffices, assignments])

  const currentFolderName = breadcrumbItems[breadcrumbItems.length - 1]?.name

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
        title={currentFolderName ? `Offices in ${currentFolderName}` : 'Offices in territory'}
        subtitle={
          activeTerritory
            ? `Managing ${activeTerritory.name}`
            : 'Select a territory on the left'
        }
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      {!activeTerritory ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Select a territory on the left to view assigned offices.
        </Typography>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <OfficeAssignExplorer
            storageKey="explorer-list-table:office-territory-in-folder"
            offices={members}
            searchQuery={panelSearch}
            onSearchChange={setPanelSearch}
            breadcrumbItems={breadcrumbItems}
            onBreadcrumbNavigate={onBreadcrumbNavigate}
            emptyMessage="No offices in this territory. Add offices from the unassigned list on the right (double-click, drag, or arrow)."
            checkboxSelection
            selectedIds={[...selectedMemberIds]}
            onSelectedIdsChange={onMemberSelectionChange}
          />
        </Box>
      )}
    </Paper>
  )
}

export function OfficeTerritoryAvailableOfficesPanel({
  activeTerritory,
  canAssignOffices,
  availableOffices,
  selectedOfficeIds,
  onPoolSelectionChange,
  onOfficeDoubleClick,
  isOfficeDraggable,
  onOfficeDragStart,
  isFullscreen,
  onToggleFullscreen,
}: {
  activeTerritory: HierarchyTreeNode | null
  canAssignOffices: boolean
  availableOffices: OfficeListItem[]
  selectedOfficeIds: Set<string>
  onPoolSelectionChange: (ids: string[]) => void
  onOfficeDoubleClick: (officeId: string) => void
  isOfficeDraggable?: (office: OfficeListItem) => boolean
  onOfficeDragStart?: (office: OfficeListItem, e: DragEvent) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}) {
  const [panelSearch, setPanelSearch] = useState('')

  const emptyMessage =
    canAssignOffices && availableOffices.length === 0
      ? 'All offices are assigned to a territory.'
      : 'No offices match your search.'

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
        title="Unassigned offices"
        subtitle={
          canAssignOffices && activeTerritory
            ? `Add offices to ${activeTerritory.name} — double-click, drag, or use arrows`
            : 'Select a territory on the left to assign offices'
        }
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />

      <OfficeAssignExplorer
        storageKey="explorer-list-table:office-territory-unassigned"
        offices={availableOffices}
        searchQuery={panelSearch}
        onSearchChange={setPanelSearch}
        emptyMessage={emptyMessage}
        selectedIds={canAssignOffices ? [...selectedOfficeIds] : []}
        onSelectedIdsChange={canAssignOffices ? onPoolSelectionChange : undefined}
        rowClickToggleSelect={canAssignOffices}
        onRowDoubleClick={
          canAssignOffices ? (office) => onOfficeDoubleClick(office.id) : undefined
        }
        isRowDraggable={canAssignOffices ? isOfficeDraggable : undefined}
        onRowDragStart={canAssignOffices ? onOfficeDragStart : undefined}
      />
    </Paper>
  )
}
