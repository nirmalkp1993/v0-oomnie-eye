'use client'

import { Fragment, useMemo, useState } from 'react'
import AddBusinessOutlinedIcon from '@mui/icons-material/AddBusinessOutlined'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import {
  Box,
  Button,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { FolderPlus } from 'lucide-react'
import { useOfficeTerritoryAssignmentStore } from '@/lib/office-territory-assignment-store'
import { useOfficeTerritoryPageStore } from '@/lib/office-territory-page-store'
import { useTerritoryStore } from '@/lib/territory-store'
import { CameraAssignPanelHeader } from '@/components/camera/camera-assign-panel-header'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { EnterpriseExplorerToolbar } from '@/src/components/enterprise'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import {
  countOfficesInTerritorySubtree,
  type TerritoryTableNode,
} from '@/src/lib/user-management/territory-tree-page.utils'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsHeaderTypographySx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
  myDrawingsTableSx,
} from '@/src/components/tables/my-drawings-table-styles'
import { MyDrawingsTreeDepthIndicators } from '@/src/components/tables/my-drawings-tree-depth-indicators'
import {
  myDrawingsPrimaryButtonSx,
  myDrawingsToolbarIconButtonSx,
} from '@/src/components/user-management/user-management-table-primitives'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

function NameCellShell({ depth, children }: { depth: number; children: React.ReactNode }) {
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
      <MyDrawingsTreeDepthIndicators depth={depth} isFolder />
      {children}
    </Box>
  )
}

function renderTerritoryNode(
  tableNode: TerritoryTableNode,
  depth: number,
  pathKey: string,
  options: {
    tree: HierarchyTreeNode[]
    assignments: Record<string, string>
    listTerritoryExpanded: Record<string, boolean>
    selectedTerritoryId: string | null
    onSelectTerritory: (territoryId: string) => void
    onToggleExpand: (territoryId: string) => void
    onCreateChild: (parentId: string) => void
    onEditTerritory: (node: HierarchyTreeNode) => void
    onDeleteTerritory: (node: HierarchyTreeNode) => void
  },
): React.ReactNode {
  const { node } = tableNode
  const rowKey = pathKey ? `${pathKey}>${node.id}` : node.id
  const isOpen = options.listTerritoryExpanded[node.id] ?? true
  const isSelected = options.selectedTerritoryId === node.id
  const officeCount = countOfficesInTerritorySubtree(node.id, options.tree, options.assignments)

  return (
    <Fragment key={rowKey}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow
            hover={false}
            onClick={() => options.onSelectTerritory(node.id)}
            sx={{
              ...myDrawingsBodyRowSx({ depth }),
              cursor: 'pointer',
              ...(isSelected
                ? {
                    bgcolor: 'action.selected',
                    '&:hover': { bgcolor: 'action.selected' },
                  }
                : {}),
            }}
          >
            <TableCell sx={myDrawingsTableCellSx}>
              <NameCellShell depth={depth}>
                <IconButton
                  size="small"
                  aria-label={isOpen ? 'Collapse territory' : 'Expand territory'}
                  onClick={(event) => {
                    event.stopPropagation()
                    options.onToggleExpand(node.id)
                  }}
                  sx={{ p: 0.25, mr: 0.25 }}
                >
                  {tableNode.children.length > 0 ? (
                    isOpen ? (
                      <ExpandMoreIcon fontSize="small" />
                    ) : (
                      <ChevronRightIcon fontSize="small" />
                    )
                  ) : (
                    <Box sx={{ width: 24, height: 24 }} />
                  )}
                </IconButton>
                {isOpen ? (
                  <PublicOutlinedIcon sx={{ fontSize: 18, color: MY_DRAWINGS_TABLE.folderOpen }} />
                ) : (
                  <PublicOutlinedIcon sx={{ fontSize: 18, color: MY_DRAWINGS_TABLE.folderClosed }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: depth === 0 ? 600 : 500 }}>
                    {node.name}
                  </Typography>
                </Box>
              </NameCellShell>
            </TableCell>
            <TableCell align="right" sx={myDrawingsTableCellSx}>
              <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                {officeCount}
              </Typography>
            </TableCell>
          </TableRow>
        </ContextMenuTrigger>
        <ContextMenuContent className="min-w-[11rem] border-border bg-popover">
          <ContextMenuItem
            className="cursor-pointer gap-2"
            onSelect={() => options.onCreateChild(node.id)}
          >
            <FolderPlus className="size-4" />
            Create child territory
          </ContextMenuItem>
          <ContextMenuItem
            className="cursor-pointer gap-2"
            onSelect={() => options.onEditTerritory(node)}
          >
            Edit territory
          </ContextMenuItem>
          <ContextMenuItem
            className="cursor-pointer gap-2 text-destructive"
            onSelect={() => options.onDeleteTerritory(node)}
          >
            Delete territory
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {isOpen
        ? tableNode.children.map((child) => renderTerritoryNode(child, depth + 1, rowKey, options))
        : null}
    </Fragment>
  )
}

export function OfficeTerritoryTreePanel({
  isFullscreen,
  onToggleFullscreen,
  onOpenCreateRoot,
  onOpenCreateOffice,
  onCreateChild,
  onEditTerritory,
  onDeleteTerritory,
}: {
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onOpenCreateRoot: () => void
  onOpenCreateOffice: () => void
  onCreateChild: (parentId: string) => void
  onEditTerritory: (node: HierarchyTreeNode) => void
  onDeleteTerritory: (node: HierarchyTreeNode) => void
}) {
  const tree = useTerritoryStore((state) => state.tree)
  const assignments = useOfficeTerritoryAssignmentStore((state) => state.assignments)
  const selectedTerritoryId = useOfficeTerritoryPageStore((state) => state.selectedTerritoryId)
  const setSelectedTerritoryId = useOfficeTerritoryPageStore((state) => state.setSelectedTerritoryId)
  const searchQuery = useOfficeTerritoryPageStore((state) => state.searchQuery)
  const setSearchQuery = useOfficeTerritoryPageStore((state) => state.setSearchQuery)
  const listTerritoryExpanded = useOfficeTerritoryPageStore((state) => state.listTerritoryExpanded)
  const toggleListTerritoryExpanded = useOfficeTerritoryPageStore(
    (state) => state.toggleListTerritoryExpanded,
  )
  const expandAllListTerritories = useOfficeTerritoryPageStore(
    (state) => state.expandAllListTerritories,
  )
  const collapseAllListTerritories = useOfficeTerritoryPageStore(
    (state) => state.collapseAllListTerritories,
  )
  const getTerritoryTree = useOfficeTerritoryPageStore((state) => state.getTerritoryTree)

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null)
  const addMenuOpen = Boolean(addMenuAnchor)

  const closeAddMenu = () => setAddMenuAnchor(null)

  const handleNewTerritory = () => {
    closeAddMenu()
    onOpenCreateRoot()
  }

  const handleCreateOffice = () => {
    closeAddMenu()
    onOpenCreateOffice()
  }

  const rootTrees = useMemo(() => getTerritoryTree(tree), [getTerritoryTree, tree, searchQuery])

  const territoryCount = useMemo(() => {
    let count = 0
    const walk = (nodes: HierarchyTreeNode[]) => {
      for (const node of nodes) {
        count += 1
        if (node.children?.length) walk(node.children)
      }
    }
    walk(tree)
    return count
  }, [tree])

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
        title="Territories"
        subtitle="Select a territory to manage offices"
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />
      <EnterpriseExplorerToolbar
        variant="drawings"
        layout="card"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search territories..."
        resultCount={territoryCount}
        resultLabel="territory"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewModeToggle={false}
        showTableControls={false}
        leadingToolbarActions={
          tree.length > 0 ? (
            <>
              <Tooltip title="Expand all territories" arrow placement="bottom">
                <IconButton
                  size="small"
                  onClick={() => expandAllListTerritories(tree)}
                  sx={myDrawingsToolbarIconButtonSx}
                >
                  <FolderOpenIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Collapse all territories" arrow placement="bottom">
                <IconButton
                  size="small"
                  onClick={collapseAllListTerritories}
                  sx={myDrawingsToolbarIconButtonSx}
                >
                  <FolderIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : null
        }
        trailingActions={
          <>
            <Button
              variant="contained"
              disableElevation
              size="small"
              endIcon={<ArrowDropDownIcon />}
              onClick={(event) => setAddMenuAnchor(event.currentTarget)}
              sx={myDrawingsPrimaryButtonSx}
            >
              New
            </Button>
            <Menu
              anchorEl={addMenuAnchor}
              open={addMenuOpen}
              onClose={closeAddMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleNewTerritory}>
                <ListItemIcon>
                  <CreateNewFolderOutlinedIcon fontSize="small" />
                </ListItemIcon>
                New territory
              </MenuItem>
              <MenuItem onClick={handleCreateOffice}>
                <ListItemIcon>
                  <AddBusinessOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Create office
              </MenuItem>
            </Menu>
          </>
        }
      />
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: 1 }}>
        <Table stickyHeader size="small" sx={myDrawingsTableSx}>
          <TableHead sx={myDrawingsTableHeadSx}>
            <TableRow hover={false}>
              <TableCell sx={myDrawingsTableCellSx}>
                <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                  Territory
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ ...myDrawingsTableCellSx, width: 88 }}>
                <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                  Offices
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={myDrawingsTableBodySx}>
            {rootTrees.length === 0 ? (
              <TableRow hover={false}>
                <TableCell colSpan={2} sx={{ ...myDrawingsTableCellSx, py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                    {searchQuery.trim()
                      ? 'No territories match your search.'
                      : 'No territories yet. Create a root territory to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rootTrees.map((node) =>
                renderTerritoryNode(node, 0, '', {
                  tree,
                  assignments,
                  listTerritoryExpanded,
                  selectedTerritoryId,
                  onSelectTerritory: setSelectedTerritoryId,
                  onToggleExpand: toggleListTerritoryExpanded,
                  onCreateChild,
                  onEditTerritory,
                  onDeleteTerritory,
                }),
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
