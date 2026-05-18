'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Shield } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { AppDialog, DialogFormField, DIALOG_INPUT_CLASS } from '@/src/components/modals/app-dialog'
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
  const [tab, setTab] = useState('details')
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
    setTab('details')
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
    <AppDialog
      open={open}
      onClose={onClose}
      title={title}
      icon={Shield}
      maxWidth="4xl"
      confirmLabel="Save"
      onConfirm={submit}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 h-auto w-full justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="details"
            className="relative rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Role details
          </TabsTrigger>
          <TabsTrigger
            value="matrix"
            className="relative rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Permission matrix
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-0 space-y-4">
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
        </TabsContent>
        <TabsContent value="matrix" className="mt-0">
          <p className="mb-4 text-sm text-muted-foreground">
            Fine-grained RBAC across platform modules. Sticky headers help scan wide matrices on smaller displays.
          </p>
          <PermissionMatrixEditor value={matrix} onChange={setMatrix} />
        </TabsContent>
      </Tabs>
    </AppDialog>
  )
}
