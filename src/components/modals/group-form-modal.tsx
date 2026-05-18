'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { UsersRound } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AppDialog, DialogFormField, DIALOG_INPUT_CLASS, DIALOG_LABEL_CLASS } from '@/src/components/modals/app-dialog'
import { Label } from '@/components/ui/label'
import { DualTransferList, type TransferUserItem } from '@/src/components/user-management/dual-transfer-list'
import { groupFormSchema, type GroupFormValues } from '@/src/utils/validation'

interface GroupFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initial?: { groupName: string; description?: string; memberUserIds: string[] }
  allUsers: TransferUserItem[]
  onClose: () => void
  onSubmit: (values: GroupFormValues & { memberUserIds: string[] }) => void
}

export function GroupFormModal({ open, mode, initial, allUsers, onClose, onSubmit }: GroupFormModalProps) {
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GroupFormValues & { memberUserIds: string[] }>({
    resolver: zodResolver(
      groupFormSchema.extend({ memberUserIds: z.array(z.string()) })
    ),
    defaultValues: { groupName: '', description: '', memberUserIds: [] },
  })

  const memberUserIds = watch('memberUserIds')

  useEffect(() => {
    if (!open) return
    if (initial && mode === 'edit') {
      reset({
        groupName: initial.groupName,
        description: initial.description ?? '',
        memberUserIds: initial.memberUserIds,
      })
    } else {
      reset({ groupName: '', description: '', memberUserIds: [] })
    }
  }, [open, initial, mode, reset])

  const submit = handleSubmit((vals) => onSubmit(vals))

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Add group' : 'Edit group'}
      icon={UsersRound}
      maxWidth="2xl"
      confirmLabel="Save"
      onConfirm={submit}
    >
      <div className="flex flex-col gap-4">
        <Controller
          name="groupName"
          control={control}
          render={({ field }) => (
            <DialogFormField label="Group Name" htmlFor="groupName" error={errors.groupName?.message} required>
              <Input id="groupName" {...field} className={DIALOG_INPUT_CLASS} />
            </DialogFormField>
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <DialogFormField label="Description" htmlFor="groupDescription" error={errors.description?.message}>
              <Textarea id="groupDescription" {...field} rows={2} className={DIALOG_INPUT_CLASS} />
            </DialogFormField>
          )}
        />
        <div className="space-y-2">
          <Label className={DIALOG_LABEL_CLASS}>User assignment</Label>
          <DualTransferList
            available={allUsers}
            selectedIds={memberUserIds}
            onChange={(ids) => setValue('memberUserIds', ids, { shouldValidate: true })}
          />
        </div>
      </div>
    </AppDialog>
  )
}
