'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import { useOfficeTerritoryAssignmentStore } from '@/lib/office-territory-assignment-store'
import { useOfficeTerritoryPageStore } from '@/lib/office-territory-page-store'
import { useTerritoryStore } from '@/lib/territory-store'
import { ConfirmDialog } from '@/src/components/modals/confirm-dialog'
import { CreateOfficeDialog } from '@/src/components/user-management/offices/create-office-dialog'
import {
  CreateTerritoryDialog,
  type TerritoryFormMode,
} from '@/src/components/user-management/offices/create-territory-dialog'
import { OfficeTerritoryHierarchyView } from '@/src/components/user-management/offices/office-territory-hierarchy-view'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { collectSubtreeTerritoryIds } from '@/src/lib/user-management/territory-tree-page.utils'
import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

export function OfficesPage() {
  const { showMessage } = useAdminSnackbar()
  const tree = useTerritoryStore((state) => state.tree)
  const removeTerritory = useTerritoryStore((state) => state.remove)
  const assignments = useOfficeTerritoryAssignmentStore((state) => state.assignments)
  const setSelectedTerritoryId = useOfficeTerritoryPageStore((state) => state.setSelectedTerritoryId)

  const [loading, setLoading] = useState(true)
  const [territoryModalOpen, setTerritoryModalOpen] = useState(false)
  const [territoryFormMode, setTerritoryFormMode] = useState<TerritoryFormMode | null>(null)
  const [officeModalOpen, setOfficeModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<HierarchyTreeNode | null>(null)

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const assignedOfficeCountInSubtree = useMemo(() => {
    if (!confirmDelete) return 0
    const subtreeIds = new Set(collectSubtreeTerritoryIds(tree, confirmDelete.id))
    return Object.entries(assignments).filter(([, territoryId]) => subtreeIds.has(territoryId))
      .length
  }, [assignments, confirmDelete, tree])

  const handleTerritoryModalClose = () => {
    setTerritoryModalOpen(false)
    setTerritoryFormMode(null)
  }

  const handleOpenCreateRoot = useCallback(() => {
    setTerritoryFormMode({ type: 'add-root' })
    setTerritoryModalOpen(true)
  }, [])

  const handleCreateChild = useCallback((parentId: string) => {
    setTerritoryFormMode({ type: 'add-child', parentId })
    setTerritoryModalOpen(true)
  }, [])

  const handleEditTerritory = useCallback((node: HierarchyTreeNode) => {
    setTerritoryFormMode({ type: 'edit', nodeId: node.id })
    setTerritoryModalOpen(true)
  }, [])

  const handleOpenCreateOffice = useCallback(() => {
    setOfficeModalOpen(true)
  }, [])

  const handleTerritorySaved = useCallback(
    (territoryId: string) => {
      setSelectedTerritoryId(territoryId)
    },
    [setSelectedTerritoryId],
  )

  const requestDeleteTerritory = useCallback((node: HierarchyTreeNode) => {
    setTerritoryModalOpen(false)
    setConfirmDelete(node)
  }, [])

  const confirmDeleteTerritory = useCallback(() => {
    if (!confirmDelete) return
    if (assignedOfficeCountInSubtree > 0) {
      showMessage('Unassign all offices from this territory before deleting.', 'warning')
      setConfirmDelete(null)
      return
    }
    const removedLabels = removeTerritory(confirmDelete.id)
    showMessage(
      removedLabels.length > 1
        ? `Territory and ${removedLabels.length - 1} nested territories deleted`
        : 'Territory deleted',
      'info',
    )
    setConfirmDelete(null)
  }, [assignedOfficeCountInSubtree, confirmDelete, removeTerritory, showMessage])

  return (
    <>
      <UserManagementPageShell title="Territories" description="">
        <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, display: 'flex', opacity: loading ? 0.6 : 1 }}>
          <OfficeTerritoryHierarchyView
            onOpenCreateRoot={handleOpenCreateRoot}
            onOpenCreateOffice={handleOpenCreateOffice}
            onCreateChild={handleCreateChild}
            onEditTerritory={handleEditTerritory}
            onDeleteTerritory={requestDeleteTerritory}
          />
        </Box>
      </UserManagementPageShell>

      <CreateTerritoryDialog
        open={territoryModalOpen}
        mode={territoryFormMode}
        tree={tree}
        onClose={handleTerritoryModalClose}
        onSaved={handleTerritorySaved}
      />

      <CreateOfficeDialog
        open={officeModalOpen}
        onClose={() => setOfficeModalOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete territory?"
        description={`Remove ${confirmDelete?.name ?? ''} and all nested territories?`}
        destructive
        confirmLabel="Delete"
        onClose={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteTerritory}
      />
    </>
  )
}
