'use client'

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import { CameraEarthTabPanel, cameraEarthTabsSx } from '@/components/camera/camera-earth-tab-panel'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import { Briefcase, UserRound } from 'lucide-react'
import { useDepartmentStore } from '@/lib/department-store'
import { useJobTitleStore } from '@/lib/job-title-store'
import { useOfficeStore } from '@/lib/office-store'
import { useTerritoryStore } from '@/lib/territory-store'
import { AppDialog, DialogFormField } from '@/src/components/modals/app-dialog'
import { DialogFormFooter } from '@/src/components/modals/dialog-form-footer'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { DepartmentHierarchySelect } from '@/src/components/user-management/department-hierarchy-select'
import { DepartmentManageModal } from '@/src/components/user-management/department-manage-modal'
import { JobTitleManageModal } from '@/src/components/user-management/job-title-manage-modal'
import { OfficeManageModal } from '@/src/components/user-management/office-manage-modal'
import { TerritoryManageModal } from '@/src/components/user-management/territory-manage-modal'
import { collectNestedPathOptions } from '@/src/lib/nested-tree-path-options'
import { JobTitleHierarchySelect } from '@/src/components/user-management/job-title-hierarchy-select'
import { OfficeHierarchySelect } from '@/src/components/user-management/office-hierarchy-select'
import { TerritoryHierarchySelect } from '@/src/components/user-management/territory-hierarchy-select'
import {
  DEFAULT_TENANT_NAME,
  INITIAL_CREATE_USER_FORM,
  SELECT_EMPTY_VALUE,
  USER_STATUS_FORM_OPTIONS,
} from '@/src/constants/add-user'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import {
  buildUserListItemFromForm,
  userToFormValues,
  validateCreateUserForm,
} from '@/src/lib/user-management/add-user-form.utils'
import { UserAuditTrailPanel } from '@/src/components/user-management/user-audit-trail-panel'
import { UserFormGroupsTab } from '@/src/components/user-management/user-form-groups-tab'
import { UserFormRolesTab } from '@/src/components/user-management/user-form-roles-tab'
import { isUserRetired } from '@/src/lib/user-management/user-lifecycle.utils'
import type { CreateUserFormValues, UserListItem } from '@/src/types/user-management'

export type UserFormTabId = 'profile' | 'roles' | 'groups' | 'audit'

function getUserFormTabs(mode: 'create' | 'edit' | 'view'): UserFormTabId[] {
  return mode === 'create'
    ? ['profile', 'roles', 'groups']
    : ['profile', 'roles', 'groups', 'audit']
}

interface UserFormModalProps {
  open: boolean
  mode: 'create' | 'edit' | 'view'
  initial?: UserListItem | null
  initialTab?: UserFormTabId
  onClose: () => void
  onSubmit: (user: UserListItem) => void
  onEditProfile?: (user: UserListItem) => void
  onRetireRequest?: () => void
  onDeleteRequest?: () => void
}

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

const MAX_AVATAR_BYTES = 8 * 1024 * 1024
const ACCEPT_AVATAR_IMAGE = 'image/jpeg,image/png,image/webp,image/gif'

export function UserFormModal({
  open,
  mode,
  initial,
  initialTab = 'profile',
  onClose,
  onSubmit,
  onEditProfile,
  onRetireRequest,
  onDeleteRequest,
}: UserFormModalProps) {
  const { showMessage } = useAdminSnackbar()
  const isView = mode === 'view' && initial != null
  const isEdit = mode === 'edit' && initial != null
  const readOnly = isView
  const [form, setForm] = useState<CreateUserFormValues>(INITIAL_CREATE_USER_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [departmentManageOpen, setDepartmentManageOpen] = useState(false)
  const [jobTitleManageOpen, setJobTitleManageOpen] = useState(false)
  const [territoryManageOpen, setTerritoryManageOpen] = useState(false)
  const [officeManageOpen, setOfficeManageOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<UserFormTabId>('profile')
  const avatarFileRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => {
    setForm(INITIAL_CREATE_USER_FORM)
    setAvatarError(null)
  }, [])

  useEffect(() => {
    if (!open) return
    if (initial) setForm(userToFormValues(initial))
    else reset()
    setDepartmentManageOpen(false)
    setJobTitleManageOpen(false)
    setTerritoryManageOpen(false)
    setOfficeManageOpen(false)
    setActiveTab(initialTab)
  }, [open, initial, initialTab, reset])

  useEffect(() => {
    if (mode === 'create' && activeTab === 'audit') {
      setActiveTab('profile')
    }
  }, [activeTab, mode])

  const syncDepartmentAfterTreeChange = useCallback(() => {
    const tree = useDepartmentStore.getState().tree
    const validLabels = new Set(collectNestedPathOptions(tree).map((option) => option.label))
    setForm((prev) => {
      if (!prev.department || prev.department === SELECT_EMPTY_VALUE) return prev
      if (validLabels.has(prev.department)) return prev
      return { ...prev, department: SELECT_EMPTY_VALUE }
    })
  }, [])

  const syncJobTitleAfterTreeChange = useCallback(() => {
    const tree = useJobTitleStore.getState().tree
    const validLabels = new Set(collectNestedPathOptions(tree).map((option) => option.label))
    setForm((prev) => {
      if (!prev.jobTitle || prev.jobTitle === SELECT_EMPTY_VALUE) return prev
      if (validLabels.has(prev.jobTitle)) return prev
      return { ...prev, jobTitle: SELECT_EMPTY_VALUE }
    })
  }, [])

  const syncTerritoryAfterTreeChange = useCallback(() => {
    const tree = useTerritoryStore.getState().tree
    const validLabels = new Set(collectNestedPathOptions(tree).map((option) => option.label))
    setForm((prev) => {
      if (!prev.territory || prev.territory === SELECT_EMPTY_VALUE) return prev
      if (validLabels.has(prev.territory)) return prev
      return { ...prev, territory: SELECT_EMPTY_VALUE }
    })
  }, [])

  const syncOfficeAfterTreeChange = useCallback(() => {
    const tree = useOfficeStore.getState().tree
    const validLabels = new Set(collectNestedPathOptions(tree).map((option) => option.label))
    setForm((prev) => {
      if (!prev.office || prev.office === SELECT_EMPTY_VALUE) return prev
      if (validLabels.has(prev.office)) return prev
      return { ...prev, office: SELECT_EMPTY_VALUE }
    })
  }, [])

  const update = <K extends keyof CreateUserFormValues>(key: K, value: CreateUserFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleClose = () => {
    if (!submitting) {
      reset()
      onClose()
    }
  }

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please choose a JPEG, PNG, WebP, or GIF file.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError('File is too large. Maximum size is 8 MB.')
      return
    }
    setAvatarError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        update('avatarUrl', result)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    update('avatarUrl', '')
    setAvatarError(null)
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

  const formTabs = getUserFormTabs(mode)
  const activeTabIndex = formTabs.indexOf(activeTab)
  const userIsRetired = initial != null && isUserRetired(initial)

  const dialogTitle = isView
    ? (initial?.name ?? 'View user')
    : isEdit
      ? 'Edit user'
      : 'Add user'

  const dialogDescription = isView
    ? (initial?.email ?? `${DEFAULT_TENANT_NAME} · User directory`)
    : `${DEFAULT_TENANT_NAME} · User directory`

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
    <>
    <AppDialog
      open={open}
      onClose={handleClose}
      title={dialogTitle}
      description={dialogDescription}
      icon={UserRound}
      maxWidth="5xl"
      footer={
        <DialogFormFooter
          isCreate={mode === 'create'}
          isEditing={!isView}
          onClose={handleClose}
          onEdit={
            onEditProfile && initial
              ? () => {
                  onEditProfile(initial)
                }
              : undefined
          }
          onSave={() => void handleSubmit()}
          onDelete={
            isEdit ? (userIsRetired ? onDeleteRequest : onRetireRequest) : undefined
          }
          deleteLabel={userIsRetired ? 'Delete user' : 'Retire user'}
          deleteIcon={userIsRetired ? <DeleteOutlineOutlinedIcon /> : <PersonOffOutlinedIcon />}
          deleteColor={userIsRetired ? 'error' : 'warning'}
          editLabel="Edit profile"
        />
      }
    >
      <Tabs
        value={activeTabIndex >= 0 ? activeTabIndex : 0}
        onChange={(_, idx) => {
          const id = formTabs[idx]
          if (id) setActiveTab(id)
        }}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ ...cameraEarthTabsSx, mx: -3, px: 3, mb: 0 }}
      >
        <Tab icon={<PersonOutlineOutlinedIcon />} label="Profile" iconPosition="start" />
        <Tab icon={<SecurityOutlinedIcon />} label="Roles" iconPosition="start" />
        <Tab icon={<GroupOutlinedIcon />} label="Groups" iconPosition="start" />
        {mode !== 'create' ? (
          <Tab icon={<HistoryOutlinedIcon />} label="Audit" iconPosition="start" />
        ) : null}
      </Tabs>

      <Box
        sx={{
          minHeight: 420,
          maxHeight: 'min(520px, 58vh)',
          overflow: 'auto',
          mx: -0.5,
          px: 0.5,
        }}
      >
        <CameraEarthTabPanel value={activeTabIndex} index={0}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2.5,
              alignItems: 'stretch',
              py: 1,
            }}
          >
        <EarthDialogSectionCard
          title="Identity"
          icon={UserRound}
          accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
          fullHeight
        >
          <Stack spacing={2.5}>
            <DialogFormField label="Profile image" htmlFor="avatarUpload">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                {form.avatarUrl ? (
                  <Avatar
                    src={form.avatarUrl}
                    alt={form.fullName || 'User profile'}
                    sx={{ width: 96, height: 96, border: '2px solid', borderColor: 'divider' }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      width: 96,
                      height: 96,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      border: '2px dashed',
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <UserRound size={40} strokeWidth={1.5} style={{ opacity: 0.4 }} />
                  </Box>
                )}
                {!readOnly ? (
                  <>
                    <input
                      ref={avatarFileRef}
                      id="avatarUpload"
                      type="file"
                      accept={ACCEPT_AVATAR_IMAGE}
                      hidden
                      onChange={handleAvatarFile}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUploadOutlinedIcon />}
                        onClick={() => avatarFileRef.current?.click()}
                        sx={{ textTransform: 'none' }}
                      >
                        {form.avatarUrl ? 'Change image' : 'Upload image'}
                      </Button>
                      {form.avatarUrl ? (
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineOutlinedIcon />}
                          onClick={removeAvatar}
                          sx={{ textTransform: 'none' }}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </Box>
                    {avatarError ? (
                      <Typography variant="caption" color="error" role="alert">
                        {avatarError}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        JPEG, PNG, WebP, or GIF · max 8 MB
                      </Typography>
                    )}
                  </>
                ) : null}
              </Box>
            </DialogFormField>
            <DialogFormField label="Full name" htmlFor="fullName" required>
              <TextField
                id="fullName"
                fullWidth
                autoFocus={!readOnly}
                disabled={readOnly}
                value={form.fullName}
                onChange={(e) => update('fullName', e.target.value)}
                sx={outlineFieldSx}
              />
            </DialogFormField>
            <DialogFormField label="Email" htmlFor="email" required>
              <TextField
                id="email"
                fullWidth
                type="email"
                disabled={readOnly}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                sx={outlineFieldSx}
              />
            </DialogFormField>
            <DialogFormField label="Phone" htmlFor="phone">
              <TextField
                id="phone"
                fullWidth
                disabled={readOnly}
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                sx={outlineFieldSx}
              />
            </DialogFormField>
            <DialogFormField label="Status" htmlFor="status">
              <Select
                id="status"
                fullWidth
                disabled={readOnly}
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
          </Stack>
        </EarthDialogSectionCard>

        <EarthDialogSectionCard
          title="Organization"
          icon={Briefcase}
          accentColor={EARTH_DIALOG_SECTION_ACCENTS.secondary}
          fullHeight
        >
          <Stack spacing={2.5}>
            <DialogFormField label="Department" htmlFor="department">
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <DepartmentHierarchySelect
                    id="department"
                    value={form.department}
                    onChange={(v) => update('department', v)}
                    fieldSx={outlineFieldSx}
                    disabled={readOnly}
                  />
                </Box>
                {!readOnly ? (
                  <Tooltip title="Manage departments">
                    <IconButton
                      type="button"
                      aria-label="Manage departments"
                      onClick={() => setDepartmentManageOpen(true)}
                      sx={{
                        mt: 0.25,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    >
                      <AccountTreeOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Box>
            </DialogFormField>
            <DialogFormField label="Job title" htmlFor="jobTitle">
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <JobTitleHierarchySelect
                    id="jobTitle"
                    value={form.jobTitle}
                    onChange={(v) => update('jobTitle', v)}
                    fieldSx={outlineFieldSx}
                    disabled={readOnly}
                  />
                </Box>
                {!readOnly ? (
                  <Tooltip title="Manage job titles">
                    <IconButton
                      type="button"
                      aria-label="Manage job titles"
                      onClick={() => setJobTitleManageOpen(true)}
                      sx={{
                        mt: 0.25,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    >
                      <AccountTreeOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Box>
            </DialogFormField>
            <DialogFormField label="Territory" htmlFor="territory">
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <TerritoryHierarchySelect
                    id="territory"
                    value={form.territory}
                    onChange={(v) => update('territory', v)}
                    fieldSx={outlineFieldSx}
                    disabled={readOnly}
                  />
                </Box>
                {!readOnly ? (
                  <Tooltip title="Manage territories">
                    <IconButton
                      type="button"
                      aria-label="Manage territories"
                      onClick={() => setTerritoryManageOpen(true)}
                      sx={{
                        mt: 0.25,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    >
                      <AccountTreeOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Box>
            </DialogFormField>
            <DialogFormField label="Office" htmlFor="office">
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <OfficeHierarchySelect
                    id="office"
                    value={form.office}
                    onChange={(v) => update('office', v)}
                    fieldSx={outlineFieldSx}
                    disabled={readOnly}
                  />
                </Box>
                {!readOnly ? (
                  <Tooltip title="Manage offices">
                    <IconButton
                      type="button"
                      aria-label="Manage offices"
                      onClick={() => setOfficeManageOpen(true)}
                      sx={{
                        mt: 0.25,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    >
                      <AccountTreeOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : null}
              </Box>
            </DialogFormField>
          </Stack>
        </EarthDialogSectionCard>
          </Box>
        </CameraEarthTabPanel>

        <CameraEarthTabPanel value={activeTabIndex} index={1}>
          <Box sx={{ py: 1 }}>
            <UserFormRolesTab
              roleId={form.roleId}
              onRoleChange={(id) => update('roleId', id)}
              readOnly={readOnly}
            />
          </Box>
        </CameraEarthTabPanel>

        <CameraEarthTabPanel value={activeTabIndex} index={2}>
          <Box sx={{ py: 1 }}>
            <UserFormGroupsTab
              groupIds={form.groupIds}
              onGroupIdsChange={(ids) => update('groupIds', ids)}
              readOnly={readOnly}
            />
          </Box>
        </CameraEarthTabPanel>

        {mode !== 'create' ? (
          <CameraEarthTabPanel value={activeTabIndex} index={3}>
            <Box sx={{ py: 1 }}>
              <UserAuditTrailPanel userId={initial?.id ?? null} />
            </Box>
          </CameraEarthTabPanel>
        ) : null}
      </Box>
    </AppDialog>

    <DepartmentManageModal
      open={open && departmentManageOpen}
      onClose={() => setDepartmentManageOpen(false)}
      onTreeChanged={syncDepartmentAfterTreeChange}
    />

    <JobTitleManageModal
      open={open && jobTitleManageOpen}
      onClose={() => setJobTitleManageOpen(false)}
      onTreeChanged={syncJobTitleAfterTreeChange}
    />

    <TerritoryManageModal
      open={open && territoryManageOpen}
      onClose={() => setTerritoryManageOpen(false)}
      onTreeChanged={syncTerritoryAfterTreeChange}
    />

    <OfficeManageModal
      open={open && officeManageOpen}
      onClose={() => setOfficeManageOpen(false)}
      onTreeChanged={syncOfficeAfterTreeChange}
    />
    </>
  )
}
