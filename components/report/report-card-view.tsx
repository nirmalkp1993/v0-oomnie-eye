'use client'

import { Fragment, useMemo } from 'react'
import {
  useReportPlacemarkStore,
  REPORT_PIN_TAB_LABEL,
} from '@/lib/report-placemark-store'
import { placemarkMatchesSearch } from '@/lib/report-group-tree'
import type { ReportGroup, ReportPlacemark } from '@/types/report-placemark'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import {
  Camera as CameraIcon,
  ChevronDown,
  ChevronRight,
  MapPinned,
} from 'lucide-react'
import { ReportPinGlyph } from '@/components/report/report-pin-glyph'

function placemarkGroupIds(p: ReportPlacemark): string[] {
  return p.groupIds ?? []
}

function grpParentIds(g: ReportGroup): string[] {
  return g.parentGroupIds ?? []
}

function nameMatchesQuery(name: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return name.toLowerCase().includes(q)
}

function directChildCount(folderId: string, groups: ReportGroup[], placemarks: ReportPlacemark[]): number {
  const subfolders = groups.filter((g) => grpParentIds(g).includes(folderId)).length
  const pins = placemarks.filter((p) => placemarkGroupIds(p).includes(folderId)).length
  return subfolders + pins
}

export function ReportCardView() {
  const activePinType = useReportPlacemarkStore((s) => s.activePinType)
  const placemarksAll = useReportPlacemarkStore((s) => s.placemarks)
  const reportGroupsAll = useReportPlacemarkStore((s) => s.reportGroups)
  const searchQuery = useReportPlacemarkStore((s) => s.searchQuery)
  const reportCardExplorerStack = useReportPlacemarkStore((s) => s.reportCardExplorerStack)
  const pushReportCardExplorerFolder = useReportPlacemarkStore((s) => s.pushReportCardExplorerFolder)
  const navigateReportCardExplorerToSegmentIndex = useReportPlacemarkStore(
    (s) => s.navigateReportCardExplorerToSegmentIndex,
  )

  const placemarks = useMemo(
    () => placemarksAll.filter((p) => p.pinType === activePinType),
    [placemarksAll, activePinType],
  )
  const reportGroups = useMemo(
    () => reportGroupsAll.filter((g) => g.pinType === activePinType),
    [reportGroupsAll, activePinType],
  )

  const currentFolderId =
    reportCardExplorerStack.length > 0
      ? reportCardExplorerStack[reportCardExplorerStack.length - 1]
      : null

  const displayLevel = reportCardExplorerStack.length + 1

  const { folderCards, placemarkCards } = useMemo(() => {
    if (!currentFolderId) {
      const folders = reportGroups
        .filter((g) => grpParentIds(g).length === 0)
        .filter((g) => nameMatchesQuery(g.name, searchQuery))
        .sort((a, b) => a.name.localeCompare(b.name))
      const pins = placemarks
        .filter((p) => placemarkGroupIds(p).length === 0)
        .filter((p) => placemarkMatchesSearch(p, searchQuery))
        .sort((a, b) => a.placemarkName.localeCompare(b.placemarkName))
      return { folderCards: folders, placemarkCards: pins }
    }
    const folders = reportGroups
      .filter((g) => grpParentIds(g).includes(currentFolderId))
      .filter((g) => nameMatchesQuery(g.name, searchQuery))
      .sort((a, b) => a.name.localeCompare(b.name))
    const pins = placemarks
      .filter((p) => placemarkGroupIds(p).includes(currentFolderId))
      .filter((p) => placemarkMatchesSearch(p, searchQuery))
      .sort((a, b) => a.placemarkName.localeCompare(b.placemarkName))
    return { folderCards: folders, placemarkCards: pins }
  }, [placemarks, reportGroups, currentFolderId, searchQuery])

  const totalItems = folderCards.length + placemarkCards.length

  return (
    <div className="space-y-3">
      <Breadcrumb>
        <BreadcrumbList className="rounded-md border border-border bg-muted/40 px-2 py-1.5 sm:px-3">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                type="button"
                className={cn(
                  'rounded px-1.5 py-0.5 text-sm font-medium transition-colors',
                  reportCardExplorerStack.length === 0
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                onClick={() => navigateReportCardExplorerToSegmentIndex(0)}
              >
                Root
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {reportCardExplorerStack.map((id, i) => {
            const g = reportGroups.find((x) => x.id === id)
            const label = g?.name ?? id
            const isLast = i === reportCardExplorerStack.length - 1
            const segmentIndex = i + 1
            return (
              <Fragment key={`${id}-${i}`}>
                <BreadcrumbSeparator>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="max-w-[200px] truncate text-sm font-medium sm:max-w-xs">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button
                        type="button"
                        className="max-w-[160px] truncate rounded px-1.5 py-0.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:max-w-[240px]"
                        onClick={() => navigateReportCardExplorerToSegmentIndex(segmentIndex)}
                      >
                        {label}
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {folderCards.map((group) => {
          const n = directChildCount(group.id, reportGroups, placemarks)
          return (
            <Card
              key={group.id}
              role="button"
              tabIndex={0}
              onClick={() => pushReportCardExplorerFolder(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  pushReportCardExplorerFolder(group.id)
                }
              }}
              className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10"
            >
              <div className="relative flex h-24 flex-col items-center justify-center bg-gradient-to-b from-muted/80 to-muted/40">
                <div className="absolute left-2 top-2 flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="h-5 border-orange-200 bg-orange-100 px-1.5 py-0 text-[10px] font-bold text-orange-800"
                  >
                    L{displayLevel}
                  </Badge>
                  <span className="flex size-5 items-center justify-center rounded-full border border-border bg-background/90 shadow-sm">
                    <ChevronDown className="size-2.5 text-muted-foreground" />
                  </span>
                </div>
                <CameraIcon className="size-11 text-primary drop-shadow-sm" strokeWidth={1.15} />
              </div>
              <CardContent className="space-y-0.5 border-t border-border p-2">
                <h3 className="truncate text-sm font-semibold leading-tight text-foreground" title={group.name}>
                  {group.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {n} item{n === 1 ? '' : 's'}
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">Type: group</p>
                <div className="mt-1.5 flex items-center gap-1.5 border-t border-border pt-1.5">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                    G
                  </div>
                  <span className="truncate text-[11px] text-muted-foreground">Report group</span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {placemarkCards.map((p) => (
          <Card
            key={p.id}
            className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10"
          >
            <div className="relative h-20 overflow-hidden bg-muted sm:h-24">
              <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="h-5 border-orange-200 bg-orange-100 px-1.5 py-0 text-[10px] font-bold text-orange-800"
                >
                  L{displayLevel}
                </Badge>
                <span className="flex size-5 items-center justify-center rounded-full border border-border bg-background/90 shadow-sm">
                  <ChevronDown className="size-2.5 text-muted-foreground" />
                </span>
              </div>
              <div
                className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/60"
                style={{
                  background: `linear-gradient(135deg, ${p.iconColor}22 0%, var(--muted) 55%, var(--muted) 100%)`,
                }}
              >
                <span style={{ color: p.iconColor }} className="opacity-90 drop-shadow-sm">
                  <ReportPinGlyph iconKey={p.pinIcon} className="size-10 sm:size-11" />
                </span>
              </div>
              <Badge className="absolute right-2 top-2 z-10 border-0 bg-primary/90 px-1.5 py-0 text-[9px] font-bold uppercase leading-tight text-primary-foreground">
                {REPORT_PIN_TAB_LABEL[p.pinType]}
              </Badge>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 z-10 p-1.5">
                <h3 className="truncate text-xs font-semibold leading-tight text-white">{p.placemarkName}</h3>
                <p className="truncate text-[10px] leading-tight text-white/75">{p.city}</p>
              </div>
            </div>
            <CardContent className="space-y-0.5 p-2">
              <p className="truncate text-sm font-semibold leading-tight text-foreground">{p.placemarkName}</p>
              <p className="text-xs text-muted-foreground">Items —</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                Type: {REPORT_PIN_TAB_LABEL[p.pinType].toLowerCase()}
              </p>
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <Badge
                  variant="outline"
                  className="h-5 gap-0.5 border-primary/30 px-1.5 text-[10px] text-primary"
                >
                  <MapPinned className="size-2.5" />
                  {p.category}
                </Badge>
              </div>
              <div className="mt-1 flex items-center gap-1.5 border-t border-border pt-1.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                  P
                </div>
                <span className="truncate text-[11px] text-muted-foreground">Placemark</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalItems === 0 && (
        <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
          <div className="text-center">
            <MapPinned className="mx-auto size-9 text-muted-foreground/40" />
            <p className="mt-2 text-muted-foreground">This folder is empty</p>
            <p className="text-sm text-muted-foreground/80">
              {searchQuery.trim()
                ? 'No groups or placemarks match your search here.'
                : 'Open another folder from the path above or add groups and placemarks.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
