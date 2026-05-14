'use client'

import { useReportPlacemarkStore } from '@/lib/report-placemark-store'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export function DeleteReportGroupDialog() {
  const {
    isDeleteGroupDialogOpen,
    setIsDeleteGroupDialogOpen,
    groupToDelete,
    deleteGroup,
  } = useReportPlacemarkStore()

  const handleDelete = () => {
    if (groupToDelete) deleteGroup(groupToDelete.id)
  }

  return (
    <AlertDialog open={isDeleteGroupDialogOpen} onOpenChange={setIsDeleteGroupDialogOpen}>
      <AlertDialogContent className="border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="size-5 text-destructive" />
            Delete group?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This removes group{' '}
            <span className="font-semibold text-foreground">{groupToDelete?.name}</span> and that
            group&apos;s placemark memberships only. Placemarks and subgroups remain elsewhere if
            they were linked to other groups; otherwise they return to the ungrouped list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteGroupDialogOpen(false)}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete group
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
