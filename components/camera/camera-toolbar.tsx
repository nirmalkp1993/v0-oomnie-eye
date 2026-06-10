'use client'

import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { Button, IconButton, Tooltip } from '@mui/material'
import { useMemo } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { EnterpriseExplorerToolbar } from '@/src/components/enterprise'
import {
  cameraPrimaryButtonSx,
  cameraToolbarIconButtonSx,
} from './camera-module.styles'
import type { CameraManagementMode } from './camera-management-mode'

interface CameraToolbarProps {
  mode: CameraManagementMode
  /** When `card`, renders inside the camera-group tree panel header. */
  layout?: 'page' | 'card'
}

export function CameraToolbar({ mode, layout = 'page' }: CameraToolbarProps) {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    setIsAddDialogOpen,
    setIsNewRootGroupModalOpen,
    getFilteredCameras,
    cameraGroups,
    expandAllListGroups,
    collapseAllListGroups,
  } = useCameraStore()

  const filteredCount = getFilteredCameras().length
  const hasGroups = cameraGroups.length > 0

  const expandCollapseActions = useMemo(() => {
    if (mode !== 'groups' || !hasGroups) return null
    return (
      <>
        <Tooltip title="Expand all groups" arrow placement="bottom">
          <IconButton size="small" onClick={expandAllListGroups} sx={cameraToolbarIconButtonSx}>
            <FolderOpenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Collapse all groups" arrow placement="bottom">
          <IconButton size="small" onClick={collapseAllListGroups} sx={cameraToolbarIconButtonSx}>
            <FolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    )
  }, [mode, hasGroups, expandAllListGroups, collapseAllListGroups])

  const trailingActions =
    mode === 'cameras' ? (
      <Button
        variant="contained"
        disableElevation
        size="small"
        startIcon={<VideocamOutlinedIcon />}
        onClick={() => setIsAddDialogOpen(true)}
        sx={cameraPrimaryButtonSx}
      >
        Add Camera
      </Button>
    ) : (
      <Button
        variant="contained"
        disableElevation
        size="small"
        startIcon={<CreateNewFolderOutlinedIcon />}
        onClick={() => setIsNewRootGroupModalOpen(true)}
        sx={cameraPrimaryButtonSx}
      >
        New group
      </Button>
    )

  return (
    <EnterpriseExplorerToolbar
      variant="default"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder={mode === 'cameras' ? 'Search cameras...' : 'Search groups and cameras...'}
      resultCount={filteredCount}
      resultLabel="camera"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      leadingToolbarActions={expandCollapseActions}
      trailingActions={trailingActions}
      showViewModeToggle={mode !== 'groups'}
      showTableControls={layout === 'card' ? false : mode === 'groups' || viewMode === 'table'}
      layout={layout}
    />
  )
}
