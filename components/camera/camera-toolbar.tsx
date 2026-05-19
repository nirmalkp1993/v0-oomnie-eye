'use client'

import AddIcon from '@mui/icons-material/Add'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { EnterpriseExplorerToolbar } from '@/src/components/enterprise'

export function CameraToolbar() {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    setIsAddDialogOpen,
    setIsNewRootGroupModalOpen,
    getFilteredCameras,
  } = useCameraStore()

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const filteredCount = getFilteredCameras().length

  return (
    <EnterpriseExplorerToolbar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search cameras..."
      resultCount={filteredCount}
      resultLabel="camera"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      trailingActions={
        <>
          <Button
            variant="contained"
            endIcon={<KeyboardArrowDownIcon />}
            startIcon={<AddIcon />}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
          >
            New
          </Button>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null)
                setIsAddDialogOpen(true)
              }}
            >
              <ListItemIcon>
                <VideocamOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Add Camera</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null)
                setIsNewRootGroupModalOpen(true)
              }}
            >
              <ListItemIcon>
                <CreateNewFolderOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>New group</ListItemText>
            </MenuItem>
          </Menu>
        </>
      }
    />
  )
}
