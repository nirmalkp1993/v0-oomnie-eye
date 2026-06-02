'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  MenuItem,
  Select,
  TextField,
  type SelectChangeEvent,
} from '@mui/material'
import { Briefcase, UserRound } from 'lucide-react'
import { AppDialog, DialogFormField } from '@/src/components/modals/app-dialog'
import { DialogFormFooter } from '@/src/components/modals/dialog-form-footer'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import {
  COUNTRY_OPTIONS,
  DEFAULT_TENANT_NAME,
  DEPARTMENT_OPTIONS,
  INITIAL_CREATE_USER_FORM,
  JOB_TITLE_OPTIONS,
  SELECT_EMPTY_VALUE,
  TERRITORY_OPTIONS,
  USER_STATUS_FORM_OPTIONS,
} from '@/src/constants/add-user'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import {
  buildUserListItemFromForm,
  userToFormValues,
  validateCreateUserForm,
} from '@/src/lib/user-management/add-user-form.utils'
import type { CreateUserFormValues, UserListItem } from '@/src/types/user-management'

interface UserFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initial?: UserListItem | null
  onClose: () => void
  onSubmit: (user: UserListItem) => void
  onDeleteRequest?: () => void
}

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

export function UserFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDeleteRequest,
}: UserFormModalProps) {
  const { showMessage } = useAdminSnackbar()
  const isEdit = mode === 'edit' && initial != null
  const [form, setForm] = useState<CreateUserFormValues>(INITIAL_CREATE_USER_FORM)
  const [submitting, setSubmitting] = useState(false)

  const reset = useCallback(() => {
    setForm(INITIAL_CREATE_USER_FORM)
  }, [])

  useEffect(() => {
    if (!open) return
    if (initial) setForm(userToFormValues(initial))
    else reset()
  }, [open, initial, reset])

  const update = <K extends keyof CreateUserFormValues>(key: K, value: CreateUserFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClose = () => {
    if (!submitting) {
      reset()
      onClose()
    }
  }

  const stringSelect = (
    id: string,
    label: string,
    value: string,
    options: readonly string[],
    onValue: (v: string) => void
  ) => (
    <DialogFormField label={label} htmlFor={id}>
      <Select
        id={id}
        fullWidth
        displayEmpty
        value={value}
        onChange={(e: SelectChangeEvent<string>) => onValue(e.target.value)}
        sx={outlineFieldSx}
        renderValue={(v) =>
          !v || v === SELECT_EMPTY_VALUE ? (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              Select…
            </Box>
          ) : (
            v
          )
        }
      >
        <MenuItem value={SELECT_EMPTY_VALUE}>Select…</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </DialogFormField>
  )

  const handleSubmit = async () => {
    const validationKey = validateCreateUserForm(form)
    if (validationKey) {
      showMessage(
        validationKey === 'emailInvalid' ? 'Enter a valid email address' : 'Fill in required fields',
        'warning'
      )
      return
    }
    setSubmitting(true)
    try {
      const user = buildUserListItemFromForm(form, initial ?? undefined)
      onSubmit(user)
      reset()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Edit user' : 'Add user'}
      description={`${DEFAULT_TENANT_NAME} · User directory`}
      icon={UserRound}
      maxWidth="3xl"
      footer={
        <DialogFormFooter
          isCreate={!isEdit}
          isEditing
          onClose={handleClose}
          onEdit={() => {}}
          onSave={() => void handleSubmit()}
          onDelete={onDeleteRequest}
          deleteLabel="Delete user"
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, py: 1 }}>
        <EarthDialogSectionCard
          title="Identity"
          icon={UserRound}
          accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              columnGap: 2.5,
              rowGap: 2.5,
            }}
          >
            <DialogFormField label="First name" htmlFor="firstName" required>
              <TextField
                id="firstName"
                fullWidth
                autoFocus
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                sx={outlineFieldSx}
              />
            </DialogFormField>
            <DialogFormField label="Last name" htmlFor="lastName" required>
              <TextField
                id="lastName"
                fullWidth
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                sx={outlineFieldSx}
              />
            </DialogFormField>
            <DialogFormField label="Email" htmlFor="email" required>
              <TextField
                id="email"
                fullWidth
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                sx={outlineFieldSx}
              />
            </DialogFormField>
            <DialogFormField label="Phone" htmlFor="phone">
              <TextField
                id="phone"
                fullWidth
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                sx={outlineFieldSx}
              />
            </DialogFormField>
            <DialogFormField label="Status" htmlFor="status">
              <Select
                id="status"
                fullWidth
                value={form.status}
                onChange={(e) => update('status', e.target.value as CreateUserFormValues['status'])}
                sx={outlineFieldSx}
              >
                {USER_STATUS_FORM_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </DialogFormField>
          </Box>
        </EarthDialogSectionCard>

        <EarthDialogSectionCard
          title="Organization"
          icon={Briefcase}
          accentColor={EARTH_DIALOG_SECTION_ACCENTS.secondary}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              columnGap: 2.5,
              rowGap: 2.5,
            }}
          >
            {stringSelect('department', 'Department', form.department, DEPARTMENT_OPTIONS, (v) =>
              update('department', v)
            )}
            {stringSelect('jobTitle', 'Job title', form.jobTitle, JOB_TITLE_OPTIONS, (v) =>
              update('jobTitle', v)
            )}
            {stringSelect('territory', 'Territory', form.territory, TERRITORY_OPTIONS, (v) =>
              update('territory', v)
            )}
            {stringSelect('country', 'Country', form.country, COUNTRY_OPTIONS, (v) =>
              update('country', v)
            )}
          </Box>
        </EarthDialogSectionCard>
      </Box>
    </AppDialog>
  )
}
