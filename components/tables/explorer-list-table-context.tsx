'use client'

import type {
  ExplorerFilterItem,
  ExplorerListColumnDef,
  ExplorerSortState,
} from '@/lib/explorer-list-table/types'
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
  columnOrder: string[]
  filters: ExplorerFilterItem[]
  sort: ExplorerSortState
}

type ExplorerListTableContextValue = {
  columns: ExplorerListColumnDef[]
  visibility: Record<string, boolean>
  columnOrder: string[]
  filters: ExplorerFilterItem[]
  sort: ExplorerSortState
  visibleColumns: ExplorerListColumnDef[]
  isColumnVisible: (columnId: string) => boolean
  setColumnVisible: (columnId: string, visible: boolean) => void
  toggleColumnVisible: (columnId: string) => void
  resetColumns: () => void
  reorderColumns: (nextVisibleOrder: string[]) => void
  setFilters: (filters: ExplorerFilterItem[]) => void
  clearFilters: () => void
  toggleSort: (columnId: string) => void
  filterableColumns: ExplorerListColumnDef[]
}

const ExplorerListTableContext = createContext<ExplorerListTableContextValue | null>(null)

function defaultColumnOrder(columns: ExplorerListColumnDef[]): string[] {
  return columns.map((c) => c.id)
}

function defaultVisibility(columns: ExplorerListColumnDef[]): Record<string, boolean> {
  const v: Record<string, boolean> = {}
  for (const col of columns) {
    v[col.id] = col.defaultVisible !== false
  }
  return v
}

function loadState(storageKey: string, columns: ExplorerListColumnDef[]): ExplorerListTableState {
  const fallback: ExplorerListTableState = {
    visibility: defaultVisibility(columns),
    columnOrder: defaultColumnOrder(columns),
    filters: [],
    sort: null,
  }
  if (typeof window === 'undefined') return fallback
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<ExplorerListTableState>
    const visibility = { ...defaultVisibility(columns), ...parsed.visibility }
    for (const col of columns) {
      if (col.hideable === false) visibility[col.id] = true
    }
    const defaultOrder = defaultColumnOrder(columns)
    const columnOrder = Array.isArray(parsed.columnOrder)
      ? [
          ...parsed.columnOrder.filter((id) => columns.some((c) => c.id === id)),
          ...defaultOrder.filter((id) => !parsed.columnOrder!.includes(id)),
        ]
      : defaultOrder
    return {
      visibility,
      columnOrder,
      filters: Array.isArray(parsed.filters) ? parsed.filters : [],
      sort:
        parsed.sort &&
        typeof parsed.sort === 'object' &&
        parsed.sort.columnId &&
        (parsed.sort.direction === 'asc' || parsed.sort.direction === 'desc')
          ? parsed.sort
          : null,
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
  const [columnOrder, setColumnOrder] = useState<string[]>(() => defaultColumnOrder(columns))
  const [filters, setFiltersState] = useState<ExplorerFilterItem[]>([])
  const [sort, setSort] = useState<ExplorerSortState>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const loaded = loadState(storageKey, columns)
    setVisibility(loaded.visibility)
    setColumnOrder(loaded.columnOrder)
    setFiltersState(loaded.filters)
    setSort(loaded.sort)
    setHydrated(true)
  }, [storageKey, columns])

  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ visibility, columnOrder, filters, sort })
    )
  }, [storageKey, visibility, columnOrder, filters, sort, hydrated])

  const isColumnVisible = useCallback(
    (columnId: string) => visibility[columnId] !== false,
    [visibility]
  )

  const visibleColumns = useMemo(() => {
    const byId = new Map(columns.map((c) => [c.id, c]))
    return columnOrder
      .map((id) => byId.get(id))
      .filter((c): c is ExplorerListColumnDef => !!c && isColumnVisible(c.id))
  }, [columns, columnOrder, isColumnVisible])

  const filterableColumns = useMemo(
    () => columns.filter((c) => c.filterable !== false && c.id !== 'actions'),
    [columns]
  )

  const setColumnVisible = useCallback(
    (columnId: string, visible: boolean) => {
      const col = columns.find((c) => c.id === columnId)
      if (col?.hideable === false) return
      setVisibility((prev) => ({ ...prev, [columnId]: visible }))
    },
    [columns]
  )

  const toggleColumnVisible = useCallback((columnId: string) => {
    setVisibility((prev) => ({
      ...prev,
      [columnId]: prev[columnId] === false,
    }))
  }, [])

  const resetColumns = useCallback(() => {
    setVisibility(defaultVisibility(columns))
    setColumnOrder(defaultColumnOrder(columns))
    setSort(null)
  }, [columns])

  const reorderColumns = useCallback((nextVisibleOrder: string[]) => {
    const visibleSet = new Set(nextVisibleOrder)
    setColumnOrder((prev) => {
      let v = 0
      return prev.map((id) => (visibleSet.has(id) ? nextVisibleOrder[v++]! : id))
    })
  }, [])

  const setFilters = useCallback((next: ExplorerFilterItem[]) => {
    setFiltersState(next)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState([])
  }, [])

  const toggleSort = useCallback((columnId: string) => {
    setSort((prev) => {
      if (prev?.columnId !== columnId) return { columnId, direction: 'asc' }
      if (prev.direction === 'asc') return { columnId, direction: 'desc' }
      return null
    })
  }, [])

  const value = useMemo<ExplorerListTableContextValue>(
    () => ({
      columns,
      visibility,
      columnOrder,
      filters,
      sort,
      visibleColumns,
      isColumnVisible,
      setColumnVisible,
      toggleColumnVisible,
      resetColumns,
      reorderColumns,
      setFilters,
      clearFilters,
      toggleSort,
      filterableColumns,
    }),
    [
      columns,
      visibility,
      columnOrder,
      filters,
      sort,
      visibleColumns,
      isColumnVisible,
      setColumnVisible,
      toggleColumnVisible,
      resetColumns,
      reorderColumns,
      setFilters,
      clearFilters,
      toggleSort,
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
