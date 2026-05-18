'use client'

import type { GridApi } from '@mui/x-data-grid'
import { GridPreferencePanelsValue } from '@mui/x-data-grid/hooks/features/preferencesPanel/gridPreferencePanelsValue'
import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'

type PanelIds = {
  columnsButtonId: string
  columnsPanelId: string
}

export function useUserManagementDataGridControls(
  apiRef: MutableRefObject<GridApi | null>,
  panelIds: PanelIds
) {
  const [ready, setReady] = useState(false)
  const [columnsPanelOpen, setColumnsPanelOpen] = useState(false)

  const syncFromApi = useCallback(() => {
    const api = apiRef.current
    if (!api) return false
    setReady(true)
    const panel = api.state.preferencePanel
    setColumnsPanelOpen(panel.open && panel.openedPanelValue === GridPreferencePanelsValue.columns)
    return true
  }, [apiRef])

  useEffect(() => {
    if (syncFromApi()) return undefined
    const timer = window.setInterval(() => {
      if (syncFromApi()) window.clearInterval(timer)
    }, 100)
    return () => window.clearInterval(timer)
  }, [syncFromApi])

  useEffect(() => {
    const api = apiRef.current
    if (!api || !ready) return undefined

    const unsubPanelClose = api.subscribeEvent('preferencePanelClose', syncFromApi)
    const unsubPanelOpen = api.subscribeEvent('preferencePanelOpen', syncFromApi)

    return () => {
      unsubPanelClose()
      unsubPanelOpen()
    }
  }, [apiRef, ready, syncFromApi])

  const toggleColumnsPanel = useCallback(() => {
    const api = apiRef.current
    if (!api) return
    const panel = api.state.preferencePanel
    if (panel.open && panel.openedPanelValue === GridPreferencePanelsValue.columns) {
      api.hidePreferences()
    } else {
      api.showPreferences(GridPreferencePanelsValue.columns, panelIds.columnsPanelId, panelIds.columnsButtonId)
    }
    syncFromApi()
  }, [apiRef, panelIds.columnsButtonId, panelIds.columnsPanelId, syncFromApi])

  return {
    ready,
    columnsPanelOpen,
    toggleColumnsPanel,
  }
}
