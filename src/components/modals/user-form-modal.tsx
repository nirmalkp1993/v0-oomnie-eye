'use client'

import PersonIcon from '@mui/icons-material/Person'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { GeoLocationTree } from '@/src/components/user-management/geo-location-tree'
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
  onClose: () => void
  onSubmit: (payload: UserFormSubmitPayload) => void
}

const groupOptions = MOCK_GROUPS.map((g) => ({ id: g.id, label: g.groupName }))

export function UserFormModal({ open, mode, initial, onClose, onSubmit }: UserFormModalProps) {
  const [geoSelected, setGeoSelected] = useState<Set<string>>(new Set())
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const labelsByGeoId = useMemo(() => geoLabelMap(GEO_TREE_ROOT), [])

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
    }
  }, [open, initial, isCreate, reset])

  useEffect(() => {
    if (!open) {
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }, [open])

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <PersonIcon color="primary" sx={{ fontSize: 30 }} aria-hidden />
        <Typography component="span" variant="h6" fontWeight={700}>
          {isCreate ? 'Add user' : 'Edit user'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="userName"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="User Name" fullWidth error={Boolean(errors.userName)} helperText={errors.userName?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Email" fullWidth error={Boolean(errors.email)} helperText={errors.email?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Age" type="number" fullWidth error={Boolean(errors.age)} helperText={errors.age?.message} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="mobileNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mobile Number"
                  fullWidth
                  error={Boolean(errors.mobileNumber)}
                  helperText={errors.mobileNumber?.message}
                />
              )}
            />
          </Grid>
          {isCreate ? (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      fullWidth
                      error={Boolean((errors as Record<string, { message?: string }>).password)}
                      helperText={(errors as { password?: { message?: string } }).password?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="button"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                edge="end"
                                size="small"
                                onClick={() => setShowPassword((v) => !v)}
                              >
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      fullWidth
                      error={Boolean((errors as { confirmPassword?: unknown }).confirmPassword)}
                      helperText={(errors as { confirmPassword?: { message?: string } }).confirmPassword?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="button"
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                edge="end"
                                size="small"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                              >
                                {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </>
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      label="New password (optional)"
                      fullWidth
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="button"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                edge="end"
                                size="small"
                                onClick={() => setShowPassword((v) => !v)}
                              >
                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm new password"
                      fullWidth
                      error={Boolean((errors as { confirmPassword?: unknown }).confirmPassword)}
                      helperText={(errors as { confirmPassword?: { message?: string } }).confirmPassword?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                type="button"
                                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                edge="end"
                                size="small"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                              >
                                {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.role)}>
                  <InputLabel id="role-label">Select Role</InputLabel>
                  <Select labelId="role-label" label="Select Role" {...field}>
                    {MOCK_ROLE_OPTIONS.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.role ? <FormHelperText>{errors.role.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="groupIds"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  multiple
                  options={groupOptions}
                  getOptionLabel={(o) => o.label}
                  value={groupOptions.filter((g) => field.value.includes(g.id))}
                  onChange={(_, v) => field.onChange(v.map((x) => x.id))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Groups"
                      error={Boolean(errors.groupIds)}
                      helperText={(errors.groupIds as { message?: string } | undefined)?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel id="status-label">Account status</InputLabel>
                  <Select labelId="status-label" label="Account status" {...field}>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} component="span" sx={{ mr: 0.5 }}>
                Select Geo Location
              </Typography>
              {[...geoSelected].map((id) => {
                const label = labelsByGeoId[id]
                if (!label) return null
                return (
                  <Chip
                    key={id}
                    size="small"
                    color="primary"
                    variant="filled"
                    label={label}
                    onDelete={() => {
                      setGeoSelected((prev) => {
                        const next = new Set(prev)
                        next.delete(id)
                        return next
                      })
                    }}
                  />
                )
              })}
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Use the tree chevrons to expand regions. Click a location to add or remove it; selected places appear
              as tags above.
            </Typography>
            <GeoLocationTree root={GEO_TREE_ROOT} selectedIds={geoSelected} onChange={setGeoSelected} />
          </Grid>
        </Grid>
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
