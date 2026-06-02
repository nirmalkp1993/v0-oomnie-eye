'use client'

import {
  Box,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { Filter, Shield, UsersRound } from 'lucide-react'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import type {
  CreateGroupFormValues,
  GroupSelectableUser,
  GroupStatus,
  GroupType,
  RuleMatchMode,
} from '@/src/types/user-management'
import { DynamicRulesEditor } from './dynamic-rules-editor'
import { InheritedRolesPicker } from './inherited-roles-picker'
import { StaticMembersPicker } from './static-members-picker'
import { groupTypeToggleSx, outlineFieldSx } from './add-group-modal.styles'

export interface AddGroupFormContentProps {
  form: CreateGroupFormValues
  selectableUsers: GroupSelectableUser[]
  disabled?: boolean
  onChange: <K extends keyof CreateGroupFormValues>(
    key: K,
    value: CreateGroupFormValues[K]
  ) => void
  onMatchModeChange: (mode: RuleMatchMode) => void
  onAddRule: () => void
  onUpdateRule: (id: string, patch: Partial<CreateGroupFormValues['rules'][0]>) => void
  onRemoveRule: (id: string) => void
  onToggleRole: (roleId: string) => void
  onToggleUser: (userId: string) => void
}

export function AddGroupFormContent({
  form,
  selectableUsers,
  disabled = false,
  onChange,
  onMatchModeChange,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  onToggleRole,
  onToggleUser,
}: AddGroupFormContentProps) {
  return (
    <>
      <EarthDialogSectionCard
        title="Basic information"
        icon={UsersRound}
        tooltip="Name, status, and description for this group"
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
          <DialogFormField label="Group name" htmlFor="group-name" required>
            <TextField
              id="group-name"
              fullWidth
              autoFocus
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={disabled}
              placeholder="e.g. EMEA Finance"
              sx={outlineFieldSx}
            />
          </DialogFormField>

          <DialogFormField label="Status" htmlFor="group-status">
            <Select
              id="group-status"
              fullWidth
              value={form.status}
              disabled={disabled}
              onChange={(e) => onChange('status', e.target.value as GroupStatus)}
              sx={outlineFieldSx}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </DialogFormField>

          <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
            <DialogFormField label="Description" htmlFor="group-description">
              <TextField
                id="group-description"
                fullWidth
                multiline
                minRows={2}
                value={form.description}
                onChange={(e) => onChange('description', e.target.value)}
                disabled={disabled}
                placeholder="What this group is for."
                sx={outlineFieldSx}
              />
            </DialogFormField>
          </Box>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <DialogFormField label="Group type" htmlFor="group-type">
            <ToggleButtonGroup
              exclusive
              id="group-type"
              value={form.groupType}
              onChange={(_, value: GroupType | null) => {
                if (value) onChange('groupType', value)
              }}
              disabled={disabled}
              fullWidth
              className="um-group-type-toggle"
              sx={groupTypeToggleSx}
            >
              <ToggleButton value="static">Static (manual)</ToggleButton>
              <ToggleButton value="dynamic">Dynamic (rules)</ToggleButton>
            </ToggleButtonGroup>
          </DialogFormField>
        </Box>
      </EarthDialogSectionCard>

      <EarthDialogSectionCard
        title={form.groupType === 'dynamic' ? 'Dynamic rules' : 'Manual members'}
        icon={Filter}
        tooltip={
          form.groupType === 'dynamic'
            ? 'Users are included when they match all or any of these rules'
            : 'Select users to include in this static group'
        }
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
      >
        {form.groupType === 'dynamic' ? (
          <DynamicRulesEditor
            form={form}
            disabled={disabled}
            onMatchModeChange={onMatchModeChange}
            onAddRule={onAddRule}
            onUpdateRule={onUpdateRule}
            onRemoveRule={onRemoveRule}
          />
        ) : (
          <StaticMembersPicker
            users={selectableUsers}
            selectedUserIds={form.selectedUserIds}
            onToggleUser={onToggleUser}
            disabled={disabled}
          />
        )}
      </EarthDialogSectionCard>

      <EarthDialogSectionCard
        title="Inherited roles"
        icon={Shield}
        tooltip="Members inherit these roles in addition to roles assigned directly"
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.secondary}
      >
        <InheritedRolesPicker
          selectedRoleIds={form.inheritedRoleIds}
          onToggleRole={onToggleRole}
          disabled={disabled}
        />
      </EarthDialogSectionCard>
    </>
  )
}
