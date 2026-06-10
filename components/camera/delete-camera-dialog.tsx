'use client'

import { AlertTriangle } from 'lucide-react'
import { useCameraStore } from '@/lib/camera-store'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'

export function DeleteCameraDialog() {
  const { isDeleteDialogOpen, setIsDeleteDialogOpen, cameraToDelete, deleteCamera } = useCameraStore()

  return (
    <ConfirmDialog
      open={isDeleteDialogOpen}
      title="Are you sure to delete?"
      description={
        cameraToDelete
          ? `This will permanently delete camera ${cameraToDelete.name}. This action cannot be undone.`
          : 'This action cannot be undone.'
      }
      confirmLabel="Yes"
      cancelLabel="No"
      destructive
      icon={AlertTriangle}
      onClose={() => setIsDeleteDialogOpen(false)}
      onConfirm={() => {
        if (cameraToDelete) deleteCamera(cameraToDelete.id)
      }}
    />
  )
}
