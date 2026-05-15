'use client'

import GroupsIcon from '@mui/icons-material/Groups'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <GroupsIcon color="primary" sx={{ fontSize: 30 }} aria-hidden />
        <Typography component="span" variant="h6" fontWeight={700}>
          {mode === 'create' ? 'Add group' : 'Edit group'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="groupName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Group Name" fullWidth error={Boolean(errors.groupName)} helperText={errors.groupName?.message} />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline minRows={2} error={Boolean(errors.description)} helperText={errors.description?.message} />
            )}
          />
          <Typography variant="subtitle2" fontWeight={700}>
            User assignment
          </Typography>
          <DualTransferList
            available={allUsers}
            selectedIds={memberUserIds}
            onChange={(ids) => setValue('memberUserIds', ids, { shouldValidate: true })}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={submit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
