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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Camera as CameraIcon, Video } from 'lucide-react'

function camGroupIds(c: { groupIds?: string[] | null }): string[] {
  return c.groupIds ?? []
}

export function AddCamerasToGroupDialog() {
  const {
    addCamerasModalGroupId,
    setAddCamerasModalGroupId,
    cameras,
    cameraGroups,
    addCamerasToParentGroup,
  } = useCameraStore()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const open = addCamerasModalGroupId !== null

  const group = useMemo(
    () => cameraGroups.find((g) => g.id === addCamerasModalGroupId) ?? null,
    [cameraGroups, addCamerasModalGroupId],
  )

  const sortedCameras = useMemo(
    () => [...cameras].sort((a, b) => a.name.localeCompare(b.name)),
    [cameras],
  )

  useEffect(() => {
    if (!open) return
    setSelected(new Set())
  }, [open, addCamerasModalGroupId])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addCamerasModalGroupId || selected.size === 0) return
    addCamerasToParentGroup(addCamerasModalGroupId, [...selected])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setAddCamerasModalGroupId(null)
      }}
    >
      <DialogContent className="max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CameraIcon className="size-5 text-primary" />
            Add cameras to group
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {group ? (
              <>
                Cameras will be listed under{' '}
                <span className="font-medium text-foreground">{group.name}</span>. A camera can
                belong to many groups; existing memberships are kept.
              </>
            ) : (
              'Pick a group from the list.'
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label className="text-accent">Cameras</Label>
            <ScrollArea className="h-[240px] rounded-md border border-border">
              <div className="space-y-0 p-2">
                {sortedCameras.map((cam) => {
                  const inThis = addCamerasModalGroupId
                    ? camGroupIds(cam).includes(addCamerasModalGroupId)
                    : false
                  return (
                    <label
                      key={cam.id}
                      className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 hover:bg-primary/5"
                    >
                      <Checkbox checked={selected.has(cam.id)} onCheckedChange={() => toggle(cam.id)} />
                      <Video className="size-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-sm text-foreground">{cam.name}</span>
                      {inThis && (
                        <span className="text-[10px] text-muted-foreground">already in group</span>
                      )}
                    </label>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAddCamerasModalGroupId(null)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!group || selected.size === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Add {selected.size > 0 ? `(${selected.size})` : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
