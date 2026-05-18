'use client'

import { useReportPlacemarkStore } from '@/lib/report-placemark-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExplorerListTableControlsGate } from '@/components/tables/explorer-list-table-controls-gate'
import {
  Search,
  LayoutGrid,
  List,
  FolderPlus,
} from 'lucide-react'

export function ReportToolbar() {
  const placemarks = useReportPlacemarkStore((s) => s.placemarks)
  const activePinType = useReportPlacemarkStore((s) => s.activePinType)
  const searchQuery = useReportPlacemarkStore((s) => s.searchQuery)
  const setSearchQuery = useReportPlacemarkStore((s) => s.setSearchQuery)
  const setIsNewRootGroupModalOpen = useReportPlacemarkStore((s) => s.setIsNewRootGroupModalOpen)
  const viewMode = useReportPlacemarkStore((s) => s.viewMode)
  const setViewMode = useReportPlacemarkStore((s) => s.setViewMode)

  const typeCount = placemarks.filter((p) => p.pinType === activePinType).length

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search placemarks..."
            className="w-64 pl-9 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {typeCount} placemark{typeCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {viewMode === 'table' ? <ExplorerListTableControlsGate /> : null}

        <div className="flex rounded-lg border border-border bg-muted p-1">
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('card')}
            className={
              viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('table')}
            className={
              viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }
          >
            <List className="size-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2 border-border"
          onClick={() => setIsNewRootGroupModalOpen(true)}
        >
          <FolderPlus className="size-4" />
          New group
        </Button>
      </div>
    </div>
  )
}
