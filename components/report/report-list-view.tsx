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
  TableHead,
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

const CELL = '-'
const COL_SPAN = 15

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
      {rest > 0 && (
        <span className="text-[10px] text-muted-foreground">+{rest}</span>
      )}
    </div>
  )
}

export function ReportListView() {
  const placemarks = useReportPlacemarkStore((s) => s.placemarks)
  const reportGroups = useReportPlacemarkStore((s) => s.reportGroups)
  const searchQuery = useReportPlacemarkStore((s) => s.searchQuery)
  const activePinType = useReportPlacemarkStore((s) => s.activePinType)
  const getReportTableTree = useReportPlacemarkStore((s) => s.getReportTableTree)

  const { rootTrees, rootPlacemarks } = useMemo(
    () => getReportTableTree(),
    [getReportTableTree, placemarks, reportGroups, searchQuery, activePinType],
  )

  const setGroupToDelete = useReportPlacemarkStore((s) => s.setGroupToDelete)
  const setIsDeleteGroupDialogOpen = useReportPlacemarkStore((s) => s.setIsDeleteGroupDialogOpen)
  const setSubgroupModalParentId = useReportPlacemarkStore((s) => s.setSubgroupModalParentId)
  const setAddPlacemarksModalGroupId = useReportPlacemarkStore((s) => s.setAddPlacemarksModalGroupId)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

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

  const groupFill = (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <TableCell key={i} className="text-muted-foreground">
          {CELL}
        </TableCell>
      ))}
    </>
  )

  const renderPlacemarkRow = (p: ReportPlacemark, depth: number, rowKey: string) => (
    <TableRow key={rowKey} className="border-border hover:bg-primary/5">
      <TableCell className="font-medium text-foreground">
        <div
          className={
            depth > 0
              ? 'flex items-center gap-2 border-l border-border pl-3'
              : 'flex items-center gap-2 pl-1'
          }
          style={depth > 0 ? { marginLeft: 8 + depth * 16 } : undefined}
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
      <TableCell className="text-center text-muted-foreground">{CELL}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ReportPinGlyph iconKey={p.pinIcon} className="size-4 text-muted-foreground" />
          <span className="text-xs capitalize text-muted-foreground">{p.pinIcon}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className="size-5 shrink-0 rounded border border-border shadow-sm"
            style={{ backgroundColor: p.iconColor }}
            title={p.iconColor}
          />
          <span className="font-mono text-xs text-muted-foreground">{p.iconColor}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{p.category || CELL}</TableCell>
      <TableCell>{tagsCell(p.tags)}</TableCell>
      <TableCell className="text-muted-foreground">{p.city || CELL}</TableCell>
      <TableCell className="text-muted-foreground">{p.country || CELL}</TableCell>
      <TableCell className="text-muted-foreground">{p.region || CELL}</TableCell>
      <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
        {fmtCoord(p.latitude)}
      </TableCell>
      <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">
        {fmtCoord(p.longitude)}
      </TableCell>
      <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">{p.altitude}</TableCell>
      <TableCell className="text-muted-foreground text-xs">{p.grounding || CELL}</TableCell>
      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground" title={p.description}>
        {p.description || CELL}
      </TableCell>
      <TableCell className="text-right text-muted-foreground">{CELL}</TableCell>
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
              <TableCell className="font-medium text-foreground">
                <div
                  className={
                    depth > 0
                      ? 'flex items-center gap-2 border-l border-border pl-3'
                      : 'flex items-center gap-2 pl-1'
                  }
                  style={depth > 0 ? { marginLeft: 8 + depth * 16 } : undefined}
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
                    {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </Button>
                  <Folder className="size-4 shrink-0 text-primary" />
                  <span>{node.group.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center text-muted-foreground">{count}</TableCell>
              {groupFill}
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => handleDeleteGroup(node.group, e)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
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
        {isOpen && (
          <>
            {node.children.map((ch) => renderGroupNode(ch, depth + 1, rowKey))}
            {node.placemarks.map((p) => (
              <Fragment key={`${p.id}@${rowKey}`}>{renderPlacemarkRow(p, depth + 1, `${p.id}@${rowKey}`)}</Fragment>
            ))}
          </>
        )}
      </Fragment>
    )
  }

  const isEmpty = rootTrees.length === 0 && rootPlacemarks.length === 0

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="sticky left-0 z-10 min-w-[200px] bg-card font-semibold text-primary">
                Placemark name
              </TableHead>
              <TableHead className="w-[72px] text-center font-semibold text-primary">Items</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-primary">Pin icon</TableHead>
              <TableHead className="min-w-[120px] font-semibold text-primary">Icon color</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-primary">Category</TableHead>
              <TableHead className="min-w-[140px] font-semibold text-primary">Tags</TableHead>
              <TableHead className="min-w-[90px] font-semibold text-primary">City</TableHead>
              <TableHead className="min-w-[90px] font-semibold text-primary">Country</TableHead>
              <TableHead className="min-w-[90px] font-semibold text-primary">Region</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-primary">Latitude</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-primary">Longitude</TableHead>
              <TableHead className="min-w-[80px] font-semibold text-primary">Altitude</TableHead>
              <TableHead className="min-w-[100px] font-semibold text-primary">Grounding</TableHead>
              <TableHead className="min-w-[200px] font-semibold text-primary">Description</TableHead>
              <TableHead className="sticky right-0 z-10 min-w-[72px] bg-card text-right font-semibold text-primary">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-border bg-muted/20 hover:bg-muted/25">
              <TableCell colSpan={COL_SPAN} className="py-2 text-xs font-medium text-muted-foreground">
                Category:{' '}
                <span className="text-foreground">{REPORT_PIN_TAB_LABEL[activePinType]}</span>
                <span className="mx-2 text-border">|</span>
                Pins are read-only (API). Use groups to organize how they appear in reports.
              </TableCell>
            </TableRow>
            {rootTrees.map((node) => renderGroupNode(node, 0, ''))}
            {rootPlacemarks.map((p) => (
              <Fragment key={p.id}>{renderPlacemarkRow(p, 0, p.id)}</Fragment>
            ))}
            {isEmpty && (
              <TableRow>
                <TableCell colSpan={COL_SPAN} className="h-32 text-center text-muted-foreground">
                  No groups or placemarks match this view. Create a group or adjust search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
