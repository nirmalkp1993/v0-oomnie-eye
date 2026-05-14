'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  useReportPlacemarkStore,
  REPORT_PIN_TAB_LABEL,
} from '@/lib/report-placemark-store'
import { placemarkMatchesSearch } from '@/lib/report-group-tree'
import type { ReportPlacemark } from '@/types/report-placemark'
import { SearchableAddToGroupDialogLayout } from '@/components/shared/searchable-add-to-group-dialog-layout'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { MapPinned, Search } from 'lucide-react'
import { ReportPinGlyph } from '@/components/report/report-pin-glyph'

function placemarkGroupIds(p: ReportPlacemark): string[] {
  return p.groupIds ?? []
}

export function AddPlacemarksToGroupDialog() {
  const {
    addPlacemarksModalGroupId,
    setAddPlacemarksModalGroupId,
    placemarks,
    reportGroups,
    activePinType,
    addPlacemarksToParentGroup,
  } = useReportPlacemarkStore()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const open = addPlacemarksModalGroupId !== null

  const group = useMemo(
    () => reportGroups.find((g) => g.id === addPlacemarksModalGroupId) ?? null,
    [reportGroups, addPlacemarksModalGroupId],
  )

  const catalog = useMemo(
    () => placemarks.filter((p) => p.pinType === activePinType),
    [placemarks, activePinType],
  )

  const sorted = useMemo(
    () => [...catalog].sort((a, b) => a.placemarkName.localeCompare(b.placemarkName)),
    [catalog],
  )

  const filtered = useMemo(
    () => sorted.filter((p) => placemarkMatchesSearch(p, query)),
    [sorted, query],
  )

  const selectedInView = useMemo(
    () => filtered.filter((p) => selected.has(p.id)).length,
    [filtered, selected],
  )

  const allFilteredSelected = filtered.length > 0 && selectedInView === filtered.length

  useEffect(() => {
    if (!open) return
    setSelected(new Set())
    setQuery('')
  }, [open, addPlacemarksModalGroupId])

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
      for (const p of filtered) next.add(p.id)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addPlacemarksModalGroupId || selected.size === 0) return
    addPlacemarksToParentGroup(addPlacemarksModalGroupId, [...selected])
  }

  const scrollBody =
    sorted.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No placemarks for this tab</p>
        <p className="max-w-[260px] text-xs text-muted-foreground">
          Data is loaded from your integration. When pins exist for {REPORT_PIN_TAB_LABEL[activePinType]},
          they will appear here.
        </p>
      </div>
    ) : filtered.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-muted/80">
          <Search className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No placemarks match</p>
        <p className="max-w-[240px] text-xs text-muted-foreground">
          Adjust search keywords or clear the field to see all placemarks for this category.
        </p>
      </div>
    ) : (
      <ul className="space-y-0.5">
        {filtered.map((p) => {
          const inThis = addPlacemarksModalGroupId
            ? placemarkGroupIds(p).includes(addPlacemarksModalGroupId)
            : false
          const isChecked = selected.has(p.id)
          return (
            <li key={p.id}>
              <label
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2.5 py-2.5 transition-colors',
                  'hover:border-border hover:bg-background/80',
                  isChecked && 'border-primary/25 bg-primary/[0.07] shadow-sm',
                )}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggle(p.id)}
                  className="mt-0.5 border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50"
                      style={{ color: p.iconColor }}
                    >
                      <ReportPinGlyph iconKey={p.pinIcon} className="size-4" />
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">
                      {p.placemarkName}
                    </span>
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
                    <span>{p.category}</span>
                    <span className="text-border">·</span>
                    <span className="font-mono tabular-nums">{p.city}</span>
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
      {filtered.length === sorted.length
        ? `${sorted.length} placemark${sorted.length !== 1 ? 's' : ''}`
        : `${filtered.length} of ${sorted.length} match`}
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
        if (!o) setAddPlacemarksModalGroupId(null)
      }}
      title="Add placemarks"
      titleIcon={<MapPinned className="size-5 text-primary" />}
      description={
        group ? (
          <>
            Choose placemarks to assign to{' '}
            <span className="font-medium text-foreground">{group.name}</span> (
            {REPORT_PIN_TAB_LABEL[activePinType]}). The same pin can appear in multiple groups.
          </>
        ) : (
          'Pick a group from the table context menu first.'
        )
      }
      searchQuery={query}
      onSearchQueryChange={setQuery}
      searchPlaceholder="Search name, location, tags, coordinates…"
      searchAriaLabel="Search placemarks"
      summaryLine={summaryLine}
      matchingCount={filtered.length}
      allFilteredSelected={allFilteredSelected}
      hasSelection={selected.size > 0}
      onSelectAllMatching={selectAllMatching}
      onClearSelection={clearSelection}
      onSubmit={submit}
      onCancel={() => setAddPlacemarksModalGroupId(null)}
      submitDisabled={!group || selected.size === 0}
      submitButtonLabel={selected.size > 0 ? `Add (${selected.size})` : 'Add'}
      footerHint={
        selected.size > 0
          ? `${selected.size} placemark${selected.size !== 1 ? 's' : ''} will be linked`
          : 'Select at least one placemark'
      }
      scrollBody={scrollBody}
    />
  )
}
