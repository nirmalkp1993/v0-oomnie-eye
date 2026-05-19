'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Shield } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Box, Button } from '@mui/material'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AppDialog, DialogFormField, DIALOG_INPUT_CLASS } from '@/src/components/modals/app-dialog'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { DialogEarthTabs, TabsContent, type DialogEarthTabConfig } from '@/src/components/modals/dialog-earth-tabs'
import { PermissionMatrixEditor } from '@/src/components/user-management/permission-matrix-editor'
import {
  clonePermissionMatrix,
  createEmptyPermissionMatrix,
  type PermissionMatrix,
} from '@/src/constants/permissions-matrix'
import { MOCK_ROLE_PERMISSIONS } from '@/src/mock-data/roles'
import type { RoleRow } from '@/src/types/user-management'
import { roleFormSchema, type RoleFormValues } from '@/src/utils/validation'

export type RoleFormTab = 'details' | 'permissions'

interface RoleFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  roleRow?: RoleRow | null
  roleId?: string | null
  initial?: { roleName: string; description?: string }
  initialMatrix?: PermissionMatrix | null
  initialTab?: RoleFormTab
  onClose: () => void
  onSubmit: (values: RoleFormValues, matrix: PermissionMatrix) => void
  onDeleteRequest?: () => void
}

export function RoleFormModal({
  open,
  mode,
  roleRow,
  roleId,
  initial,
  initialMatrix,
  initialTab = 'details',
  onClose,
  onSubmit,
  onDeleteRequest,
}: RoleFormModalProps) {
  const isCreate = mode === 'create'
  const [activeTab, setActiveTab] = useState<RoleFormTab>('details')
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
    setActiveTab(initialTab)
  }, [open, initial, initialMatrix, roleId, reset, initialTab, isCreate])

  const submit = handleSubmit((vals) => onSubmit(vals, matrix))

  const tabs = useMemo(
    (): DialogEarthTabConfig[] => [
      { value: 'details', label: 'Details', icon: Pencil },
      { value: 'permissions', label: 'Permissions', icon: Shield },
    ],
    []
  )

  const dialogFooter = (
    <>
      {!isCreate && onDeleteRequest ? (
        <Button type="button" variant="contained" color="error" sx={{ mr: 'auto' }} onClick={onDeleteRequest}>
          Delete role
        </Button>
      ) : (
        <span className="mr-auto" />
      )}
      <Button type="button" variant="outlined" onClick={onClose}>
        Cancel
      </Button>
      <Button type="button" variant="contained" onClick={submit}>
        Save
      </Button>
    </>
  )

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isCreate ? 'Add role' : roleRow ? `Role — ${roleRow.roleName}` : 'Edit role'}
      icon={Shield}
      maxWidth="4xl"
      footer={dialogFooter}
    >
      <DialogEarthTabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as RoleFormTab)}
        tabs={tabs}
        contentClassName="max-h-[min(460px,55vh)]"
      >
        <TabsContent value="details" className="mt-0">
          <EarthDialogSectionCard
            title="Role details"
            icon={Pencil}
            tooltip="Name, description, and role metadata"
            accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {roleRow && !isCreate ? (
                <Box
                  component="dl"
                  sx={{
                    display: 'grid',
                    gap: 1,
                    p: 1.5,
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                    gridTemplateColumns: { sm: '1fr 1fr 1fr' },
                    fontSize: '0.875rem',
                    '& dt': { color: 'text.secondary', m: 0 },
                    '& dd': { fontWeight: 600, color: 'text.primary', m: 0 },
                  }}
                >
                  <Box>
                    <Box component="dt">Users</Box>
                    <Box component="dd">{roleRow.userCount}</Box>
                  </Box>
                  <Box>
                    <Box component="dt">Created</Box>
                    <Box component="dd">{roleRow.createdDate}</Box>
                  </Box>
                  <Box>
                    <Box component="dt">Role ID</Box>
                    <Box component="dd">{roleRow.id}</Box>
                  </Box>
                </Box>
              ) : null}
              <Controller
                name="roleName"
                control={control}
                render={({ field }) => (
                  <DialogFormField label="Role Name" htmlFor="roleName" error={errors.roleName?.message} required>
                    <Input id="roleName" {...field} className={DIALOG_INPUT_CLASS} />
                  </DialogFormField>
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <DialogFormField label="Description" htmlFor="roleDescription" error={errors.description?.message}>
                    <Textarea id="roleDescription" {...field} rows={3} className={DIALOG_INPUT_CLASS} />
                  </DialogFormField>
                )}
              />
            </Box>
          </EarthDialogSectionCard>
        </TabsContent>

        <TabsContent value="permissions" className="mt-0">
          <EarthDialogSectionCard
            title="Permission matrix"
            icon={Shield}
            tooltip="Fine-grained RBAC across platform modules"
            accentColor={EARTH_DIALOG_SECTION_ACCENTS.success}
          >
            <Box component="p" sx={{ mb: 2, fontSize: '0.875rem', color: 'text.secondary', m: 0 }}>
              Fine-grained RBAC across platform modules. Changes apply when you save the role.
            </Box>
            <PermissionMatrixEditor value={matrix} onChange={setMatrix} />
          </EarthDialogSectionCard>
        </TabsContent>
      </DialogEarthTabs>
    </AppDialog>
  )
}
