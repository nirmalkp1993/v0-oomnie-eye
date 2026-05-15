'use client'

import PlaceOutlined from '@mui/icons-material/PlaceOutlined'
import PublicOutlined from '@mui/icons-material/PublicOutlined'
import { Box, Stack, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem'
import type { GeoTreeNode } from '@/src/mock-data/geo-tree'

interface GeoLocationTreeProps {
  root: GeoTreeNode
  selectedIds: Set<string>
  onChange: (next: Set<string>) => void
}

function GeoTreeBranch({
  node,
  selectedIds,
  onToggle,
}: {
  node: GeoTreeNode
  selectedIds: Set<string>
  onToggle: (id: string) => void
}) {
  const theme = useTheme()
  const selected = selectedIds.has(node.id)
  const isLeaf = !node.children?.length
  const isWorld = node.id === 'world'

  return (
    <TreeItem
      itemId={node.id}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(`.${treeItemClasses.iconContainer}`)) return
        onToggle(node.id)
      }}
      label={
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.75}
          sx={{
            py: 0.35,
            px: 0.75,
            mx: -0.75,
            borderRadius: 1,
            flex: 1,
            minWidth: 0,
            bgcolor: selected ? alpha(theme.palette.primary.main, 0.14) : 'transparent',
          }}
        >
          {isWorld ? <PublicOutlined sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }} /> : null}
          {isLeaf ? <PlaceOutlined sx={{ fontSize: 18, color: 'error.main', opacity: 0.9, flexShrink: 0 }} /> : null}
          <Typography variant="body2" fontWeight={node.children?.length ? 600 : 500} sx={{ minWidth: 0 }}>
            {node.label}
          </Typography>
        </Stack>
      }
    >
      {node.children?.map((c) => (
        <GeoTreeBranch key={c.id} node={c} selectedIds={selectedIds} onToggle={onToggle} />
      ))}
    </TreeItem>
  )
}

export function GeoLocationTree({ root, selectedIds, onChange }: GeoLocationTreeProps) {
  const onToggle = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <Box
      sx={{
        maxHeight: 280,
        overflow: 'auto',
        borderRadius: 2,
        border: (t) => `1px solid ${t.palette.divider}`,
        p: 1,
        bgcolor: 'background.paper',
      }}
    >
      <SimpleTreeView
        defaultExpandedItems={['world', 'asia', 'india']}
        disableSelection
        expansionTrigger="iconContainer"
        sx={{ userSelect: 'none' }}
      >
        <GeoTreeBranch node={root} selectedIds={selectedIds} onToggle={onToggle} />
      </SimpleTreeView>
    </Box>
  )
}
