'use client'

import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ExplorerListTableControlsGate } from '@/components/tables/explorer-list-table-controls-gate'
import {
  Search,
  LayoutGrid,
  List,
  Camera,
  Plus,
  ChevronDown,
  FolderPlus,
} from 'lucide-react'

export function CameraToolbar() {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    setIsAddDialogOpen,
    setIsNewRootGroupModalOpen,
    getFilteredCameras,
  } = useCameraStore()

  const filteredCount = getFilteredCameras().length

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cameras..."
            className="w-64 pl-9 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filteredCount} camera{filteredCount !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {viewMode === 'table' ? <ExplorerListTableControlsGate /> : null}

        <div className="flex rounded-lg border border-border bg-muted p-1">
          <Button
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('card')}
            className={viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
          >
            <List className="size-4" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="size-4" />
              New
              <ChevronDown className="size-4 opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[12rem] border-border bg-card">
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onSelect={() => setIsAddDialogOpen(true)}
            >
              <Camera className="size-4" />
              Add Camera
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onSelect={() => setIsNewRootGroupModalOpen(true)}
            >
              <FolderPlus className="size-4" />
              New group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
