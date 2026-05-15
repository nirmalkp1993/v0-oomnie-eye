'use client'

import { Fragment, useMemo } from 'react'
import Image from 'next/image'
import { useCameraStore } from '@/lib/camera-store'
import type { Camera, CameraGroup } from '@/types/camera'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  MonitorPlay,
  Settings,
  Video,
} from 'lucide-react'

function camGroupIds(c: Camera): string[] {
  return c.groupIds ?? []
}

function grpParentIds(g: CameraGroup): string[] {
  return g.parentGroupIds ?? []
}

function nameMatchesQuery(name: string, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return name.toLowerCase().includes(q)
}

function cameraMatchesQuery(c: Camera, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    c.name.toLowerCase().includes(q) ||
    c.ip.toLowerCase().includes(q) ||
    c.type.toLowerCase().includes(q)
  )
}

function directChildCount(folderId: string, groups: CameraGroup[], cameras: Camera[]): number {
  const subfolders = groups.filter((g) => grpParentIds(g).includes(folderId)).length
  const cams = cameras.filter((c) => camGroupIds(c).includes(folderId)).length
  return subfolders + cams
}

export function CameraCardView() {
  const cameras = useCameraStore((s) => s.cameras)
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const searchQuery = useCameraStore((s) => s.searchQuery)
  const cardExplorerStack = useCameraStore((s) => s.cardExplorerStack)
  const pushCardExplorerFolder = useCameraStore((s) => s.pushCardExplorerFolder)
  const navigateCardExplorerToSegmentIndex = useCameraStore(
    (s) => s.navigateCardExplorerToSegmentIndex,
  )
  const setSelectedCamera = useCameraStore((s) => s.setSelectedCamera)

  const currentFolderId =
    cardExplorerStack.length > 0 ? cardExplorerStack[cardExplorerStack.length - 1] : null

  const displayLevel = cardExplorerStack.length + 1

  const { folderCards, cameraCards } = useMemo(() => {
    if (!currentFolderId) {
      const folders = cameraGroups
        .filter((g) => grpParentIds(g).length === 0)
        .filter((g) => nameMatchesQuery(g.name, searchQuery))
        .sort((a, b) => a.name.localeCompare(b.name))
      const cams = cameras
        .filter((c) => camGroupIds(c).length === 0)
        .filter((c) => cameraMatchesQuery(c, searchQuery))
        .sort((a, b) => a.name.localeCompare(b.name))
      return { folderCards: folders, cameraCards: cams }
    }
    const folders = cameraGroups
      .filter((g) => grpParentIds(g).includes(currentFolderId))
      .filter((g) => nameMatchesQuery(g.name, searchQuery))
      .sort((a, b) => a.name.localeCompare(b.name))
    const cams = cameras
      .filter((c) => camGroupIds(c).includes(currentFolderId))
      .filter((c) => cameraMatchesQuery(c, searchQuery))
      .sort((a, b) => a.name.localeCompare(b.name))
    return { folderCards: folders, cameraCards: cams }
  }, [cameras, cameraGroups, currentFolderId, searchQuery])

  const totalItems = folderCards.length + cameraCards.length

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
                  cardExplorerStack.length === 0
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                onClick={() => navigateCardExplorerToSegmentIndex(0)}
              >
                Root
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {cardExplorerStack.map((id, i) => {
            const g = cameraGroups.find((x) => x.id === id)
            const label = g?.name ?? id
            const isLast = i === cardExplorerStack.length - 1
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
                        onClick={() => navigateCardExplorerToSegmentIndex(segmentIndex)}
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
          const n = directChildCount(group.id, cameraGroups, cameras)
          return (
            <Card
              key={group.id}
              role="button"
              tabIndex={0}
              onClick={() => pushCardExplorerFolder(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  pushCardExplorerFolder(group.id)
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
                <CameraIcon
                  className="size-11 text-primary drop-shadow-sm"
                  strokeWidth={1.15}
                />
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
                  <span className="truncate text-[11px] text-muted-foreground">Camera group</span>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {cameraCards.map((camera) => (
          <Card
            key={camera.id}
            className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-sm hover:shadow-primary/10"
            onClick={() => setSelectedCamera(camera)}
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
              {camera.thumbnail ? (
                <Image
                  src={camera.thumbnail}
                  alt={camera.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <MonitorPlay className="size-9 text-muted-foreground/45" />
                </div>
              )}
              <Badge
                className={`absolute right-2 top-2 z-10 px-1.5 py-0 text-[9px] font-bold uppercase leading-tight ${
                  camera.status === 'live'
                    ? 'bg-live text-white'
                    : camera.status === 'connecting'
                      ? 'bg-warning text-warning-foreground'
                      : 'bg-stopped text-white'
                }`}
              >
                {camera.status === 'live'
                  ? 'LIVE'
                  : camera.status === 'connecting'
                    ? 'CONNECTING'
                    : 'STOPPED'}
              </Badge>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 z-10 p-1.5">
                <h3 className="truncate text-xs font-semibold leading-tight text-white">{camera.name}</h3>
                <p className="truncate text-[10px] leading-tight text-white/75">{camera.ip}</p>
              </div>
            </div>
            <CardContent className="space-y-0.5 p-2">
              <p className="truncate text-sm font-semibold leading-tight text-foreground">{camera.name}</p>
              <p className="text-xs text-muted-foreground">Items —</p>
              <p className="text-[11px] leading-tight text-muted-foreground">Type: camera</p>
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <Badge variant="outline" className="h-5 gap-0.5 px-1.5 text-[10px] border-primary/30 text-primary">
                  <Video className="size-2.5" />
                  {camera.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCamera(camera)
                  }}
                >
                  <Settings className="size-3.5" />
                </Button>
              </div>
              <div className="mt-1 flex items-center gap-1.5 border-t border-border pt-1.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                  C
                </div>
                <span className="truncate text-[11px] text-muted-foreground">Camera</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalItems === 0 && (
        <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
          <div className="text-center">
            <CameraIcon className="mx-auto size-9 text-muted-foreground/40" />
            <p className="mt-2 text-muted-foreground">This folder is empty</p>
            <p className="text-sm text-muted-foreground/80">
              {searchQuery.trim()
                ? 'No groups or cameras match your search here.'
                : 'Open another folder from the path above or add cameras and groups.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
