'use client'

import { Box } from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { CAMERA_LIST_COLUMNS } from '@/lib/explorer-list-table/camera-table'
import { EnterprisePageShell } from '@/src/components/enterprise'
import { CameraToolbar } from './camera-toolbar'
import { CameraCardView } from './camera-card-view'
import { CameraListView } from './camera-list-view'
import { CameraDetailView } from './camera-detail-view'
import { AddCameraDialog } from './add-camera-dialog'
import { NewRootGroupDialog } from './new-root-group-dialog'
import { SubgroupDialog } from './subgroup-dialog'
import { AddCamerasToGroupDialog } from './add-cameras-to-group-dialog'
import { DeleteCameraDialog } from './delete-camera-dialog'
import { DeleteGroupDialog } from './delete-group-dialog'

export function CameraManagement() {
  const { viewMode, selectedCamera } = useCameraStore()

  return (
    <>
      {selectedCamera ? (
        <CameraDetailView />
      ) : (
        <ExplorerListTableProvider storageKey="explorer-list-table:camera" columns={CAMERA_LIST_COLUMNS}>
          <EnterprisePageShell
            title="Camera Management"
            description="Manage and monitor your surveillance cameras"
          >
            <CameraToolbar />

            <Box sx={{ flex: 1, minHeight: 0 }}>
              {viewMode === 'card' ? <CameraCardView /> : <CameraListView />}
            </Box>
          </EnterprisePageShell>
        </ExplorerListTableProvider>
      )}

      <AddCameraDialog />
      <NewRootGroupDialog />
      <SubgroupDialog />
      <AddCamerasToGroupDialog />
      <DeleteCameraDialog />
      <DeleteGroupDialog />
    </>
  )
}
