'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FolderPlus } from 'lucide-react'

type Mode = 'new' | 'existing'

export function CreateGroupDialog() {
  const {
    isCreateGroupDialogOpen,
    setIsCreateGroupDialogOpen,
    cameras,
    cameraGroups,
    createGroupWithCameras,
    addCamerasToGroup,
  } = useCameraStore()

  const [mode, setMode] = useState<Mode>('new')
  const [groupName, setGroupName] = useState('')
  const [existingGroupId, setExistingGroupId] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const sortedCameras = useMemo(
    () => [...cameras].sort((a, b) => a.name.localeCompare(b.name)),
    [cameras],
  )

  useEffect(() => {
    if (!isCreateGroupDialogOpen) return
    setMode('new')
    setGroupName('')
    setExistingGroupId(cameraGroups[0]?.id ?? '')
    setSelectedIds(new Set())
  }, [isCreateGroupDialogOpen, cameraGroups])

  const toggleCamera = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ids = [...selectedIds]
    if (ids.length === 0) return
    if (mode === 'new') {
      createGroupWithCameras(groupName, ids)
    } else if (existingGroupId) {
      addCamerasToGroup(existingGroupId, ids)
    }
  }

  const canSubmitNew = mode === 'new' && groupName.trim().length > 0 && selectedIds.size > 0
  const canSubmitExisting =
    mode === 'existing' && !!existingGroupId && selectedIds.size > 0
  const canSubmit = canSubmitNew || canSubmitExisting

  return (
    <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
      <DialogContent className="max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FolderPlus className="size-5 text-primary" />
            Create group
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new group from selected cameras, or move cameras into an existing group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as Mode)}
            className="grid gap-3"
          >
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <RadioGroupItem value="new" id="mode-new" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="mode-new" className="cursor-pointer font-medium text-foreground">
                  New group
                </Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name"
                  disabled={mode !== 'new'}
                  className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border p-3">
              <RadioGroupItem value="existing" id="mode-existing" className="mt-1" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="mode-existing" className="cursor-pointer font-medium text-foreground">
                  Add to existing group
                </Label>
                <Select
                  value={existingGroupId}
                  onValueChange={setExistingGroupId}
                  disabled={mode !== 'existing' || cameraGroups.length === 0}
                >
                  <SelectTrigger className="border-border bg-input text-foreground">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card">
                    {cameraGroups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {cameraGroups.length === 0 && mode === 'existing' && (
                  <p className="text-xs text-muted-foreground">Create a group first using &quot;New group&quot;.</p>
                )}
              </div>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label className="text-accent">Cameras</Label>
            <ScrollArea className="h-[220px] rounded-md border border-border">
              <div className="space-y-0 p-2">
                {sortedCameras.map((cam) => {
                  const group = cam.groupId
                    ? cameraGroups.find((g) => g.id === cam.groupId)
                    : null
                  return (
                    <label
                      key={cam.id}
                      className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 hover:bg-primary/5"
                    >
                      <Checkbox
                        checked={selectedIds.has(cam.id)}
                        onCheckedChange={() => toggleCamera(cam.id)}
                      />
                      <span className="flex-1 text-sm text-foreground">{cam.name}</span>
                      {group && (
                        <span className="text-xs text-muted-foreground">In: {group.name}</span>
                      )}
                    </label>
                  )
                })}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">Select one or more cameras to include.</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateGroupDialogOpen(false)}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
