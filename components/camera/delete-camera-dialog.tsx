'use client'

import { useCameraStore } from '@/lib/camera-store'
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

export function DeleteCameraDialog() {
  const { 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen, 
    cameraToDelete, 
    deleteCamera 
  } = useCameraStore()

  const handleDelete = () => {
    if (cameraToDelete) {
      deleteCamera(cameraToDelete.id)
    }
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent className="border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="size-5 text-destructive" />
            Are you sure to delete?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will permanently delete camera{' '}
            <span className="font-semibold text-foreground">{cameraToDelete?.name}</span>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            No
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Yes
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
