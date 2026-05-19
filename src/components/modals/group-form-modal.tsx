'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Users, UsersRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, type Control, type FieldErrors } from 'react-hook-form'
import { z } from 'zod'
import { Box, Button } from '@mui/material'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AppDialog, DialogFormField, DIALOG_INPUT_CLASS } from '@/src/components/modals/app-dialog'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
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
    <EarthDialogSectionCard
      title="Group details"
      icon={Pencil}
      tooltip="Name and description for this group"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
      </Box>
    </EarthDialogSectionCard>
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
    <EarthDialogSectionCard
      title="User assignment"
      icon={Users}
      tooltip="Assign members to this group"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
    >
      <DualTransferList available={allUsers} selectedIds={memberUserIds} onChange={onMemberIdsChange} />
    </EarthDialogSectionCard>
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
    <EarthDialogSectionCard
      title="View users"
      icon={Users}
      tooltip="Members currently assigned to this group"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.warning}
    >
      <Box>
        <Box
          component="dl"
          sx={{
            mb: 2,
            display: 'grid',
            gap: 1,
            p: 1.5,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
            gridTemplateColumns: { sm: '1fr 1fr' },
            fontSize: '0.875rem',
          }}
        >
          <Box>
            <Box component="dt" sx={{ color: 'text.secondary', m: 0 }}>Group ID</Box>
            <Box component="dd" sx={{ fontWeight: 600, color: 'text.primary', m: 0 }}>{groupRow.groupId}</Box>
          </Box>
          <Box>
            <Box component="dt" sx={{ color: 'text.secondary', m: 0 }}>Created</Box>
            <Box component="dd" sx={{ fontWeight: 600, color: 'text.primary', m: 0 }}>{groupRow.createdDate}</Box>
          </Box>
          <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
            <Box component="dt" sx={{ color: 'text.secondary', m: 0 }}>Members</Box>
            <Box component="dd" sx={{ fontWeight: 600, color: 'text.primary', m: 0 }}>{memberUserIds.length}</Box>
          </Box>
        </Box>
        <Box component="ul" sx={{ maxHeight: 280, overflowY: 'auto', m: 0, p: 0, listStyle: 'none' }}>
          {memberUserIds.map((uid) => {
            const u = usersById.get(uid)
            return (
              <Box
                component="li"
                key={uid}
                sx={{ borderBottom: 1, borderColor: 'divider', py: 1, '&:last-child': { borderBottom: 0 } }}
              >
                <Box component="p" sx={{ fontSize: '0.875rem', fontWeight: 600, m: 0 }}>
                  {u?.label ?? uid}
                </Box>
                {u?.secondary ? (
                  <Box component="p" sx={{ fontSize: '0.75rem', color: 'text.secondary', m: 0 }}>
                    {u.secondary}
                  </Box>
                ) : null}
              </Box>
            )
          })}
        </Box>
        {memberUserIds.length === 0 ? (
          <Box component="p" sx={{ mt: 1.5, fontSize: '0.875rem', color: 'text.secondary', m: 0 }}>
            No members assigned. Use the Details tab to add users.
          </Box>
        ) : null}
      </Box>
    </EarthDialogSectionCard>
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
        <Button type="button" variant="contained" color="error" sx={{ mr: 'auto' }} onClick={onDeleteRequest}>
          Delete group
        </Button>
      ) : (
        <Box sx={{ mr: 'auto' }} />
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
