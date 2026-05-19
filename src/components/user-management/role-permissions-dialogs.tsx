'use client'

import CloseIcon from '@mui/icons-material/Close'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { Shield } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@mui/material'
import { AppDialog } from '@/src/components/modals/app-dialog'
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

  const subtitle =
    selectionCount > 0 && hasCustomOverrides
      ? `Showing effective permissions for ${selectionCount} selected target(s) where customized.`
      : selectionCount > 0
        ? `Default permissions for role “${roleName}” (applies to ${selectionCount} selected target(s)).`
        : `Default permissions defined for role “${roleName}”.`

  return (
    <AppDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={`View permissions — ${roleName}`}
      description={subtitle}
      icon={Shield}
      maxWidth="4xl"
      hideFooter={false}
      footer={
        <>
          {onEditRequest ? (
            <Button
              type="button"
              variant="outlined"
              startIcon={<EditOutlinedIcon />}
              disabled={selectionCount === 0}
              sx={{ mr: 'auto' }}
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
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={() => onOpenChange(false)}
            sx={!onEditRequest ? { ml: 'auto' } : undefined}
          >
            Close
          </Button>
        </>
      }
    >
      <PermissionMatrixReadonly matrix={displayMatrix} maxHeight={420} />
    </AppDialog>
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

  return (
    <AppDialog
      open={open}
      onClose={cancelEdit}
      title={`Permissions — ${roleName}`}
      description={
        selectionCount > 0
          ? `View and customize permissions for ${selectionCount} selected user(s) and/or group(s). Changes apply on save.`
          : `Default permissions for role “${roleName}”. Select users or groups on the assignment page to customize overrides.`
      }
      icon={Shield}
      maxWidth="4xl"
      footer={
        <>
          <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={cancelEdit}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            disabled={selectionCount === 0}
            onClick={saveEdit}
          >
            Save changes
          </Button>
        </>
      }
    >
      {selectionCount > 0 ? (
        <PermissionMatrixEditor value={draft} onChange={setDraft} />
      ) : (
        <PermissionMatrixReadonly matrix={displayMatrix} maxHeight={420} />
      )}
    </AppDialog>
  )
}
