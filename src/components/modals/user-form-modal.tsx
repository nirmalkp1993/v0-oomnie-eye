'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronDown,
  Eye,
  EyeOff,
  Info,
  Lock,
  MapPin,
  Pencil,
  Shield,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Box, Button as MuiButton } from '@mui/material'
import { Button } from '@/components/ui/button'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AppDialog, DialogFormField, DIALOG_INPUT_CLASS } from '@/src/components/modals/app-dialog'
import { DialogEarthTabs, TabsContent, type DialogEarthTabConfig } from '@/src/components/modals/dialog-earth-tabs'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { GeoLocationSelector } from '@/src/components/user-management/GeoLocationSelector'
import {
  GeoLocationPreviewMap,
  type GeoMapFocusTarget,
  type GeoMapPin,
} from '@/src/components/user-management/geo-location-preview-map'
import { getGeoCoordinates } from '@/src/mock-data/geo-coordinates'
import { GEO_TREE_ROOT } from '@/src/mock-data/geo-tree'
import { MOCK_GROUPS } from '@/src/mock-data/groups'
import { MOCK_ROLE_OPTIONS } from '@/src/mock-data/users'
import type { UserRow } from '@/src/types/user-management'
import { geoLabelMap } from '@/src/utils/geo-labels'
import {
  userCreateFormSchema,
  userEditFormSchema,
  type UserCreateFormValues,
  type UserEditFormValues,
} from '@/src/utils/validation'

type Mode = 'create' | 'edit'

export type UserFormTab = 'basic' | 'security' | 'access' | 'location'

export interface UserFormSubmitPayload {
  userName: string
  email: string
  age: number
  mobileNumber: string
  role: string
  groupLabels: string[]
  status: UserRow['status']
  locationLabel: string
  password?: string
}

interface UserFormModalProps {
  open: boolean
  mode: Mode
  initial?: UserRow | null
  initialTab?: UserFormTab
  initialFocus?: 'role' | 'groups'
  onClose: () => void
  onSubmit: (payload: UserFormSubmitPayload) => void
  onDeleteRequest?: () => void
}

const groupOptions = MOCK_GROUPS.map((g) => ({ id: g.id, label: g.groupName }))

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  show,
  onToggleShow,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  show: boolean
  onToggleShow: () => void
}) {
  return (
    <DialogFormField label={label} htmlFor={id} error={error}>
      <InputGroup className={cn('border-border bg-input', error && 'border-destructive')}>
        <InputGroupInput
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-foreground"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={onToggleShow}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </DialogFormField>
  )
}

const DIALOG_SELECT_CLASS = cn('w-full', DIALOG_INPUT_CLASS)

export function UserFormModal({
  open,
  mode,
  initial,
  initialTab = 'basic',
  initialFocus,
  onClose,
  onSubmit,
  onDeleteRequest,
}: UserFormModalProps) {
  const [activeTab, setActiveTab] = useState<UserFormTab>('basic')
  const [geoSelected, setGeoSelected] = useState<Set<string>>(new Set())
  const [geoMapFocus, setGeoMapFocus] = useState<{ id: string; name: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [groupsOpen, setGroupsOpen] = useState(false)
  const labelsByGeoId = useMemo(() => geoLabelMap(GEO_TREE_ROOT), [])

  const geoMapPins = useMemo((): GeoMapPin[] => {
    return [...geoSelected]
      .map((id) => {
        const coord = getGeoCoordinates(id)
        const name = labelsByGeoId[id]
        if (!coord || !name) return null
        return {
          id,
          name,
          latitude: coord.latitude,
          longitude: coord.longitude,
        }
      })
      .filter((p): p is GeoMapPin => p !== null)
  }, [geoSelected, labelsByGeoId])

  const geoMapFocusTarget = useMemo((): GeoMapFocusTarget | null => {
    if (!geoMapFocus) return null
    const coord = getGeoCoordinates(geoMapFocus.id)
    if (!coord) return null
    return {
      id: geoMapFocus.id,
      name: geoMapFocus.name,
      latitude: coord.latitude,
      longitude: coord.longitude,
      zoom: coord.zoom,
    }
  }, [geoMapFocus])

  const isCreate = mode === 'create'
  const resolver = useMemo(
    () => zodResolver(isCreate ? userCreateFormSchema : userEditFormSchema),
    [isCreate]
  )

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserCreateFormValues | UserEditFormValues>({
    resolver,
    defaultValues: {
      userName: '',
      email: '',
      age: 28,
      mobileNumber: '',
      password: '',
      confirmPassword: '',
      role: '',
      groupIds: [],
      status: 'Active',
      locationLabel: '',
    },
  })

  useEffect(() => {
    if (!open) return
    if (initial && !isCreate) {
      const matched = groupOptions.filter((g) => initial.group.split(',').map((s) => s.trim()).includes(g.label))
      reset({
        userName: initial.userName,
        email: initial.email,
        age: initial.age,
        mobileNumber: initial.mobileNumber,
        password: '',
        confirmPassword: '',
        role: initial.role,
        groupIds: matched.map((g) => g.id),
        status: initial.status,
        locationLabel: initial.location,
      })
      setGeoSelected(new Set())
      setGeoMapFocus(null)
    } else if (isCreate) {
      reset({
        userName: '',
        email: '',
        age: 28,
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        role: MOCK_ROLE_OPTIONS[1] ?? '',
        groupIds: [],
        status: 'Active',
        locationLabel: '',
      })
      setGeoSelected(new Set())
      setGeoMapFocus(null)
    }
    const tab = initialFocus ? 'access' : initialTab
    setActiveTab(tab)
  }, [open, initial, isCreate, reset, initialTab, initialFocus])

  useEffect(() => {
    if (!open) {
      setShowPassword(false)
      setShowConfirmPassword(false)
      setGroupsOpen(false)
    }
  }, [open])

  useEffect(() => {
    if (!open || !initialFocus) return
    if (initialFocus === 'groups') {
      setActiveTab('access')
      setGroupsOpen(true)
      return
    }
    setActiveTab('access')
    const t = window.setTimeout(() => {
      document.querySelector('[data-initial-focus="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
    return () => window.clearTimeout(t)
  }, [open, initialFocus])

  const submit = handleSubmit((values) => {
    const groupLabels = groupOptions.filter((g) => values.groupIds.includes(g.id)).map((g) => g.label)
    const geoLabels = [...geoSelected].map((id) => labelsByGeoId[id]).filter(Boolean)
    const locationLabel =
      geoLabels.length > 0 ? geoLabels.join(', ') : values.locationLabel || initial?.location || ''

    onSubmit({
      userName: values.userName,
      email: values.email,
      age: values.age,
      mobileNumber: values.mobileNumber,
      role: values.role,
      groupLabels,
      status: values.status,
      locationLabel,
      password: isCreate ? (values as UserCreateFormValues).password : (values as UserEditFormValues).password || undefined,
    })
  })

  const passwordErrors = errors as {
    password?: { message?: string }
    confirmPassword?: { message?: string }
  }

  const tabs = useMemo(
    (): DialogEarthTabConfig[] => [
      { value: 'basic', label: 'Basic info', icon: Pencil },
      { value: 'security', label: 'Security', icon: Lock },
      { value: 'access', label: 'Access', icon: Shield },
      { value: 'location', label: 'Location', icon: MapPin },
    ],
    []
  )

  const dialogFooter = (
    <>
      {!isCreate && onDeleteRequest ? (
        <MuiButton type="button" variant="contained" color="error" sx={{ mr: 'auto' }} onClick={onDeleteRequest}>
          Delete user
        </MuiButton>
      ) : (
        <span className="mr-auto" />
      )}
      <MuiButton type="button" variant="outlined" onClick={onClose}>
        Cancel
      </MuiButton>
      <MuiButton type="button" variant="contained" onClick={submit}>
        Save
      </MuiButton>
    </>
  )

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isCreate ? 'Add user' : initial ? `User — ${initial.userName}` : 'Edit user'}
      icon={UserRound}
      maxWidth="4xl"
      footer={dialogFooter}
    >
      <DialogEarthTabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as UserFormTab)}
        tabs={tabs}
        contentClassName="max-h-[min(480px,55vh)]"
      >
        <TabsContent value="basic" className="mt-0">
          <EarthDialogSectionCard
            title="Basic information"
            icon={Pencil}
            tooltip="Account identity and contact details"
            accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="userName"
                control={control}
                render={({ field }) => (
                  <DialogFormField label="User Name" htmlFor="userName" error={errors.userName?.message} required>
                    <Input id="userName" {...field} className={DIALOG_INPUT_CLASS} />
                  </DialogFormField>
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <DialogFormField label="Email" htmlFor="email" error={errors.email?.message} required>
                    <Input id="email" type="email" {...field} className={DIALOG_INPUT_CLASS} />
                  </DialogFormField>
                )}
              />
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <DialogFormField label="Age" htmlFor="age" error={errors.age?.message}>
                    <Input
                      id="age"
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                      className={DIALOG_INPUT_CLASS}
                    />
                  </DialogFormField>
                )}
              />
              <Controller
                name="mobileNumber"
                control={control}
                render={({ field }) => (
                  <DialogFormField label="Mobile Number" htmlFor="mobileNumber" error={errors.mobileNumber?.message}>
                    <Input id="mobileNumber" {...field} className={DIALOG_INPUT_CLASS} />
                  </DialogFormField>
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <DialogFormField label="Account status">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={DIALOG_SELECT_CLASS}>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card">
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </DialogFormField>
                )}
              />
            </div>
          </EarthDialogSectionCard>
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <EarthDialogSectionCard
            title={isCreate ? 'Account security' : 'Change password'}
            icon={Lock}
            tooltip={isCreate ? 'Set the initial login password' : 'Optional — leave blank to keep current password'}
            accentColor={EARTH_DIALOG_SECTION_ACCENTS.warning}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {isCreate ? (
                <>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <PasswordField
                        id="password"
                        label="Password"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        error={passwordErrors.password?.message}
                        show={showPassword}
                        onToggleShow={() => setShowPassword((v) => !v)}
                      />
                    )}
                  />
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <PasswordField
                        id="confirmPassword"
                        label="Confirm Password"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        error={passwordErrors.confirmPassword?.message}
                        show={showConfirmPassword}
                        onToggleShow={() => setShowConfirmPassword((v) => !v)}
                      />
                    )}
                  />
                </>
              ) : (
                <>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <PasswordField
                        id="editPassword"
                        label="New password (optional)"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        show={showPassword}
                        onToggleShow={() => setShowPassword((v) => !v)}
                      />
                    )}
                  />
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <PasswordField
                        id="editConfirmPassword"
                        label="Confirm new password"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        error={passwordErrors.confirmPassword?.message}
                        show={showConfirmPassword}
                        onToggleShow={() => setShowConfirmPassword((v) => !v)}
                      />
                    )}
                  />
                </>
              )}
            </div>
            {!isCreate ? (
              <p className="mt-3 text-sm text-muted-foreground">Leave blank to keep the current password.</p>
            ) : null}
          </EarthDialogSectionCard>
        </TabsContent>

        <TabsContent value="access" className="mt-0">
          <EarthDialogSectionCard
            title="Role & groups"
            icon={Shield}
            tooltip="Role assignment and group membership"
            accentColor={EARTH_DIALOG_SECTION_ACCENTS.secondary}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <DialogFormField label="Select Role" error={errors.role?.message} required>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={DIALOG_SELECT_CLASS}
                        data-initial-focus={initialFocus === 'role' ? 'true' : undefined}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-card">
                        {MOCK_ROLE_OPTIONS.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DialogFormField>
                )}
              />
              <Controller
                name="groupIds"
                control={control}
                render={({ field }) => {
                  const selected = groupOptions.filter((g) => field.value.includes(g.id))
                  const label =
                    selected.length === 0
                      ? 'Select groups'
                      : selected.length <= 2
                        ? selected.map((g) => g.label).join(', ')
                        : `${selected.length} groups selected`

                  return (
                    <DialogFormField
                      label="Select Groups"
                      error={(errors.groupIds as { message?: string } | undefined)?.message}
                    >
                      <Popover open={groupsOpen} onOpenChange={setGroupsOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn('w-full justify-between border-border font-normal', DIALOG_INPUT_CLASS)}
                          >
                            <span className="truncate text-left">{label}</span>
                            <ChevronDown className="size-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] border-border bg-card p-2"
                          align="start"
                        >
                          <div className="max-h-48 space-y-1 overflow-y-auto">
                            {groupOptions.map((g) => {
                              const checked = field.value.includes(g.id)
                              return (
                                <label
                                  key={g.id}
                                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(v) => {
                                      const next = v
                                        ? [...field.value, g.id]
                                        : field.value.filter((id) => id !== g.id)
                                      field.onChange(next)
                                    }}
                                  />
                                  {g.label}
                                </label>
                              )
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </DialogFormField>
                  )
                }}
              />
            </div>
          </EarthDialogSectionCard>
        </TabsContent>

        <TabsContent value="location" className="mt-0">
          <EarthDialogSectionCard
            title="Geographic assignment"
            icon={MapPin}
            tooltip="Assign geographic regions for this user"
            accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <GeoLocationSelector
                root={GEO_TREE_ROOT}
                selectedIds={geoSelected}
                onChange={setGeoSelected}
                onLocationFocus={setGeoMapFocus}
                titleClassName="text-accent"
              />
              <GeoLocationPreviewMap focusTarget={geoMapFocusTarget} pins={geoMapPins} />
            </div>
          </EarthDialogSectionCard>
        </TabsContent>
      </DialogEarthTabs>
    </AppDialog>
  )
}
