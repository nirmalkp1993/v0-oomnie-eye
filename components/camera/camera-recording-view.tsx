'use client'

import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { CAMERA_LIST_COLUMNS } from '@/lib/explorer-list-table/camera-table'
import { EnterprisePageShell } from '@/src/components/enterprise'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { CameraGroupTreeCard } from './camera-group-assign-view'
import { CameraRecordingHistoryPanel } from './camera-recording-history-panel'
import type { Camera } from '@/types/camera'

const panelShellSx = {
  height: '100%',
  minHeight: 0,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  overflow: 'hidden',
}

export function CameraRecordingView() {
  const cameraGroups = useCameraStore((s) => s.cameraGroups)
  const selectedAssignGroupId = useCameraStore((s) => s.selectedAssignGroupId)
  const setSelectedAssignGroupId = useCameraStore((s) => s.setSelectedAssignGroupId)

  const [selectedRecordingCameraId, setSelectedRecordingCameraId] = useState<string | null>(null)

  useEffect(() => {
    if (selectedAssignGroupId && cameraGroups.some((g) => g.id === selectedAssignGroupId)) return
    const roots = cameraGroups.filter((g) => (g.parentGroupIds ?? []).length === 0)
    setSelectedAssignGroupId(roots[0]?.id ?? null)
  }, [cameraGroups, selectedAssignGroupId, setSelectedAssignGroupId])

  const handleSelectRecordingCamera = (camera: Camera) => {
    setSelectedRecordingCameraId(camera.id)
  }

  return (
    <ExplorerListTableProvider
      storageKey="explorer-list-table:camera-recording-groups"
      columns={CAMERA_LIST_COLUMNS}
    >
      <EnterprisePageShell
        title="Camera Recording"
        description=""
      >
        <Box sx={{ flex: 1, minHeight: 480, minWidth: 0, display: 'flex' }}>
          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId="camera-recording-layout"
            className="flex-1 min-h-0 min-w-0"
          >
            <ResizablePanel id="recording-groups" defaultSize={28} minSize={18}>
              <Box sx={panelShellSx}>
                <CameraGroupTreeCard
                  selectedAssignGroupId={selectedAssignGroupId}
                  onSelectAssignGroup={setSelectedAssignGroupId}
                  isFullscreen={false}
                  onToggleFullscreen={() => undefined}
                  groupsSubtitle="Select a camera to view its recordings"
                  recordingSelection={{
                    selectedCameraId: selectedRecordingCameraId,
                    onSelectCamera: handleSelectRecordingCamera,
                  }}
                />
              </Box>
            </ResizablePanel>

            <ResizableHandle withHandle className="!w-1.5" />

            <ResizablePanel id="recording-history" defaultSize={72} minSize={40}>
              <Box sx={panelShellSx}>
                <CameraRecordingHistoryPanel cameraId={selectedRecordingCameraId} />
              </Box>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Box>
      </EnterprisePageShell>
    </ExplorerListTableProvider>
  )
}
