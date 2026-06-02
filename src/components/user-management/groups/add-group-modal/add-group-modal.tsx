'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import { UsersRound } from 'lucide-react'
import { AppDialog } from '@/src/components/modals/app-dialog'
import { DialogFormFooter } from '@/src/components/modals/dialog-form-footer'
import { DEFAULT_TENANT_NAME, INITIAL_CREATE_GROUP_FORM } from '@/src/constants/add-group'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import {
  buildGroupListItemFromForm,
  createEmptyRule,
  groupToFormValues,
  mergeSelectableUsers,
  validateCreateGroupForm,
} from '@/src/lib/user-management/add-group-form.utils'
import type { CreateGroupFormValues, GroupListItem } from '@/src/types/user-management'
import { AddGroupFormContent } from './add-group-form-content'

export interface AddGroupModalProps {
  open: boolean
  onClose: () => void
  editGroup?: GroupListItem | null
  onCreated: (group: GroupListItem) => void
  onUpdated?: (group: GroupListItem) => void
  tenantName?: string
  directoryUsers?: { id: string; name: string; email: string }[]
}

export function AddGroupModal({
  open,
  onClose,
  editGroup = null,
  onCreated,
  onUpdated,
  tenantName = DEFAULT_TENANT_NAME,
  directoryUsers = [],
}: AddGroupModalProps) {
  const { showMessage } = useAdminSnackbar()
  const isEdit = editGroup != null
  const [form, setForm] = useState<CreateGroupFormValues>(INITIAL_CREATE_GROUP_FORM)
  const [submitting, setSubmitting] = useState(false)

  const selectableUsers = useMemo(
    () => mergeSelectableUsers(directoryUsers),
    [directoryUsers]
  )

  const reset = useCallback(() => {
    setForm(INITIAL_CREATE_GROUP_FORM)
  }, [])

  useEffect(() => {
    if (!open) return
    if (editGroup) {
      setForm(groupToFormValues(editGroup))
    } else {
      reset()
    }
  }, [open, editGroup, reset])

  const handleClose = () => {
    if (!submitting) {
      reset()
      onClose()
    }
  }

  const update = <K extends keyof CreateGroupFormValues>(
    key: K,
    value: CreateGroupFormValues[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleRole = (roleId: string) => {
    setForm((prev) => {
      const ids = prev.inheritedRoleIds.includes(roleId)
        ? prev.inheritedRoleIds.filter((id) => id !== roleId)
        : [...prev.inheritedRoleIds, roleId]
      return { ...prev, inheritedRoleIds: ids }
    })
  }

  const toggleUser = (userId: string) => {
    setForm((prev) => {
      const ids = prev.selectedUserIds.includes(userId)
        ? prev.selectedUserIds.filter((id) => id !== userId)
        : [...prev.selectedUserIds, userId]
      return { ...prev, selectedUserIds: ids }
    })
  }

  const handleSubmit = async () => {
    if (validateCreateGroupForm(form)) {
      showMessage('Group name is required.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const group = buildGroupListItemFromForm(form, editGroup?.id)
      if (isEdit && onUpdated) {
        onUpdated(group)
        showMessage('Group updated')
      } else {
        onCreated(group)
        showMessage('Group created')
      }
      reset()
      onClose()
    } catch {
      showMessage(isEdit ? 'Could not update group' : 'Could not create group', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit group' : 'New group'}
      description={
        isEdit
          ? 'Update membership rules, manual members, and inherited roles.'
          : `Create a static or dynamic group in ${tenantName}.`
      }
      icon={UsersRound}
      maxWidth="4xl"
      footer={
        <DialogFormFooter
          isCreate={!isEdit}
          isEditing
          onClose={handleClose}
          onEdit={() => {}}
          onSave={() => void handleSubmit()}
        />
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          py: 1,
          maxHeight: 'min(62vh, 560px)',
          overflowY: 'auto',
          pr: 0.5,
        }}
      >
        <AddGroupFormContent
          form={form}
          selectableUsers={selectableUsers}
          disabled={submitting}
          onChange={update}
          onMatchModeChange={(mode) => update('ruleMatchMode', mode)}
          onAddRule={() =>
            setForm((prev) => ({
              ...prev,
              rules: [...prev.rules, createEmptyRule()],
            }))
          }
          onUpdateRule={(id, patch) =>
            setForm((prev) => ({
              ...prev,
              rules: prev.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
            }))
          }
          onRemoveRule={(id) =>
            setForm((prev) => ({
              ...prev,
              rules: prev.rules.filter((r) => r.id !== id),
            }))
          }
          onToggleRole={toggleRole}
          onToggleUser={toggleUser}
        />
      </Box>
    </AppDialog>
  )
}
