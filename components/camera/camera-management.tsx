'use client'

import { Box } from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { CAMERA_LIST_COLUMNS } from '@/lib/explorer-list-table/camera-table'
import { EnterprisePageShell } from '@/src/components/enterprise'
import { CameraToolbar } from './camera-toolbar'
import { CameraCardView } from './camera-card-view'
import { CameraListView } from './camera-list-view'
import { CameraGroupAssignView } from './camera-group-assign-view'
import { CameraDetailModal } from './camera-detail-modal'
import { AddCameraDialog } from './add-camera-dialog'
import { NewRootGroupDialog } from './new-root-group-dialog'
import { SubgroupDialog } from './subgroup-dialog'
import { DeleteCameraDialog } from './delete-camera-dialog'
import { DeleteGroupDialog } from './delete-group-dialog'

import type { CameraManagementMode } from './camera-management-mode'

const MODE_CONFIG = {
  cameras: {
    title: 'Camera',
    description: '',
    storageKey: 'explorer-list-table:camera',
  },
  groups: {
    title: 'Camera Group',
    description: '',
    storageKey: 'explorer-list-table:camera-groups',
  },
} as const

interface CameraManagementProps {
  mode: CameraManagementMode
}

export function CameraManagement({ mode }: CameraManagementProps) {
  const { viewMode, selectedCamera } = useCameraStore()
  const config = MODE_CONFIG[mode]

  return (
    <>
      <ExplorerListTableProvider storageKey={config.storageKey} columns={CAMERA_LIST_COLUMNS}>
        <EnterprisePageShell title={config.title} description={config.description}>
          {mode !== 'groups' ? <CameraToolbar mode={mode} /> : null}

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {mode === 'groups' ? (
              <CameraGroupAssignView />
            ) : viewMode === 'card' ? (
              <CameraCardView mode={mode} />
            ) : (
              <CameraListView mode={mode} />
            )}
          </Box>
        </EnterprisePageShell>
      </ExplorerListTableProvider>

      {selectedCamera ? <CameraDetailModal /> : null}

      <AddCameraDialog />
      <NewRootGroupDialog />
      <SubgroupDialog />
      <DeleteCameraDialog />
      <DeleteGroupDialog />
    </>
  )
}
