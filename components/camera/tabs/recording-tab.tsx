'use client'

import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  RefreshCw, 
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Card className="border-border bg-card lg:flex-1">
          <CardContent className="p-4">
            <CardTitle className="flex items-center gap-2 text-accent">
              <Film className="size-5" />
              Camera Recordings
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor and export historical footage snapshots.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total recordings</p>
              <p className="text-2xl font-bold text-accent">{totalRecordings}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Storage used</p>
              <p className="text-2xl font-bold text-accent">{totalStorage.toFixed(1)} GB</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by camera, schedule, date"
                className="pl-9 border-border bg-input text-foreground"
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
                  className="w-36 pl-9 border-border bg-input text-foreground text-sm"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End date"
                  className="w-36 pl-9 border-border bg-input text-foreground text-sm"
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

            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={() => setMockError(!mockError)}
              className="border-border text-muted-foreground"
            >
              Mock Error
            </Button>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Showing newest recordings first.
          </p>
        </CardContent>
      </Card>

      {/* Error State */}
      {mockError && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="size-5 text-destructive" />
            <p className="text-destructive">Failed to load recordings. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {/* Recordings Table or Empty State */}
      {filteredRecordings.length > 0 ? (
        <Card className="border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-primary">Schedule</TableHead>
                <TableHead className="text-primary">Date Range</TableHead>
                <TableHead className="text-primary">Duration</TableHead>
                <TableHead className="text-primary">Size</TableHead>
                <TableHead className="text-primary text-right">Actions</TableHead>
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
                      <Button variant="ghost" size="icon-sm" className="text-primary hover:text-primary/80">
                        <Play className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-primary hover:text-primary/80">
                        <Download className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive/80">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <HardDrive className="size-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold text-accent">No recordings found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing filters to see available recordings.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
