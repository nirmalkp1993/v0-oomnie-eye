'use client'

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PermissionMatrixEditor } from '@/src/components/user-management/permission-matrix-editor'
import {
  clonePermissionMatrix,
  createEmptyPermissionMatrix,
  type PermissionMatrix,
} from '@/src/constants/permissions-matrix'
import { MOCK_ROLE_PERMISSIONS } from '@/src/mock-data/roles'
import { roleFormSchema, type RoleFormValues } from '@/src/utils/validation'

interface RoleFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  roleId?: string | null
  initial?: { roleName: string; description?: string }
  initialMatrix?: PermissionMatrix | null
  onClose: () => void
  onSubmit: (values: RoleFormValues, matrix: PermissionMatrix) => void
}

export function RoleFormModal({ open, mode, roleId, initial, initialMatrix, onClose, onSubmit }: RoleFormModalProps) {
  const [tab, setTab] = useState(0)
  const [matrix, setMatrix] = useState<PermissionMatrix>(() => createEmptyPermissionMatrix())

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { roleName: '', description: '' },
  })

  useEffect(() => {
    if (!open) return
    setTab(0)
    if (initial) {
      reset({ roleName: initial.roleName, description: initial.description ?? '' })
      if (initialMatrix) {
        setMatrix(clonePermissionMatrix(initialMatrix))
      } else if (roleId && MOCK_ROLE_PERMISSIONS[roleId]) {
        setMatrix(clonePermissionMatrix(MOCK_ROLE_PERMISSIONS[roleId]))
      } else {
        setMatrix(createEmptyPermissionMatrix())
      }
    } else {
      reset({ roleName: '', description: '' })
      setMatrix(createEmptyPermissionMatrix())
    }
  }, [open, initial, initialMatrix, roleId, reset])

  const title = useMemo(() => (mode === 'create' ? 'Add role' : 'Edit role'), [mode])

  const submit = handleSubmit((vals) => onSubmit(vals, matrix))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 30 }} aria-hidden />
        <Typography component="span" variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 1 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Role details" />
          <Tab label="Permission matrix" />
        </Tabs>
        {tab === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Controller
              name="roleName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Role Name"
                  fullWidth
                  error={Boolean(errors.roleName)}
                  helperText={errors.roleName?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  minRows={3}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                />
              )}
            />
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Fine-grained RBAC across platform modules. Sticky headers help scan wide matrices on smaller displays.
            </Typography>
            <PermissionMatrixEditor value={matrix} onChange={setMatrix} />
          </Box>
        )}
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
