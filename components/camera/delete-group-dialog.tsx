'use client'

import { AlertTriangle } from 'lucide-react'
import { useCameraStore } from '@/lib/camera-store'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'

export function DeleteGroupDialog() {
  const { isDeleteGroupDialogOpen, setIsDeleteGroupDialogOpen, groupToDelete, deleteGroup } =
    useCameraStore()

  return (
    <ConfirmDialog
      open={isDeleteGroupDialogOpen}
      title="Delete group?"
      description={
        groupToDelete
          ? `This deletes group ${groupToDelete.name} and removes only that group's memberships. Cameras and subgroups can still appear elsewhere if they belonged to other groups too; otherwise they move to the root list.`
          : 'This action cannot be undone.'
      }
      confirmLabel="Delete group"
      cancelLabel="Cancel"
      destructive
      icon={AlertTriangle}
      onClose={() => setIsDeleteGroupDialogOpen(false)}
      onConfirm={() => {
        if (groupToDelete) deleteGroup(groupToDelete.id)
      }}
    />
  )
}
