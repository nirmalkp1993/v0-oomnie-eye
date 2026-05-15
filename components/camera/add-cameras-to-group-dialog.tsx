'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import type { Camera } from '@/types/camera'
import { SearchableAddToGroupDialogLayout } from '@/components/shared/searchable-add-to-group-dialog-layout'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Camera as CameraIcon, Search, Video } from 'lucide-react'

function camGroupIds(c: { groupIds?: string[] | null }): string[] {
  return c.groupIds ?? []
}

function cameraMatchesModalSearch(cam: Camera, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    cam.name.toLowerCase().includes(q) ||
    cam.ip.toLowerCase().includes(q) ||
    cam.type.toLowerCase().includes(q)
  )
}

export function AddCamerasToGroupDialog() {
  const {
    addCamerasModalGroupId,
    setAddCamerasModalGroupId,
    cameras,
    cameraGroups,
    addCamerasToParentGroup,
  } = useCameraStore()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const open = addCamerasModalGroupId !== null

  const group = useMemo(
    () => cameraGroups.find((g) => g.id === addCamerasModalGroupId) ?? null,
    [cameraGroups, addCamerasModalGroupId],
  )

  const sortedCameras = useMemo(
    () => [...cameras].sort((a, b) => a.name.localeCompare(b.name)),
    [cameras],
  )

  const filteredCameras = useMemo(
    () => sortedCameras.filter((c) => cameraMatchesModalSearch(c, query)),
    [sortedCameras, query],
  )

  const selectedInView = useMemo(
    () => filteredCameras.filter((c) => selected.has(c.id)).length,
    [filteredCameras, selected],
  )

  const allFilteredSelected =
    filteredCameras.length > 0 && selectedInView === filteredCameras.length

  useEffect(() => {
    if (!open) return
    setSelected(new Set())
    setQuery('')
  }, [open, addCamerasModalGroupId])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllMatching = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      for (const c of filteredCameras) next.add(c.id)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addCamerasModalGroupId || selected.size === 0) return
    addCamerasToParentGroup(addCamerasModalGroupId, [...selected])
  }

  const scrollBody =
    sortedCameras.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No cameras</p>
        <p className="max-w-[240px] text-xs text-muted-foreground">Add cameras from the main camera module first.</p>
      </div>
    ) : filteredCameras.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted/80">
          <Search className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No cameras match</p>
        <p className="max-w-[240px] text-xs text-muted-foreground">
          Try another name, IP, or device type, or clear the search to see everything.
        </p>
      </div>
    ) : (
      <ul className="space-y-0.5">
        {filteredCameras.map((cam) => {
          const inThis = addCamerasModalGroupId
            ? camGroupIds(cam).includes(addCamerasModalGroupId)
            : false
          const isChecked = selected.has(cam.id)
          return (
            <li key={cam.id}>
              <label
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2.5 py-2.5 transition-colors',
                  'hover:border-border hover:bg-background/80',
                  isChecked && 'border-primary/25 bg-primary/[0.07] shadow-sm',
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggle(cam.id)}
                  className="mt-0.5 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground">
                      <Video className="size-4" />
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">{cam.name}</span>
                    {inThis && (
                      <Badge
                        variant="secondary"
                        className="h-5 border-0 bg-muted px-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                      >
                        In group
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-10 text-[11px] text-muted-foreground">
                    <span className="font-mono tabular-nums">{cam.ip}</span>
                    <span className="text-border">·</span>
                    <span>{cam.type}</span>
                  </div>
                </div>
              </label>
            </li>
          )
        })}
      </ul>
    )

  const summaryLine = (
    <>
      {filteredCameras.length === sortedCameras.length
        ? `${sortedCameras.length} camera${sortedCameras.length !== 1 ? 's' : ''}`
        : `${filteredCameras.length} of ${sortedCameras.length} cameras match`}
      {selected.size > 0 && (
        <span className="text-foreground">
          {' '}
          · {selected.size} selected
        </span>
      )}
    </>
  )

  return (
    <SearchableAddToGroupDialogLayout
      open={open}
      onOpenChange={(o) => {
        if (!o) setAddCamerasModalGroupId(null)
      }}
      title="Add cameras"
      titleIcon={<CameraIcon className="size-5 text-primary" />}
      description={
        group ? (
          <>
            Choose one or more cameras to assign to{' '}
            <span className="font-medium text-foreground">{group.name}</span>. Cameras can belong to
            multiple groups; other assignments are unchanged.
          </>
        ) : (
          'Pick a group from the table context menu first.'
        )
      }
      searchQuery={query}
      onSearchQueryChange={setQuery}
      searchPlaceholder="Search by name, IP, or type…"
      searchAriaLabel="Search cameras"
      summaryLine={summaryLine}
      matchingCount={filteredCameras.length}
      allFilteredSelected={allFilteredSelected}
      hasSelection={selected.size > 0}
      onSelectAllMatching={selectAllMatching}
      onClearSelection={clearSelection}
      onSubmit={submit}
      onCancel={() => setAddCamerasModalGroupId(null)}
      submitDisabled={!group || selected.size === 0}
      submitButtonLabel={selected.size > 0 ? `Add (${selected.size})` : 'Add'}
      footerHint={
        selected.size > 0
          ? `${selected.size} camera${selected.size !== 1 ? 's' : ''} will be added`
          : 'Select at least one camera'
      }
      scrollBody={scrollBody}
    />
  )
}
