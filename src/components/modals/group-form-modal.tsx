'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Pencil, Users, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, type Control, type FieldErrors } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AppDialog, DialogFormField, DIALOG_INPUT_CLASS } from '@/src/components/modals/app-dialog'
import { DialogEarthTabs, TabsContent, type DialogEarthTabConfig } from '@/src/components/modals/dialog-earth-tabs'
import { DualTransferList, type TransferUserItem } from '@/src/components/user-management/dual-transfer-list'
import type { GroupRow } from '@/src/types/user-management'
import { groupFormSchema, type GroupFormValues } from '@/src/utils/validation'

export type GroupFormTab = 'details' | 'members'

type GroupFormValuesWithMembers = GroupFormValues & { memberUserIds: string[] }

interface GroupFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  groupRow?: GroupRow | null
  initial?: { groupName: string; description?: string; memberUserIds: string[] }
  initialTab?: GroupFormTab
  allUsers: TransferUserItem[]
  onClose: () => void
  onSubmit: (values: GroupFormValuesWithMembers) => void
  onDeleteRequest?: () => void
}

function GroupDetailsCard({
  control,
  errors,
}: {
  control: Control<GroupFormValuesWithMembers>
  errors: FieldErrors<GroupFormValuesWithMembers>
}) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-orange-500">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Pencil className="size-4 text-primary-foreground" />
          </div>
          Group details
          <Info className="size-3.5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  )
}

function GroupUserAssignmentCard({
  allUsers,
  memberUserIds,
  onMemberIdsChange,
}: {
  allUsers: TransferUserItem[]
  memberUserIds: string[]
  onMemberIdsChange: (ids: string[]) => void
}) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-orange-500">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Users className="size-4 text-primary-foreground" />
          </div>
          User assignment
          <Info className="size-3.5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DualTransferList available={allUsers} selectedIds={memberUserIds} onChange={onMemberIdsChange} />
      </CardContent>
    </Card>
  )
}

function GroupMembersViewCard({
  groupRow,
  memberUserIds,
  usersById,
}: {
  groupRow: GroupRow
  memberUserIds: string[]
  usersById: Map<string, TransferUserItem>
}) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-orange-500">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <Users className="size-4 text-primary-foreground" />
          </div>
          View users
          <Info className="size-3.5 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="mb-4 grid gap-2 rounded-md border border-border bg-card/50 p-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Group ID</dt>
            <dd className="font-medium text-foreground">{groupRow.groupId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-medium text-foreground">{groupRow.createdDate}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Members</dt>
            <dd className="font-medium text-foreground">{memberUserIds.length}</dd>
          </div>
        </dl>
        <ul className="max-h-[280px] space-y-3 overflow-y-auto">
          {memberUserIds.map((uid) => {
            const u = usersById.get(uid)
            return (
              <li key={uid} className="border-b border-border pb-2 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-foreground">{u?.label ?? uid}</p>
                {u?.secondary ? <p className="text-xs text-muted-foreground">{u.secondary}</p> : null}
              </li>
            )
          })}
        </ul>
        {memberUserIds.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No members assigned. Use the Details tab to add users.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function GroupFormModal({
  open,
  mode,
  groupRow,
  initial,
  initialTab = 'details',
  allUsers,
  onClose,
  onSubmit,
  onDeleteRequest,
}: GroupFormModalProps) {
  const isCreate = mode === 'create'
  const [activeTab, setActiveTab] = useState<GroupFormTab>('details')

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GroupFormValuesWithMembers>({
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
    if (!isCreate) {
      setActiveTab(initialTab)
    }
  }, [open, initial, mode, reset, initialTab, isCreate])

  const submit = handleSubmit((vals) => onSubmit(vals))

  const usersById = useMemo(() => new Map(allUsers.map((u) => [u.id, u])), [allUsers])

  const editTabs = useMemo(
    (): DialogEarthTabConfig[] => [
      { value: 'details', label: 'Details', icon: Pencil },
      { value: 'members', label: 'View users', icon: Users },
    ],
    []
  )

  const handleMemberIdsChange = (ids: string[]) => {
    setValue('memberUserIds', ids, { shouldValidate: true })
  }

  const detailsAndAssignment = (
    <div className="flex flex-col gap-4">
      <GroupDetailsCard control={control} errors={errors} />
      <GroupUserAssignmentCard
        allUsers={allUsers}
        memberUserIds={memberUserIds}
        onMemberIdsChange={handleMemberIdsChange}
      />
    </div>
  )

  const dialogFooter = (
    <>
      {!isCreate && onDeleteRequest ? (
        <Button type="button" variant="destructive" className="mr-auto" onClick={onDeleteRequest}>
          Delete group
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
      title={isCreate ? 'Add group' : groupRow ? `Group — ${groupRow.groupName}` : 'Edit group'}
      icon={UsersRound}
      maxWidth="4xl"
      footer={dialogFooter}
    >
      {isCreate ? (
        <div className="max-h-[min(420px,50vh)] overflow-y-auto">{detailsAndAssignment}</div>
      ) : (
        <DialogEarthTabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as GroupFormTab)}
          tabs={editTabs}
          contentClassName="max-h-[min(420px,50vh)] overflow-y-auto"
        >
          <TabsContent value="details" className="mt-0">
            {detailsAndAssignment}
          </TabsContent>
          {groupRow ? (
            <TabsContent value="members" className="mt-0">
              <GroupMembersViewCard groupRow={groupRow} memberUserIds={memberUserIds} usersById={usersById} />
            </TabsContent>
          ) : null}
        </DialogEarthTabs>
      )}
    </AppDialog>
  )
}
