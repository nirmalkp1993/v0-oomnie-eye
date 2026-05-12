'use client'

import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, LayoutGrid, List, Camera, Plus } from 'lucide-react'

export function CameraToolbar() {
  const { 
    viewMode, 
    setViewMode, 
    searchQuery, 
    setSearchQuery, 
    setIsAddDialogOpen,
    getFilteredCameras
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

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="border-border text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="size-4" />
        </Button>
        
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

        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Camera className="size-4" />
          <Plus className="size-4" />
          Add Camera
        </Button>
      </div>
    </div>
  )
}
