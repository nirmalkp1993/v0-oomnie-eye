'use client'

import {
  useReportPlacemarkStore,
} from '@/lib/report-placemark-store'
import { ExplorerListTableProvider } from '@/components/tables/explorer-list-table-context'
import { REPORT_LIST_COLUMNS } from '@/lib/explorer-list-table/report-table'
import { ReportToolbar } from '@/components/report/report-toolbar'
import { ReportListView } from '@/components/report/report-list-view'
import { ReportCardView } from '@/components/report/report-card-view'
import { ReportPinTypeTabs } from '@/components/report/report-pin-type-tabs'
import { NewReportRootGroupDialog } from '@/components/report/new-report-root-group-dialog'
import { ReportSubgroupDialog } from '@/components/report/report-subgroup-dialog'
import { AddPlacemarksToGroupDialog } from '@/components/report/add-placemarks-to-group-dialog'
import { DeleteReportGroupDialog } from '@/components/report/delete-report-group-dialog'

export function ReportManagement() {
  const activePinType = useReportPlacemarkStore((s) => s.activePinType)
  const setActivePinType = useReportPlacemarkStore((s) => s.setActivePinType)
  const viewMode = useReportPlacemarkStore((s) => s.viewMode)

  return (
    <ExplorerListTableProvider storageKey="explorer-list-table:report" columns={REPORT_LIST_COLUMNS}>
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-accent">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Organize placemarks by pin type. Data is read-only from integrations; use groups to structure
          exports and views.
        </p>
      </div>

      <ReportPinTypeTabs value={activePinType} onValueChange={setActivePinType} />

      <ReportToolbar />

      <div className="flex-1">
        {viewMode === 'card' ? <ReportCardView /> : <ReportListView />}
      </div>

      <NewReportRootGroupDialog />
      <ReportSubgroupDialog />
      <AddPlacemarksToGroupDialog />
      <DeleteReportGroupDialog />
    </div>
    </ExplorerListTableProvider>
  )
}
