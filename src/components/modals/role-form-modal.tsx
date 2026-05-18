'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Pencil, Shield } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AppDialog, DialogFormField, DIALOG_INPUT_CLASS } from '@/src/components/modals/app-dialog'
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
        <Button type="button" variant="destructive" className="mr-auto" onClick={onDeleteRequest}>
          Delete role
        </Button>
      ) : (
        <span className="mr-auto" />
      )}
      <Button type="button" variant="outline" className="border-border" onClick={onClose}>
        Cancel
      </Button>
      <Button type="button" onClick={submit}>
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
        contentClassName="max-h-[min(460px,55vh)] overflow-y-auto"
      >
        <TabsContent value="details" className="mt-0">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-orange-500">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <Pencil className="size-4 text-primary-foreground" />
                </div>
                Role details
                <Info className="size-3.5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roleRow && !isCreate ? (
                <dl className="grid gap-2 rounded-md border border-border bg-card/50 p-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">Users</dt>
                    <dd className="font-medium text-foreground">{roleRow.userCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="font-medium text-foreground">{roleRow.createdDate}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Role ID</dt>
                    <dd className="font-medium text-foreground">{roleRow.id}</dd>
                  </div>
                </dl>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-0">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-orange-500">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                  <Shield className="size-4 text-primary-foreground" />
                </div>
                Permission matrix
                <Info className="size-3.5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Fine-grained RBAC across platform modules. Changes apply when you save the role.
              </p>
              <PermissionMatrixEditor value={matrix} onChange={setMatrix} />
            </CardContent>
          </Card>
        </TabsContent>
      </DialogEarthTabs>
    </AppDialog>
  )
}
