'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCameraStore, collectDescendantGroupIds } from '@/lib/camera-store'
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
import { FolderPlus, Folder, Video } from 'lucide-react'
import type { CameraGroup } from '@/types/camera'

type Mode = 'new' | 'existing'

function parentFolderLabels(g: CameraGroup, all: CameraGroup[]): string {
  const ids = g.parentGroupIds ?? []
  if (ids.length === 0) return 'Root'
  return ids
    .map((id) => all.find((x) => x.id === id)?.name ?? id)
    .join(', ')
}

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
  const [selectedCameraIds, setSelectedCameraIds] = useState<Set<string>>(new Set())
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set())

  const sortedCameras = useMemo(
    () => [...cameras].sort((a, b) => a.name.localeCompare(b.name)),
    [cameras],
  )

  const sortedGroupsForPicker = useMemo(
    () => [...cameraGroups].sort((a, b) => a.name.localeCompare(b.name)),
    [cameraGroups],
  )

  const groupDisabledAsNested = useMemo(() => {
    if (mode !== 'existing' || !existingGroupId) return () => false
    return (groupId: string) => {
      if (groupId === existingGroupId) return true
      return collectDescendantGroupIds(groupId, cameraGroups).has(existingGroupId)
    }
  }, [mode, existingGroupId, cameraGroups])

  useEffect(() => {
    if (!isCreateGroupDialogOpen) return
    setMode('new')
    setGroupName('')
    setExistingGroupId(cameraGroups[0]?.id ?? '')
    setSelectedCameraIds(new Set())
    setSelectedGroupIds(new Set())
  }, [isCreateGroupDialogOpen, cameraGroups])

  useEffect(() => {
    if (mode !== 'existing' || !existingGroupId) return
    setSelectedGroupIds((prev) => {
      const next = new Set<string>()
      for (const id of prev) {
        if (id === existingGroupId) continue
        if (collectDescendantGroupIds(id, cameraGroups).has(existingGroupId)) continue
        next.add(id)
      }
      return next
    })
  }, [mode, existingGroupId, cameraGroups])

  const toggleCamera = (id: string) => {
    setSelectedCameraIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleGroup = (id: string) => {
    if (mode === 'existing' && groupDisabledAsNested(id)) return
    setSelectedGroupIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectionCount = selectedCameraIds.size + selectedGroupIds.size

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectionCount === 0) return
    const camIds = [...selectedCameraIds]
    const grpIds =
      mode === 'existing'
        ? [...selectedGroupIds].filter((id) => !groupDisabledAsNested(id))
        : [...selectedGroupIds]
    if (mode === 'new') {
      createGroupWithCameras(groupName, camIds, grpIds)
    } else if (existingGroupId) {
      addCamerasToGroup(existingGroupId, camIds, grpIds)
    }
  }

  const canSubmitNew = mode === 'new' && groupName.trim().length > 0 && selectionCount > 0
  const canSubmitExisting =
    mode === 'existing' && !!existingGroupId && selectionCount > 0
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
            Pick cameras and/or groups. Membership is additive: items stay in their current groups
            and are also added to the new or chosen group. Selected groups additionally nest under
            that target (they can have multiple parents).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup
            value={mode}
            onValueChange={(v) => setMode(v as Mode)}
            className="grid gap-3"
          >
            <div className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex shrink-0 items-center pt-0.5">
                <RadioGroupItem value="new" id="mode-new" aria-label="New group" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
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
            <div className="flex gap-3 rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex shrink-0 items-center pt-0.5">
                <RadioGroupItem value="existing" id="mode-existing" aria-label="Add to existing group" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
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
            <Label className="text-accent">Groups</Label>
            <ScrollArea className="h-[140px] rounded-md border border-border">
              <div className="space-y-0 p-2">
                {sortedGroupsForPicker.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-muted-foreground">No groups yet</p>
                ) : (
                  sortedGroupsForPicker.map((g) => {
                    const disabled = mode === 'existing' && groupDisabledAsNested(g.id)
                    const checked = selectedGroupIds.has(g.id)
                    return (
                      <label
                        key={g.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 hover:bg-primary/5 ${disabled ? 'pointer-events-none opacity-40' : ''}`}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={() => toggleGroup(g.id)}
                        />
                        <Folder className="size-4 shrink-0 text-primary" />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-sm text-foreground">{g.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            Under: {parentFolderLabels(g, cameraGroups)}
                          </span>
                        </div>
                        {disabled && mode === 'existing' && (
                          <span className="shrink-0 text-xs text-muted-foreground">cannot nest here</span>
                        )}
                      </label>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label className="text-accent">Cameras</Label>
            <ScrollArea className="h-[160px] rounded-md border border-border">
              <div className="space-y-0 p-2">
                {sortedCameras.map((cam) => {
                  const names = (cam.groupIds ?? [])
                    .map((id) => cameraGroups.find((x) => x.id === id)?.name)
                    .filter(Boolean)
                  const label = names.length ? names.join(', ') : null
                  return (
                    <label
                      key={cam.id}
                      className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 hover:bg-primary/5"
                    >
                      <Checkbox
                        checked={selectedCameraIds.has(cam.id)}
                        onCheckedChange={() => toggleCamera(cam.id)}
                      />
                      <Video className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-sm text-foreground">{cam.name}</span>
                      {label && (
                        <span className="max-w-[140px] truncate text-xs text-muted-foreground" title={label}>
                          In: {label}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              Select at least one camera and/or group. Nothing is removed from existing groups;
              the target group is added as another parent or another membership.
            </p>
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
