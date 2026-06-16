'use client'

import { Fragment, useMemo, useState } from 'react'
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import {
  Box,
  Button,
  IconButton,
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
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { useUserGroupStore } from '@/lib/user-group-store'
import {
  UNASSIGNED_USERS_FOLDER_ID,
  UNASSIGNED_USERS_FOLDER_NAME,
  isUnassignedUsersFolder,
} from '@/src/constants/user-groups'
import { getUnassignedUsers } from '@/src/lib/user-management/group-members.utils'
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
  countMembersInGroupSubtree,
  type UserGroupTableNode,
} from '@/src/lib/user-management/user-group-tree.utils'
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
import { myDrawingsPrimaryButtonSx, myDrawingsToolbarIconButtonSx } from '@/src/components/user-management/user-management-table-primitives'

function NameCellShell({
  depth,
  children,
}: {
  depth: number
  children: React.ReactNode
}) {
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

function renderGroupNode(
  node: UserGroupTableNode,
  depth: number,
  pathKey: string,
  options: {
    groups: ReturnType<typeof useUserGroupStore.getState>['groups']
    listGroupExpanded: Record<string, boolean>
    selectedGroupId: string | null
    onSelectGroup: (groupId: string) => void
    onToggleExpand: (groupId: string) => void
    onCreateSubgroup: (parentId: string) => void
    onEditGroup: (group: UserGroupTableNode['group']) => void
    onDeleteGroup: (group: UserGroupTableNode['group']) => void
  },
): React.ReactNode {
  const rowKey = pathKey ? `${pathKey}>${node.group.id}` : node.group.id
  const isOpen = options.listGroupExpanded[node.group.id] ?? true
  const isSelected = options.selectedGroupId === node.group.id
  const memberCount = countMembersInGroupSubtree(node.group.id, options.groups)

  return (
    <Fragment key={rowKey}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow
            hover={false}
            onClick={() => options.onSelectGroup(node.group.id)}
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
                  aria-label={isOpen ? 'Collapse group' : 'Expand group'}
                  onClick={(event) => {
                    event.stopPropagation()
                    options.onToggleExpand(node.group.id)
                  }}
                  sx={{ p: 0.25, mr: 0.25 }}
                >
                  {node.children.length > 0 ? (
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
                  <FolderOpenIcon sx={{ fontSize: 18, color: MY_DRAWINGS_TABLE.folderOpen }} />
                ) : (
                  <FolderIcon sx={{ fontSize: 18, color: MY_DRAWINGS_TABLE.folderClosed }} />
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: depth === 0 ? 600 : 500 }}>
                    {node.group.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {node.group.type === 'dynamic' ? 'Dynamic' : 'Static'}
                  </Typography>
                </Box>
              </NameCellShell>
            </TableCell>
            <TableCell align="right" sx={myDrawingsTableCellSx}>
              <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                {memberCount}
              </Typography>
            </TableCell>
          </TableRow>
        </ContextMenuTrigger>
        <ContextMenuContent className="min-w-[11rem] border-border bg-popover">
          <ContextMenuItem
            className="cursor-pointer gap-2"
            onSelect={() => options.onCreateSubgroup(node.group.id)}
          >
            <FolderPlus className="size-4" />
            Create subgroup
          </ContextMenuItem>
          <ContextMenuItem
            className="cursor-pointer gap-2"
            onSelect={() => options.onEditGroup(node.group)}
          >
            Edit group
          </ContextMenuItem>
          <ContextMenuItem
            className="cursor-pointer gap-2 text-destructive"
            onSelect={() => options.onDeleteGroup(node.group)}
          >
            Delete group
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {isOpen
        ? node.children.map((child) =>
            renderGroupNode(child, depth + 1, rowKey, options),
          )
        : null}
    </Fragment>
  )
}

export function UserGroupTreePanel({
  isFullscreen,
  onToggleFullscreen,
  onOpenCreateRoot,
  onCreateSubgroup,
  onEditGroup,
  onDeleteGroup,
}: {
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onOpenCreateRoot: () => void
  onCreateSubgroup: (parentId: string) => void
  onEditGroup: (group: UserGroupTableNode['group']) => void
  onDeleteGroup: (group: UserGroupTableNode['group']) => void
}) {
  const groups = useUserGroupStore((state) => state.groups)
  const directoryUsers = useUserDirectoryStore((state) => state.users)
  const selectedGroupId = useUserGroupStore((state) => state.selectedGroupId)
  const setSelectedGroupId = useUserGroupStore((state) => state.setSelectedGroupId)
  const searchQuery = useUserGroupStore((state) => state.searchQuery)
  const setSearchQuery = useUserGroupStore((state) => state.setSearchQuery)
  const listGroupExpanded = useUserGroupStore((state) => state.listGroupExpanded)
  const toggleListGroupExpanded = useUserGroupStore((state) => state.toggleListGroupExpanded)
  const expandAllListGroups = useUserGroupStore((state) => state.expandAllListGroups)
  const collapseAllListGroups = useUserGroupStore((state) => state.collapseAllListGroups)
  const getGroupTree = useUserGroupStore((state) => state.getGroupTree)

  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  const rootTrees = useMemo(
    () => getGroupTree(),
    [getGroupTree, groups, searchQuery, listGroupExpanded],
  )

  const unassignedCount = useMemo(
    () => getUnassignedUsers(groups, directoryUsers).length,
    [groups, directoryUsers],
  )

  const showUnassignedFolder = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true
    return UNASSIGNED_USERS_FOLDER_NAME.toLowerCase().includes(query)
  }, [searchQuery])

  const isUnassignedSelected = isUnassignedUsersFolder(selectedGroupId)

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
        subtitle="Select a folder to manage members"
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
      />
      <EnterpriseExplorerToolbar
        variant="drawings"
        layout="card"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search groups..."
        resultCount={groups.length}
        resultLabel="group"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewModeToggle={false}
        showTableControls={false}
        leadingToolbarActions={
          groups.length > 0 ? (
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
          ) : null
        }
        trailingActions={
          <Button
            variant="contained"
            disableElevation
            size="small"
            startIcon={<CreateNewFolderOutlinedIcon />}
            onClick={onOpenCreateRoot}
            sx={myDrawingsPrimaryButtonSx}
          >
            New group
          </Button>
        }
      />
      <TableContainer sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: 1 }}>
        <Table stickyHeader size="small" sx={myDrawingsTableSx}>
          <TableHead sx={myDrawingsTableHeadSx}>
            <TableRow hover={false}>
              <TableCell sx={myDrawingsTableCellSx}>
                <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                  Group
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ ...myDrawingsTableCellSx, width: 88 }}>
                <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                  Members
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={myDrawingsTableBodySx}>
            {rootTrees.length === 0 && !showUnassignedFolder ? (
              <TableRow hover={false}>
                <TableCell colSpan={2} sx={{ ...myDrawingsTableCellSx, py: 4, textAlign: 'center' }}>
                  <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                    {searchQuery.trim()
                      ? 'No groups match your search.'
                      : 'No groups yet. Create a root group to get started.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {rootTrees.map((node) =>
                  renderGroupNode(node, 0, '', {
                    groups,
                    listGroupExpanded,
                    selectedGroupId,
                    onSelectGroup: setSelectedGroupId,
                    onToggleExpand: toggleListGroupExpanded,
                    onCreateSubgroup,
                    onEditGroup,
                    onDeleteGroup,
                  }),
                )}
                {showUnassignedFolder ? (
                  <TableRow
                    hover={false}
                    onClick={() => setSelectedGroupId(UNASSIGNED_USERS_FOLDER_ID)}
                    sx={{
                      ...myDrawingsBodyRowSx({ depth: 0 }),
                      cursor: 'pointer',
                      borderTop: rootTrees.length > 0 ? 1 : 0,
                      borderColor: 'divider',
                      ...(isUnassignedSelected
                        ? {
                            bgcolor: 'action.selected',
                            '&:hover': { bgcolor: 'action.selected' },
                          }
                        : {}),
                    }}
                  >
                    <TableCell sx={myDrawingsTableCellSx}>
                      <NameCellShell depth={0}>
                        <Box sx={{ width: 24, height: 24, mr: 0.25 }} />
                        <PersonOffOutlinedIcon
                          sx={{
                            fontSize: 18,
                            color: isUnassignedSelected
                              ? MY_DRAWINGS_TABLE.folderOpen
                              : MY_DRAWINGS_TABLE.folderClosed,
                          }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                            {UNASSIGNED_USERS_FOLDER_NAME}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            No group linked
                          </Typography>
                        </Box>
                      </NameCellShell>
                    </TableCell>
                    <TableCell align="right" sx={myDrawingsTableCellSx}>
                      <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx}>
                        {unassignedCount}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
