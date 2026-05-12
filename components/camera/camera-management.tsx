'use client'

import { useCameraStore } from '@/lib/camera-store'
import { CameraToolbar } from './camera-toolbar'
import { CameraCardView } from './camera-card-view'
import { CameraListView } from './camera-list-view'
import { CameraDetailView } from './camera-detail-view'
import { AddCameraDialog } from './add-camera-dialog'
import { DeleteCameraDialog } from './delete-camera-dialog'

export function CameraManagement() {
  const { viewMode, selectedCamera } = useCameraStore()

  return (
    <>
      {selectedCamera ? (
        <CameraDetailView />
      ) : (
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-bold text-accent">Camera Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage and monitor your surveillance cameras
            </p>
          </div>
          
          <CameraToolbar />
          
          <div className="flex-1">
            {viewMode === 'card' ? <CameraCardView /> : <CameraListView />}
          </div>
        </div>
      )}

      <AddCameraDialog />
      <DeleteCameraDialog />
    </>
  )
}
