'use client'

import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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

export function ScheduleTab() {
  const { selectedCamera, getCameraSchedules, addSchedule, updateSchedule, deleteSchedule } = useCameraStore()
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    days: [] as string[],
    enabled: true,
  })

  if (!selectedCamera) return null

  const schedules = getCameraSchedules(selectedCamera.id)

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
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

    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      days: [],
      enabled: true,
    })
  }

  return (
    <div className="space-y-6">
      {/* Add Schedule Form */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-4">
          {/* Schedule Name */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Schedule name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter schedule name"
              className="border-border bg-input text-foreground focus:border-primary"
            />
          </div>

          {/* Date Range */}
          <div className="grid gap-4 sm:grid-cols-2">
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

          {/* Time Range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-accent">
                <span className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Start Time
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
              <Label className="text-accent">End Time</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="border-border bg-input text-foreground focus:border-primary"
                />
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                />
              </div>
            </div>
          </div>

          {/* Days Selection */}
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

          <div className="flex justify-end">
            <Button
              onClick={handleAddSchedule}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              <Plus className="mr-2 size-4" />
              Add Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedules List */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="bg-muted/50 border-b border-border">
          <CardTitle className="text-primary">Schedule</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
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
                <TableCell className="font-medium text-foreground">
                  {schedule.name}
                </TableCell>
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
                  <br />
                  - {schedule.endDate}
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
            {schedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No schedules configured. Add a schedule above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
