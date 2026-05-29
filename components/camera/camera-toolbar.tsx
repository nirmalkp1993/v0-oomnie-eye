'use client'

import AddIcon from '@mui/icons-material/Add'
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import {
  alpha,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { EnterpriseExplorerToolbar } from '@/src/components/enterprise'
import {
  myDrawingsPrimaryButtonSx,
  myDrawingsToolbarIconButtonSx,
} from '@/src/components/tables/my-drawings-table-styles'

const DrawingsNewMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': { padding: '4px 0' },
    '& .MuiMenuItem-root': {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '14px',
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
}))

export function CameraToolbar() {
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

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const filteredCount = getFilteredCameras().length
  const hasGroups = cameraGroups.length > 0

  const expandCollapseActions = useMemo(() => {
    if (viewMode !== 'table' || !hasGroups) return null
    return (
      <>
        <Tooltip title="Expand all groups" arrow placement="bottom">
          <IconButton size="small" onClick={expandAllListGroups} sx={myDrawingsToolbarIconButtonSx}>
            <FolderOpenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Collapse all groups" arrow placement="bottom">
          <IconButton size="small" onClick={collapseAllListGroups} sx={myDrawingsToolbarIconButtonSx}>
            <FolderIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </>
    )
  }, [viewMode, hasGroups, expandAllListGroups, collapseAllListGroups])

  return (
    <EnterpriseExplorerToolbar
      variant="drawings"
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search cameras..."
      resultCount={filteredCount}
      resultLabel="camera"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      leadingToolbarActions={expandCollapseActions}
      trailingActions={
        <>
          <Button
            variant="contained"
            disableElevation
            size="small"
            endIcon={<KeyboardArrowDownIcon />}
            startIcon={<AddIcon />}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            sx={myDrawingsPrimaryButtonSx}
          >
            New
          </Button>
          <DrawingsNewMenu
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
              <ListItemText
                primary="Add Camera"
                primaryTypographyProps={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
              />
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
              <ListItemText
                primary="New group"
                primaryTypographyProps={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}
              />
            </MenuItem>
          </DrawingsNewMenu>
        </>
      }
    />
  )
}
