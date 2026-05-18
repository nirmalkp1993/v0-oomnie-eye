'use client'

import { Shield } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useClientMounted } from '@/src/hooks/use-client-mounted'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { AppDialogHeader } from '@/src/components/modals/app-dialog'
import { PermissionMatrixEditor } from '@/src/components/user-management/permission-matrix-editor'
import { PermissionMatrixReadonly } from '@/src/components/user-management/permission-matrix-readonly'
import {
  clonePermissionMatrix,
  type PermissionMatrix,
} from '@/src/constants/permissions-matrix'

type AssignmentTargetKey = `u:${string}` | `g:${string}`

export type AssignmentPermissionOverrides = Record<AssignmentTargetKey, PermissionMatrix>

function targetKeys(users: Set<string>, groups: Set<string>): AssignmentTargetKey[] {
  return [
    ...[...users].map((id) => `u:${id}` as const),
    ...[...groups].map((id) => `g:${id}` as const),
  ]
}

function targetsShareMatrix(keys: AssignmentTargetKey[], overrides: AssignmentPermissionOverrides): PermissionMatrix | null {
  if (keys.length === 0) return null
  const first = overrides[keys[0]]
  if (!first) return null
  for (let i = 1; i < keys.length; i++) {
    const o = overrides[keys[i]]
    if (!o) return null
    for (const mod of Object.keys(first) as (keyof PermissionMatrix)[]) {
      for (const col of Object.keys(first[mod]) as (keyof PermissionMatrix[typeof mod])[]) {
        if (o[mod][col] !== first[mod][col]) return null
      }
    }
  }
  return first
}

function useAssignmentDisplayMatrix(
  roleMatrix: PermissionMatrix,
  selectedUserIds: Set<string>,
  selectedGroupIds: Set<string>,
  overrides: AssignmentPermissionOverrides
) {
  const keys = useMemo(
    () => targetKeys(selectedUserIds, selectedGroupIds),
    [selectedUserIds, selectedGroupIds]
  )
  const selectionCount = keys.length

  const displayMatrix = useMemo(() => {
    if (selectionCount === 1) {
      const custom = overrides[keys[0]]
      if (custom) return custom
    }
    if (selectionCount > 1) {
      const shared = targetsShareMatrix(keys, overrides)
      if (shared) return shared
    }
    return roleMatrix
  }, [keys, overrides, roleMatrix, selectionCount])

  const hasCustomOverrides = keys.some((k) => overrides[k] != null)

  return { keys, selectionCount, displayMatrix, hasCustomOverrides }
}

interface RolePermissionsDialogBaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roleName: string
  roleMatrix: PermissionMatrix
  selectedUserIds: Set<string>
  selectedGroupIds: Set<string>
  overrides: AssignmentPermissionOverrides
}

interface RolePermissionsViewDialogProps extends RolePermissionsDialogBaseProps {
  onEditRequest?: () => void
}

export function RolePermissionsViewDialog({
  open,
  onOpenChange,
  roleName,
  roleMatrix,
  selectedUserIds,
  selectedGroupIds,
  overrides,
  onEditRequest,
}: RolePermissionsViewDialogProps) {
  const { selectionCount, displayMatrix, hasCustomOverrides } = useAssignmentDisplayMatrix(
    roleMatrix,
    selectedUserIds,
    selectedGroupIds,
    overrides
  )

  const mounted = useClientMounted()

  const subtitle =
    selectionCount > 0 && hasCustomOverrides
      ? `Showing effective permissions for ${selectionCount} selected target(s) where customized.`
      : selectionCount > 0
        ? `Default permissions for role “${roleName}” (applies to ${selectionCount} selected target(s)).`
        : `Default permissions defined for role “${roleName}”.`

  if (!mounted || !open) return null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-4xl">
        <AppDialogHeader title={`View permissions — ${roleName}`} description={subtitle} icon={Shield} />
        <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
          <PermissionMatrixReadonly matrix={displayMatrix} maxHeight={420} />
        </div>
        <DialogFooter className="gap-2 border-t border-border px-6 py-4 sm:justify-between">
          {onEditRequest ? (
            <Button
              type="button"
              variant="outline"
              className="border-border sm:mr-auto"
              disabled={selectionCount === 0}
              onClick={() => {
                onOpenChange(false)
                onEditRequest()
              }}
            >
              Edit for selection
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className={cn('border-border', !onEditRequest && 'sm:ml-auto')}
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RolePermissionsEditDialogProps extends RolePermissionsDialogBaseProps {
  onOverridesChange: (next: AssignmentPermissionOverrides) => void
  onNotify: (message: string, severity?: 'success' | 'info' | 'error') => void
}

export function RolePermissionsEditDialog({
  open,
  onOpenChange,
  roleName,
  roleMatrix,
  selectedUserIds,
  selectedGroupIds,
  overrides,
  onOverridesChange,
  onNotify,
}: RolePermissionsEditDialogProps) {
  const { keys, selectionCount, displayMatrix } = useAssignmentDisplayMatrix(
    roleMatrix,
    selectedUserIds,
    selectedGroupIds,
    overrides
  )
  const [draft, setDraft] = useState<PermissionMatrix>(() => clonePermissionMatrix(displayMatrix))

  useEffect(() => {
    if (open) {
      setDraft(clonePermissionMatrix(displayMatrix))
    }
  }, [open, displayMatrix])

  const saveEdit = () => {
    if (selectionCount === 0) {
      onNotify('Select at least one user or group to customize permissions.', 'info')
      return
    }
    const next = { ...overrides }
    for (const k of keys) {
      next[k] = clonePermissionMatrix(draft)
    }
    onOverridesChange(next)
    onOpenChange(false)
    onNotify(
      `Custom permissions saved for ${selectedUserIds.size} user(s) and ${selectedGroupIds.size} group(s).`,
      'success'
    )
  }

  const cancelEdit = () => {
    setDraft(clonePermissionMatrix(displayMatrix))
    onOpenChange(false)
  }

  const mounted = useClientMounted()

  if (!mounted || !open) return null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-4xl">
        <AppDialogHeader
          title={`Permissions — ${roleName}`}
          description={
            selectionCount > 0
              ? `View and customize permissions for ${selectionCount} selected user(s) and/or group(s). Changes apply on save.`
              : `Default permissions for role “${roleName}”. Select users or groups on the assignment page to customize overrides.`
          }
          icon={Shield}
        />
        <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
          {selectionCount > 0 ? (
            <PermissionMatrixEditor value={draft} onChange={setDraft} />
          ) : (
            <PermissionMatrixReadonly matrix={displayMatrix} maxHeight={420} />
          )}
        </div>
        <DialogFooter className="border-t border-border px-6 py-4">
          <Button type="button" variant="outline" className="border-border" onClick={cancelEdit}>
            Cancel
          </Button>
          <Button type="button" disabled={selectionCount === 0} onClick={saveEdit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
