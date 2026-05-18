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
import { FolderPlus } from 'lucide-react'

export function SubgroupDialog() {
  const {
    subgroupModalParentId,
    setSubgroupModalParentId,
    cameraGroups,
    createSubgroupUnder,
  } = useCameraStore()

  const [name, setName] = useState('')
  const open = subgroupModalParentId !== null

  const parent = useMemo(
    () => cameraGroups.find((g) => g.id === subgroupModalParentId) ?? null,
    [cameraGroups, subgroupModalParentId],
  )

  useEffect(() => {
    if (!open) return
    setName('')
  }, [open, subgroupModalParentId])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subgroupModalParentId) return
    createSubgroupUnder(subgroupModalParentId, name)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setSubgroupModalParentId(null)
      }}
    >
      <DialogContent className="max-w-sm border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FolderPlus className="size-5 text-primary" />
            New subgroup
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {parent ? (
              <>
                Parent: <span className="font-medium text-foreground">{parent.name}</span>
              </>
            ) : (
              'Select a parent from the list.'
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="subgroup-name" className="text-accent">
              Subgroup name
            </Label>
            <Input
              id="subgroup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Floor 2"
              required
              autoFocus
              disabled={!parent}
              className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubgroupModalParentId(null)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!parent}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
