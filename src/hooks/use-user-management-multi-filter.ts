'use client'

import type { GridApi } from '@mui/x-data-grid'
import type { MultiFilterColumn } from '@/components/tables/multi-filter-popover'
import { countActiveExplorerFilters } from '@/lib/explorer-list-table/filter-utils'
import { explorerFiltersToGridFilterModel } from '@/lib/explorer-list-table/mui-filter-bridge'
import type { ExplorerFilterItem } from '@/lib/explorer-list-table/types'
import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'

function loadFilters(storageKey: string): ExplorerFilterItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ExplorerFilterItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useUserManagementMultiFilter(
  apiRef: MutableRefObject<GridApi | null>,
  storageKey: string,
  filterableColumns: MultiFilterColumn[]
) {
  const [ready, setReady] = useState(false)
  const [filters, setFiltersState] = useState<ExplorerFilterItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  const applyToGrid = useCallback(
    (nextFilters: ExplorerFilterItem[]) => {
      const api = apiRef.current
      if (!api) return
      api.setFilterModel(explorerFiltersToGridFilterModel(nextFilters))
    },
    [apiRef]
  )

  const setFilters = useCallback(
    (next: ExplorerFilterItem[]) => {
      setFiltersState(next)
      applyToGrid(next)
    },
    [applyToGrid]
  )

  const clearFilters = useCallback(() => {
    setFilters([])
  }, [setFilters])

  useEffect(() => {
    setFiltersState(loadFilters(storageKey))
    setHydrated(true)
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(storageKey, JSON.stringify(filters))
  }, [storageKey, filters, hydrated])

  useEffect(() => {
    const tryReady = () => {
      const api = apiRef.current
      if (!api) return false
      setReady(true)
      return true
    }

    if (tryReady()) return undefined

    const timer = window.setInterval(() => {
      if (tryReady()) window.clearInterval(timer)
    }, 100)
    return () => window.clearInterval(timer)
  }, [apiRef])

  useEffect(() => {
    if (!ready || !hydrated) return
    applyToGrid(filters)
  }, [ready, hydrated, filters, applyToGrid])

  const activeFilterCount = countActiveExplorerFilters(filters)

  return {
    ready,
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
    filterableColumns,
  }
}
