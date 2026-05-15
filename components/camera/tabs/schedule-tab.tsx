'use client'

import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar, Clock, Plus, Edit2, Trash2 } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const initialForm = {
  name: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  days: [] as string[],
  enabled: true,
}

export function ScheduleTab() {
  const { selectedCamera, getCameraSchedules, addSchedule, updateSchedule, deleteSchedule } =
    useCameraStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formData, setFormData] = useState(initialForm)

  if (!selectedCamera) return null

  const schedules = getCameraSchedules(selectedCamera.id)

  const resetForm = () => setFormData(initialForm)

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d) => d !== day) : [...prev.days, day],
    }))
  }

  const handleAddSchedule = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return

    addSchedule({
      cameraId: selectedCamera.id,
      name: formData.name,
      days: formData.days,
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      enabled: formData.enabled,
    })

    resetForm()
    setDrawerOpen(false)
  }

  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open)
    if (!open) resetForm()
  }

  const addScheduleButton = (
    <Button
      type="button"
      onClick={() => setDrawerOpen(true)}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      <Plus className="mr-2 size-4" />
      Add schedule
    </Button>
  )

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border bg-primary/5 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Clock className="size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-accent">Recording schedule</h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Define when this camera should record the stream. Schedules are stored locally in mock
              mode.
            </p>
          </div>
        </div>
        <div className="shrink-0 sm:pt-0.5">{addScheduleButton}</div>
      </div>

      {/* Schedules section */}
      <div className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Schedules</h3>

        {schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Calendar className="size-7" />
            </div>
            <p className="text-base font-semibold text-foreground">No schedules for this camera yet.</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Create a schedule to define when this camera should record.
            </p>
            <div className="mt-6">{addScheduleButton}</div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent bg-muted/40">
                  <TableHead className="text-foreground font-semibold">Schedule name</TableHead>
                  <TableHead className="text-foreground font-semibold">Days</TableHead>
                  <TableHead className="text-foreground font-semibold">Dates</TableHead>
                  <TableHead className="text-foreground font-semibold">Time</TableHead>
                  <TableHead className="text-foreground font-semibold">Enabled</TableHead>
                  <TableHead className="text-foreground font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{schedule.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {schedule.days.map((day) => (
                          <Badge
                            key={day}
                            variant="secondary"
                            className="bg-primary/20 text-primary text-xs"
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {schedule.startDate}
                      <br />— {schedule.endDate}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border text-muted-foreground">
                        {schedule.startTime} to {schedule.endTime}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          schedule.enabled
                            ? 'bg-success text-success-foreground'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {schedule.enabled ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateSchedule(schedule.id, { enabled: !schedule.enabled })}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="mr-1 size-4" />
                          edit
                        </Button>
                        <span className="text-muted-foreground">/</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="mr-1 size-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Drawer direction="right" open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
        <DrawerContent className="h-full max-h-screen gap-0 border-l bg-background sm:max-w-md">
          <DrawerHeader className="border-b border-border text-left">
            <DrawerTitle>Add schedule</DrawerTitle>
            <DrawerDescription>
              Set name, dates, times, and days for this camera&apos;s recording window.
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Schedule name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter schedule name"
                  className="border-border bg-input text-foreground focus:border-primary"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <div className="space-y-2">
                  <Label className="text-accent">
                    <span className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      Start date
                    </span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="border-border bg-input text-foreground focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-accent">End date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="border-border bg-input text-foreground focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <div className="space-y-2">
                  <Label className="text-accent">
                    <span className="flex items-center gap-2">
                      <Clock className="size-4" />
                      Start time
                    </span>
                  </Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="border-border bg-input text-foreground focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-accent">End time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="border-border bg-input text-foreground focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Label htmlFor="schedule-enabled" className="text-sm font-medium text-foreground">
                  Schedule enabled
                </Label>
                <Switch
                  id="schedule-enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-accent">Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={formData.days.includes(day) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day)}
                      className={
                        formData.days.includes(day)
                          ? 'bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t border-border sm:flex-row sm:justify-end">
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
            <Button
              type="button"
              onClick={handleAddSchedule}
              disabled={!formData.name || !formData.startDate || !formData.endDate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 size-4" />
              Save schedule
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
