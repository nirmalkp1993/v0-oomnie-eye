'use client'

import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Calendar, 
  AlertCircle,
  HardDrive,
  Film,
  Download,
  Play,
  Trash2
} from 'lucide-react'

export function RecordingTab() {
  const { selectedCamera, getCameraRecordings } = useCameraStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [schedule, setSchedule] = useState('')
  const [mockError, setMockError] = useState(false)

  if (!selectedCamera) return null

  const recordings = getCameraRecordings(selectedCamera.id)
  const filteredRecordings = recordings.filter((r) => {
    if (searchQuery && !r.scheduleName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  const totalRecordings = filteredRecordings.length
  const totalStorage = filteredRecordings.reduce((acc, r) => {
    const size = parseFloat(r.fileSize)
    return acc + (isNaN(size) ? 0 : size)
  }, 0)

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border bg-primary/5 p-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Film className="size-5" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-accent">Camera Recordings</h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Monitor and export historical footage snapshots.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-6 lg:pt-0.5">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total recordings</p>
            <p className="text-2xl font-bold text-accent">{totalRecordings}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Storage used</p>
            <p className="text-2xl font-bold text-accent">{totalStorage.toFixed(1)} GB</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by camera, schedule, date"
              className="border-border bg-input pl-9 text-foreground focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start date"
                className="w-36 border-border bg-input pl-9 text-sm text-foreground focus:border-primary"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End date"
                className="w-36 border-border bg-input pl-9 text-sm text-foreground focus:border-primary"
              />
            </div>
          </div>

          <Select value={schedule} onValueChange={setSchedule}>
            <SelectTrigger className="w-32 border-border bg-input text-foreground">
              <SelectValue placeholder="Schedule" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="test">Test Recording</SelectItem>
              <SelectItem value="night">Night Watch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error State */}
      {mockError && (
        <div className="border-b border-destructive/50 bg-destructive/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-destructive" />
            <p className="text-destructive">Failed to load recordings. Please try again.</p>
          </div>
        </div>
      )}

      {/* Recordings Table or Empty State */}
      <div className="p-5">
        {filteredRecordings.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border bg-muted/40 hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Schedule</TableHead>
                  <TableHead className="font-semibold text-foreground">Date Range</TableHead>
                  <TableHead className="font-semibold text-foreground">Duration</TableHead>
                  <TableHead className="font-semibold text-foreground">Size</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecordings.map((recording) => (
                  <TableRow key={recording.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {recording.scheduleName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {recording.startDate} - {recording.endDate}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {recording.duration}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {recording.fileSize}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Play className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <HardDrive className="size-7" />
            </div>
            <p className="text-base font-semibold text-foreground">No recordings found</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Try changing filters to see available recordings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
