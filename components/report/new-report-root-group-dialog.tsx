'use client'

import { useEffect, useState } from 'react'
import { useReportPlacemarkStore, REPORT_PIN_TAB_LABEL } from '@/lib/report-placemark-store'
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

export function NewReportRootGroupDialog() {
  const {
    isNewRootGroupModalOpen,
    setIsNewRootGroupModalOpen,
    createRootGroup,
    activePinType,
  } = useReportPlacemarkStore()
  const [name, setName] = useState('')

  useEffect(() => {
    if (!isNewRootGroupModalOpen) return
    setName('')
  }, [isNewRootGroupModalOpen])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    createRootGroup(name)
  }

  return (
    <Dialog open={isNewRootGroupModalOpen} onOpenChange={setIsNewRootGroupModalOpen}>
      <DialogContent className="max-w-sm border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FolderPlus className="size-5 text-primary" />
            New group
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Creates an empty folder for{' '}
            <span className="font-medium text-foreground">{REPORT_PIN_TAB_LABEL[activePinType]}</span>
            . Right‑click a group to add a subgroup or assign placemarks from the catalog (API data).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="report-root-group-name" className="text-accent">
              Group name
            </Label>
            <Input
              id="report-root-group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Region North"
              required
              autoFocus
              className="border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewRootGroupModalOpen(false)}
              className="border-border"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
