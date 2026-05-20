'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import {
  useReportPlacemarkStore,
  REPORT_PIN_TAB_LABEL,
} from '@/lib/report-placemark-store'
import {
  countPlacemarksInGroupSubtree,
  type ReportTableGroupNode,
} from '@/lib/report-group-tree'
import type { ReportGroup, ReportPlacemark } from '@/types/report-placemark'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
  MapPinned,
} from 'lucide-react'
import { ReportPinGlyph } from '@/components/report/report-pin-glyph'
import { ExplorerTableHeaderRow } from '@/components/tables/explorer-table-header-row'
import { useExplorerListTable } from '@/components/tables/explorer-list-table-context'
import {
  applyReportListFilters,
  getPlacemarkFilterValues,
  getReportGroupFilterValues,
} from '@/lib/explorer-list-table/report-table'
import { getSortedTreeSiblings } from '@/lib/explorer-list-table/tree-sort'
import { cn } from '@/lib/utils'
import { Box, Paper } from '@mui/material'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'

const CELL = '-'

function collectAllGroupIds(nodes: ReportTableGroupNode[]): string[] {
  const ids: string[] = []
  const walk = (n: ReportTableGroupNode) => {
    ids.push(n.group.id)
    n.children.forEach(walk)
  }
  nodes.forEach(walk)
  return ids
}

function fmtCoord(n: number) {
  return n.toFixed(5)
}

function nameIndent(depth: number) {
  return depth > 0 ? { marginLeft: 8 + depth * 16 } : undefined
}

function tagsCell(tags: string[]) {
  if (tags.length === 0) return <span className="text-muted-foreground">{CELL}</span>
  const shown = tags.slice(0, 3)
  const rest = tags.length - shown.length
  return (
    <div className="flex max-w-[220px] flex-wrap gap-1" title={tags.join(', ')}>
      {shown.map((t) => (
        <Badge
          key={t}
          variant="secondary"
          className="max-w-[100px] truncate border-0 bg-muted/90 px-1.5 py-0 text-[10px] font-normal"
        >
          {t}
        </Badge>
      ))}
      {rest > 0 && <span className="text-[10px] text-muted-foreground">+{rest}</span>}
    </div>
  )
}

export function ReportListView() {
  const placemarks = useReportPlacemarkStore((s) => s.placemarks)
  const reportGroups = useReportPlacemarkStore((s) => s.reportGroups)
  const searchQuery = useReportPlacemarkStore((s) => s.searchQuery)
  const activePinType = useReportPlacemarkStore((s) => s.activePinType)
  const getReportTableTree = useReportPlacemarkStore((s) => s.getReportTableTree)

  const { visibleColumns, filters, sort } = useExplorerListTable()

  const rawTree = useMemo(
    () => getReportTableTree(),
    [getReportTableTree, placemarks, reportGroups, searchQuery, activePinType]
  )

  const { rootTrees, rootPlacemarks } = useMemo(
    () =>
      applyReportListFilters(
        rawTree.rootTrees,
        rawTree.rootPlacemarks,
        filters,
        (groupId) => countPlacemarksInGroupSubtree(groupId, placemarks, reportGroups)
      ),
    [rawTree, filters, placemarks, reportGroups]
  )

  const getSortedSiblings = useCallback(
    (groups: ReportTableGroupNode[], leaves: ReportPlacemark[]) =>
      getSortedTreeSiblings(
        groups,
        leaves,
        sort,
        (node) => {
          const count = countPlacemarksInGroupSubtree(node.group.id, placemarks, reportGroups)
          return sort
            ? (getReportGroupFilterValues(node.group, count)[sort.columnId] ?? '')
            : ''
        },
        (p) => (sort ? (getPlacemarkFilterValues(p)[sort.columnId] ?? '') : '')
      ),
    [sort, placemarks, reportGroups]
  )

  const setGroupToDelete = useReportPlacemarkStore((s) => s.setGroupToDelete)
  const setIsDeleteGroupDialogOpen = useReportPlacemarkStore((s) => s.setIsDeleteGroupDialogOpen)
  const setSubgroupModalParentId = useReportPlacemarkStore((s) => s.setSubgroupModalParentId)
  const setAddPlacemarksModalGroupId = useReportPlacemarkStore((s) => s.setAddPlacemarksModalGroupId)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const colSpan = visibleColumns.length

  useEffect(() => {
    if (!searchQuery.trim()) return
    setExpanded((prev) => {
      const next = { ...prev }
      for (const id of collectAllGroupIds(rootTrees)) {
        next[id] = true
      }
      return next
    })
  }, [searchQuery, rootTrees])

  const toggleGroup = useCallback((groupId: string) => {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }, [])

  const handleDeleteGroup = (group: ReportGroup, e: React.MouseEvent) => {
    e.stopPropagation()
    setGroupToDelete(group)
    setIsDeleteGroupDialogOpen(true)
  }

  const renderPlacemarkCell = (columnId: string, p: ReportPlacemark, depth: number) => {
    switch (columnId) {
      case 'name':
        return (
          <TableCell
            key={columnId}
            className="sticky left-0 z-10 bg-card font-medium text-foreground"
          >
            <div
              className={cn(
                'flex items-center gap-2 pl-1',
                depth > 0 && 'border-l border-border pl-3'
              )}
              style={nameIndent(depth)}
            >
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40"
                style={{ color: p.iconColor }}
              >
                <ReportPinGlyph iconKey={p.pinIcon} className="size-4" />
              </span>
              <span className="min-w-0 truncate">{p.placemarkName}</span>
            </div>
          </TableCell>
        )
      case 'items':
        return (
          <TableCell key={columnId} className="text-center text-muted-foreground">
            {CELL}
          </TableCell>
        )
      case 'pinIcon':
        return (
          <TableCell key={columnId}>
            <div className="flex items-center gap-2">
              <ReportPinGlyph iconKey={p.pinIcon} className="size-4 text-muted-foreground" />
              <span className="text-xs capitalize text-muted-foreground">{p.pinIcon}</span>
            </div>
          </TableCell>
        )
      case 'iconColor':
        return (
          <TableCell key={columnId}>
            <div className="flex items-center gap-2">
              <span
                className="size-5 shrink-0 rounded border border-border shadow-sm"
                style={{ backgroundColor: p.iconColor }}
                title={p.iconColor}
              />
              <span className="font-mono text-xs text-muted-foreground">{p.iconColor}</span>
            </div>
          </TableCell>
        )
      case 'category':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {p.category || CELL}
          </TableCell>
        )
      case 'tags':
        return <TableCell key={columnId}>{tagsCell(p.tags)}</TableCell>
      case 'city':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {p.city || CELL}
          </TableCell>
        )
      case 'country':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {p.country || CELL}
          </TableCell>
        )
      case 'region':
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {p.region || CELL}
          </TableCell>
        )
      case 'latitude':
        return (
          <TableCell key={columnId} className="font-mono text-xs tabular-nums text-muted-foreground">
            {fmtCoord(p.latitude)}
          </TableCell>
        )
      case 'longitude':
        return (
          <TableCell key={columnId} className="font-mono text-xs tabular-nums text-muted-foreground">
            {fmtCoord(p.longitude)}
          </TableCell>
        )
      case 'altitude':
        return (
          <TableCell key={columnId} className="font-mono text-xs tabular-nums text-muted-foreground">
            {p.altitude}
          </TableCell>
        )
      case 'grounding':
        return (
          <TableCell key={columnId} className="text-xs text-muted-foreground">
            {p.grounding || CELL}
          </TableCell>
        )
      case 'description':
        return (
          <TableCell
            key={columnId}
            className="max-w-[200px] truncate text-xs text-muted-foreground"
            title={p.description}
          >
            {p.description || CELL}
          </TableCell>
        )
      case 'actions':
        return (
          <TableCell
            key={columnId}
            className="sticky right-0 z-10 bg-card text-right text-muted-foreground"
          >
            {CELL}
          </TableCell>
        )
      default:
        return null
    }
  }

  const renderGroupCell = (
    columnId: string,
    node: ReportTableGroupNode,
    depth: number,
    count: number,
    isOpen: boolean
  ) => {
    switch (columnId) {
      case 'name':
        return (
          <TableCell
            key={columnId}
            className="sticky left-0 z-10 bg-card font-medium text-foreground"
          >
            <div
              className={cn(
                'flex items-center gap-2 pl-1',
                depth > 0 && 'border-l border-border pl-3'
              )}
              style={nameIndent(depth)}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleGroup(node.group.id)
                }}
              >
                {isOpen ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </Button>
              <Folder className="size-4 shrink-0 text-primary" />
              <span>{node.group.name}</span>
            </div>
          </TableCell>
        )
      case 'items':
        return (
          <TableCell key={columnId} className="text-center text-muted-foreground">
            {count}
          </TableCell>
        )
      case 'actions':
        return (
          <TableCell
            key={columnId}
            className="sticky right-0 z-10 bg-card text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => handleDeleteGroup(node.group, e)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </TableCell>
        )
      default:
        return (
          <TableCell key={columnId} className="text-muted-foreground">
            {CELL}
          </TableCell>
        )
    }
  }

  const renderPlacemarkRow = (p: ReportPlacemark, depth: number, rowKey: string) => (
    <TableRow key={rowKey} className="border-border hover:bg-primary/5">
      {visibleColumns.map((col) => renderPlacemarkCell(col.id, p, depth))}
    </TableRow>
  )

  const renderGroupNode = (node: ReportTableGroupNode, depth: number, pathKey: string): React.ReactNode => {
    const rowKey = pathKey ? `${pathKey}>${node.group.id}` : node.group.id
    const isOpen = expanded[node.group.id] ?? true
    const count = countPlacemarksInGroupSubtree(node.group.id, placemarks, reportGroups)

    return (
      <Fragment key={rowKey}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <TableRow
              className="cursor-pointer border-border bg-muted/30 hover:bg-muted/50"
              onClick={() => toggleGroup(node.group.id)}
            >
              {visibleColumns.map((col) =>
                renderGroupCell(col.id, node, depth, count, isOpen)
              )}
            </TableRow>
          </ContextMenuTrigger>
          <ContextMenuContent className="min-w-[11rem] border-border bg-popover">
            <ContextMenuItem
              className="cursor-pointer gap-2"
              onSelect={() => setSubgroupModalParentId(node.group.id)}
            >
              <FolderPlus className="size-4" />
              Create subgroup
            </ContextMenuItem>
            <ContextMenuItem
              className="cursor-pointer gap-2"
              onSelect={() => setAddPlacemarksModalGroupId(node.group.id)}
            >
              <MapPinned className="size-4" />
              Add placemark
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {isOpen &&
          getSortedSiblings(node.children, node.placemarks).map((sibling) =>
            sibling.kind === 'group' ? (
              <Fragment key={`g-${sibling.node.group.id}@${rowKey}`}>
                {renderGroupNode(sibling.node, depth + 1, rowKey)}
              </Fragment>
            ) : (
              <Fragment key={`${sibling.item.id}@${rowKey}`}>
                {renderPlacemarkRow(sibling.item, depth + 1, `${sibling.item.id}@${rowKey}`)}
              </Fragment>
            )
          )}
      </Fragment>
    )
  }

  const isEmpty = rootTrees.length === 0 && rootPlacemarks.length === 0

  return (
    <Paper elevation={0} sx={(theme) => ({ overflow: 'hidden', ...getEnterpriseSettingsCardSx(theme) })}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHeader>
            <ExplorerTableHeaderRow />
          </TableHeader>
          <TableBody>
            <TableRow className="border-border bg-muted/20 hover:bg-muted/25">
              <TableCell colSpan={colSpan} className="py-2 text-xs font-medium text-muted-foreground">
                Category:{' '}
                <span className="text-foreground">{REPORT_PIN_TAB_LABEL[activePinType]}</span>
                <span className="mx-2 text-border">|</span>
                Pins are read-only (API). Use groups to organize how they appear in reports.
              </TableCell>
            </TableRow>
            {getSortedSiblings(rootTrees, rootPlacemarks).map((sibling) =>
              sibling.kind === 'group' ? (
                <Fragment key={sibling.node.group.id}>
                  {renderGroupNode(sibling.node, 0, '')}
                </Fragment>
              ) : (
                <Fragment key={sibling.item.id}>
                  {renderPlacemarkRow(sibling.item, 0, sibling.item.id)}
                </Fragment>
              )
            )}
            {isEmpty && (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                  No groups or placemarks match this view. Create a group or adjust search and filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  )
}
