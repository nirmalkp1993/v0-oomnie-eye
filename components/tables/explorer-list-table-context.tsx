'use client'

import type { ExplorerFilterItem, ExplorerListColumnDef } from '@/lib/explorer-list-table/types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ExplorerListTableState = {
  visibility: Record<string, boolean>
  filters: ExplorerFilterItem[]
}

type ExplorerListTableContextValue = {
  columns: ExplorerListColumnDef[]
  visibility: Record<string, boolean>
  filters: ExplorerFilterItem[]
  visibleColumns: ExplorerListColumnDef[]
  isColumnVisible: (columnId: string) => boolean
  setColumnVisible: (columnId: string, visible: boolean) => void
  toggleColumnVisible: (columnId: string) => void
  resetColumns: () => void
  setFilters: (filters: ExplorerFilterItem[]) => void
  clearFilters: () => void
  filterableColumns: ExplorerListColumnDef[]
}

const ExplorerListTableContext = createContext<ExplorerListTableContextValue | null>(null)

function defaultVisibility(columns: ExplorerListColumnDef[]): Record<string, boolean> {
  const v: Record<string, boolean> = {}
  for (const col of columns) {
    v[col.id] = col.defaultVisible !== false
  }
  return v
}

function loadState(storageKey: string, columns: ExplorerListColumnDef[]): ExplorerListTableState {
  const fallback = { visibility: defaultVisibility(columns), filters: [] }
  if (typeof window === 'undefined') return fallback
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as ExplorerListTableState
    const visibility = { ...defaultVisibility(columns), ...parsed.visibility }
    for (const col of columns) {
      if (col.hideable === false) visibility[col.id] = true
    }
    return {
      visibility,
      filters: Array.isArray(parsed.filters) ? parsed.filters : [],
    }
  } catch {
    return fallback
  }
}

export function ExplorerListTableProvider({
  storageKey,
  columns,
  children,
}: {
  storageKey: string
  columns: ExplorerListColumnDef[]
  children: ReactNode
}) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
    defaultVisibility(columns)
  )
  const [filters, setFiltersState] = useState<ExplorerFilterItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const loaded = loadState(storageKey, columns)
    setVisibility(loaded.visibility)
    setFiltersState(loaded.filters)
    setHydrated(true)
  }, [storageKey, columns])

  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(storageKey, JSON.stringify({ visibility, filters }))
  }, [storageKey, visibility, filters, hydrated])

  const isColumnVisible = useCallback(
    (columnId: string) => visibility[columnId] !== false,
    [visibility]
  )

  const visibleColumns = useMemo(
    () => columns.filter((c) => isColumnVisible(c.id)),
    [columns, isColumnVisible]
  )

  const filterableColumns = useMemo(
    () => columns.filter((c) => c.filterable !== false && c.id !== 'actions'),
    [columns]
  )

  const setColumnVisible = useCallback((columnId: string, visible: boolean) => {
    const col = columns.find((c) => c.id === columnId)
    if (col?.hideable === false) return
    setVisibility((prev) => ({ ...prev, [columnId]: visible }))
  }, [columns])

  const toggleColumnVisible = useCallback((columnId: string) => {
    setVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === false,
    }))
  }, [])

  const resetColumns = useCallback(() => {
    setVisibility(defaultVisibility(columns))
  }, [columns])

  const setFilters = useCallback((next: ExplorerFilterItem[]) => {
    setFiltersState(next)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState([])
  }, [])

  const value = useMemo<ExplorerListTableContextValue>(
    () => ({
      columns,
      visibility,
      filters,
      visibleColumns,
      isColumnVisible,
      setColumnVisible,
      toggleColumnVisible,
      resetColumns,
      setFilters,
      clearFilters,
      filterableColumns,
    }),
    [
      columns,
      visibility,
      filters,
      visibleColumns,
      isColumnVisible,
      setColumnVisible,
      toggleColumnVisible,
      resetColumns,
      setFilters,
      clearFilters,
      filterableColumns,
    ]
  )

  return (
    <ExplorerListTableContext.Provider value={value}>{children}</ExplorerListTableContext.Provider>
  )
}

export function useExplorerListTable() {
  const ctx = useContext(ExplorerListTableContext)
  if (!ctx) {
    throw new Error('useExplorerListTable must be used within ExplorerListTableProvider')
  }
  return ctx
}

export function useExplorerListTableOptional() {
  return useContext(ExplorerListTableContext)
}
