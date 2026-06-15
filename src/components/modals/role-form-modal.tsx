'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  FormControlLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Shield } from 'lucide-react'
import { AppDialog, DialogFormField } from '@/src/components/modals/app-dialog'
import { DialogFormFooter } from '@/src/components/modals/dialog-form-footer'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { DEFAULT_TENANT_NAME, INITIAL_CREATE_ROLE_FORM } from '@/src/constants/role-catalog'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import {
  buildRoleListItemFromForm,
  roleToFormValues,
  validateCreateRoleForm,
} from '@/src/lib/user-management/add-role-form.utils'
import type { CreateRoleFormValues, RoleListItem, RoleStatus } from '@/src/types/user-management'

const outlineFieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } } as const

interface RoleFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initial?: RoleListItem | null
  onClose: () => void
  onSubmit: (role: RoleListItem) => void
  onDeleteRequest?: () => void
}

export function RoleFormModal({
  open,
  mode,
  initial,
  onClose,
  onSubmit,
  onDeleteRequest,
}: RoleFormModalProps) {
  const { showMessage } = useAdminSnackbar()
  const isEdit = mode === 'edit' && initial != null
  const isSystemRole = initial?.badges.includes('system') ?? false
  const [form, setForm] = useState<CreateRoleFormValues>(INITIAL_CREATE_ROLE_FORM)
  const [submitting, setSubmitting] = useState(false)

  const reset = useCallback(() => setForm(INITIAL_CREATE_ROLE_FORM), [])

  useEffect(() => {
    if (!open) return
    if (initial) setForm(roleToFormValues(initial))
    else reset()
  }, [open, initial, reset])

  const update = <K extends keyof CreateRoleFormValues>(key: K, value: CreateRoleFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClose = () => {
    if (!submitting) {
      reset()
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (validateCreateRoleForm(form)) {
      showMessage('Role name is required', 'warning')
      return
    }
    setSubmitting(true)
    try {
      onSubmit(buildRoleListItemFromForm(form, initial ?? undefined))
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
      title={isEdit ? 'Edit role' : 'Add role'}
      description={`${DEFAULT_TENANT_NAME} · RBAC catalog`}
      icon={Shield}
      maxWidth="md"
      footer={
        <DialogFormFooter
          isCreate={!isEdit}
          isEditing
          onClose={handleClose}
          onEdit={() => {}}
          onSave={() => void handleSubmit()}
          onDelete={isSystemRole ? undefined : onDeleteRequest}
          deleteLabel="Delete role"
        />
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, py: 1 }}>
        <EarthDialogSectionCard
          title="Role details"
          icon={Shield}
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
            <DialogFormField label="Role name" htmlFor="roleName" required>
              <TextField
                id="roleName"
                fullWidth
                autoFocus
                disabled={isSystemRole}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                sx={outlineFieldSx}
              />
            </DialogFormField>
            <DialogFormField label="Status" htmlFor="roleStatus">
              <Select
                id="roleStatus"
                fullWidth
                value={form.status}
                onChange={(e) => update('status', e.target.value as RoleStatus)}
                sx={outlineFieldSx}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </DialogFormField>
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <DialogFormField label="Description" htmlFor="roleDescription">
                <TextField
                  id="roleDescription"
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  sx={outlineFieldSx}
                />
              </DialogFormField>
            </Box>
          </Box>
          <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 2, py: 1.5 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.highRisk}
                  onChange={(e) => update('highRisk', e.target.checked)}
                  color="primary"
                  disabled={isSystemRole}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    High-risk role
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Requires additional approval for assignment changes.
                  </Typography>
                </Box>
              }
              sx={{ alignItems: 'flex-start', m: 0 }}
            />
          </Box>
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Module permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure Read, Add, Edit, Delete, Export, Import scopes per role in the{' '}
              <strong>Permissions → Access permissions</strong> tab (Bitrix-style grid).
            </Typography>
          </Box>
        </EarthDialogSectionCard>
      </Box>
    </AppDialog>
  )
}
