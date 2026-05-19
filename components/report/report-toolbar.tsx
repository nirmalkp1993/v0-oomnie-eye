'use client'

import FolderPlusOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined'
import { Button } from '@mui/material'
import { useReportPlacemarkStore } from '@/lib/report-placemark-store'
import { EnterpriseExplorerToolbar } from '@/src/components/enterprise'

export function ReportToolbar() {
  const placemarks = useReportPlacemarkStore((s) => s.placemarks)
  const activePinType = useReportPlacemarkStore((s) => s.activePinType)
  const searchQuery = useReportPlacemarkStore((s) => s.searchQuery)
  const setSearchQuery = useReportPlacemarkStore((s) => s.setSearchQuery)
  const setIsNewRootGroupModalOpen = useReportPlacemarkStore((s) => s.setIsNewRootGroupModalOpen)
  const viewMode = useReportPlacemarkStore((s) => s.viewMode)
  const setViewMode = useReportPlacemarkStore((s) => s.setViewMode)

  const typeCount = placemarks.filter((p) => p.pinType === activePinType).length

  return (
    <EnterpriseExplorerToolbar
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search placemarks..."
      resultCount={typeCount}
      resultLabel="placemark"
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      trailingActions={
        <Button
          variant="outlined"
          startIcon={<FolderPlusOutlinedIcon />}
          onClick={() => setIsNewRootGroupModalOpen(true)}
        >
          New group
        </Button>
      }
    />
  )
}
