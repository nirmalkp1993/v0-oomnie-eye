'use client'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material'
import {
  APP_MODULE_TREE,
  type AppModuleNode,
} from '@/src/mock-data/app-modules'
import { getModuleDisplayName } from '@/src/constants/permissions-page-matrix'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import type { PermissionMatrixModule } from '@/src/types/permissions-page'

function nodeMatchesSearch(node: AppModuleNode, q: string): boolean {
  if (!q) return true
  const title = node.title.toLowerCase()
  if (title.includes(q) || node.id.includes(q) || node.description.toLowerCase().includes(q)) {
    return true
  }
  return node.children?.some((child) => nodeMatchesSearch(child, q)) ?? false
}

function TreeNode({
  node,
  depth,
  expandedGroupIds,
  onToggleGroup,
  selectedModuleId,
  onSelectModule,
  searchQuery,
}: {
  node: AppModuleNode
  depth: number
  expandedGroupIds: ReadonlySet<string>
  onToggleGroup: (groupId: string) => void
  selectedModuleId: string | null
  onSelectModule: (moduleId: string) => void
  searchQuery: string
}) {
  const q = searchQuery.trim().toLowerCase()
  if (!nodeMatchesSearch(node, q)) return null

  const isGroup = Boolean(node.isGroupHeader && node.children?.length)
  const isExpanded = isGroup ? expandedGroupIds.has(node.id) : false
  const isLeaf = !isGroup
  const selected = isLeaf && selectedModuleId === node.id

  return (
    <>
      <ListItemButton
        selected={selected}
        onClick={() => {
          if (isGroup) onToggleGroup(node.id)
          else onSelectModule(node.id)
        }}
        sx={{
          py: isGroup ? 1.1 : 0.55,
          pl: 1.75 + depth * 1.75,
          pr: 1.75,
          minHeight: isGroup ? 36 : 32,
          borderBottom: isGroup ? `1px solid ${BITRIX_ACCESS_UI.borderColor}` : 'none',
          bgcolor: selected ? '#f0f9fc' : isGroup && isExpanded ? '#eef9fc' : 'transparent',
          borderLeft: selected ? '3px solid' : '3px solid transparent',
          borderColor: selected ? BITRIX_ACCESS_UI.primaryBlue : 'transparent',
          '&:hover': {
            bgcolor: selected ? '#f0f9fc' : BITRIX_ACCESS_UI.sectionBg,
          },
          '&.Mui-selected': { bgcolor: '#f0f9fc' },
          '&.Mui-selected:hover': { bgcolor: '#f0f9fc' },
        }}
      >
        <ListItemText
          primary={node.title}
          primaryTypographyProps={{
            variant: 'body2',
            fontSize: isGroup ? '0.8125rem' : '0.8125rem',
            fontWeight: isGroup ? 600 : selected ? 600 : 400,
            color: selected || (isGroup && isExpanded)
              ? BITRIX_ACCESS_UI.linkBlue
              : BITRIX_ACCESS_UI.textPrimary,
          }}
        />
        {isGroup ? (
          isExpanded ? (
            <ExpandLessIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
          )
        ) : null}
      </ListItemButton>

      {isGroup && isExpanded
        ? node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedGroupIds={expandedGroupIds}
              onToggleGroup={onToggleGroup}
              selectedModuleId={selectedModuleId}
              onSelectModule={onSelectModule}
              searchQuery={searchQuery}
            />
          ))
        : null}
    </>
  )
}

export function PermissionCategorySidebar({
  expandedGroupIds,
  onToggleGroup,
  selectedModuleId,
  onSelectModule,
  searchQuery = '',
}: {
  expandedGroupIds: ReadonlySet<string>
  onToggleGroup: (groupId: string) => void
  selectedModuleId: string | null
  onSelectModule: (moduleId: string) => void
  searchQuery?: string
}) {
  return (
    <Box
      sx={{
        width: BITRIX_ACCESS_UI.sidebarWidth,
        flexShrink: 0,
        borderRight: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
        bgcolor: '#fff',
        overflow: 'auto',
        fontFamily: BITRIX_ACCESS_UI.fontFamily,
      }}
    >
      <Box
        sx={{
          px: 1.75,
          py: 1.25,
          borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
          bgcolor: BITRIX_ACCESS_UI.headerBg,
        }}
      >
        <ListItemText
          primary="Application modules"
          primaryTypographyProps={{
            variant: 'body2',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: BITRIX_ACCESS_UI.textPrimary,
          }}
        />
      </Box>
      <List dense disablePadding sx={{ pb: 0.5 }}>
        {APP_MODULE_TREE.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            expandedGroupIds={expandedGroupIds}
            onToggleGroup={onToggleGroup}
            selectedModuleId={selectedModuleId}
            onSelectModule={onSelectModule}
            searchQuery={searchQuery}
          />
        ))}
      </List>
    </Box>
  )
}

/** @deprecated Use node title from app-modules */
export function getSidebarModuleLabel(module: PermissionMatrixModule): string {
  return getModuleDisplayName(module)
}
