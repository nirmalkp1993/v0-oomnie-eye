'use client'

import { useEffect, useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import SearchIcon from '@mui/icons-material/Search'
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useOfficeStore } from '@/lib/office-store'
import { DialogFormField } from '@/src/components/modals/app-dialog'
import {
  isOfficeAddressComplete,
  isOfficeNameComplete,
} from '@/src/lib/office-address.utils'
import {
  getOfficeCityOptionsForState,
  getOfficeCountryOptions,
  getOfficeStateOptionsForCountry,
} from '@/src/mock-data/office-location-options'
import { EMPTY_OFFICE_ADDRESS, EMPTY_OFFICE_NAME, type OfficeAddress } from '@/src/types/office'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'

const FORM_DIALOG_WIDTH_PX = 560

const responsiveModalWidthSx = (widthPx: number) =>
  ({
    width: { xs: 'calc(100vw - 32px)', sm: widthPx },
    maxWidth: 'calc(100vw - 32px)',
  }) as const

const outlineFieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 2 },
} as const

function SearchableLocationField({
  label,
  htmlFor,
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string
  htmlFor: string
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const theme = useTheme()

  return (
    <DialogFormField label={label} htmlFor={htmlFor} required>
      <Autocomplete
        id={htmlFor}
        fullWidth
        options={options}
        value={value || null}
        disabled={disabled}
        openOnFocus
        onChange={(_, nextValue) => onChange(nextValue ?? '')}
        isOptionEqualToValue={(option, selected) => option === selected}
        noOptionsText="No matches"
        slotProps={{
          popper: {
            sx: { zIndex: theme.zIndex.modal + 10 },
          },
          listbox: {
            sx: { maxHeight: 240 },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            placeholder={placeholder}
            sx={outlineFieldSx}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
            }}
          />
        )}
      />
    </DialogFormField>
  )
}

export interface CreateOfficeDialogProps {
  open: boolean
  onClose: () => void
  onCreated?: (officeId: string) => void
}

export function CreateOfficeDialog({ open, onClose, onCreated }: CreateOfficeDialogProps) {
  const theme = useTheme()
  const { showMessage } = useAdminSnackbar()
  const createRoot = useOfficeStore((state) => state.createRoot)

  const [officeNameInput, setOfficeNameInput] = useState(EMPTY_OFFICE_NAME)
  const [addressInput, setAddressInput] = useState<OfficeAddress>({ ...EMPTY_OFFICE_ADDRESS })

  const setAddressField = <K extends keyof OfficeAddress>(field: K, value: string) => {
    setAddressInput((current) => {
      const next = { ...current, [field]: value }
      if (field === 'country') {
        next.state = ''
        next.city = ''
      }
      if (field === 'state') {
        next.city = ''
      }
      return next
    })
  }

  const countryOptions = useMemo(
    () => getOfficeCountryOptions(addressInput.country),
    [addressInput.country],
  )
  const stateOptions = useMemo(
    () => getOfficeStateOptionsForCountry(addressInput.country, addressInput.state),
    [addressInput.country, addressInput.state],
  )
  const cityOptions = useMemo(
    () => getOfficeCityOptionsForState(addressInput.state, addressInput.city),
    [addressInput.state, addressInput.city],
  )

  useEffect(() => {
    if (!open) {
      setOfficeNameInput(EMPTY_OFFICE_NAME)
      setAddressInput({ ...EMPTY_OFFICE_ADDRESS })
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!open) return null

  const canSave =
    isOfficeNameComplete(officeNameInput) && isOfficeAddressComplete(addressInput)

  const handleSave = () => {
    if (!isOfficeNameComplete(officeNameInput)) {
      showMessage('Enter an office name', 'warning')
      return
    }
    if (!isOfficeAddressComplete(addressInput)) {
      showMessage('Fill in all address fields', 'warning')
      return
    }

    const id = createRoot(officeNameInput, addressInput)
    if (!id) {
      showMessage('Could not add office — this address may already exist', 'warning')
      return
    }
    showMessage('Office added', 'success')
    onCreated?.(id)
    onClose()
  }

  return (
    <Dialog
      open
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') onClose()
      }}
      maxWidth={false}
      slotProps={{
        backdrop: { sx: { bgcolor: alpha(theme.palette.common.black, 0.45) } },
      }}
      PaperProps={{
        sx: {
          ...responsiveModalWidthSx(FORM_DIALOG_WIDTH_PX),
          m: 2,
          borderRadius: 2,
          overflow: 'hidden',
          maxHeight: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      sx={{ zIndex: (t) => t.zIndex.modal + 4 }}
    >
      <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h3" sx={{ color: 'warning.main', fontWeight: 600 }}>
          Add root office
        </Typography>
      </Box>

      <Box sx={{ px: 2.5, py: 2, overflowY: 'auto', flex: 1, minHeight: 0 }}>
        <Stack spacing={2}>
          <DialogFormField label="Office name" htmlFor="createOfficeName" required>
            <TextField
              id="createOfficeName"
              fullWidth
              autoFocus
              value={officeNameInput}
              onChange={(e) => setOfficeNameInput(e.target.value)}
              placeholder="Enter office name"
              sx={outlineFieldSx}
            />
          </DialogFormField>

          <DialogFormField label="Address line" htmlFor="createOfficeAddressLine" required>
            <TextField
              id="createOfficeAddressLine"
              fullWidth
              value={addressInput.addressLine}
              onChange={(e) => setAddressField('addressLine', e.target.value)}
              placeholder="Building, street, area"
              sx={outlineFieldSx}
            />
          </DialogFormField>

          <SearchableLocationField
            label="Country"
            htmlFor="createOfficeCountry"
            options={countryOptions}
            value={addressInput.country}
            onChange={(value) => setAddressField('country', value)}
            placeholder="Search country…"
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <SearchableLocationField
              label="State"
              htmlFor="createOfficeState"
              options={stateOptions}
              value={addressInput.state}
              onChange={(value) => setAddressField('state', value)}
              placeholder={addressInput.country ? 'Search state…' : 'Select country first'}
              disabled={!addressInput.country}
            />

            <SearchableLocationField
              label="City"
              htmlFor="createOfficeCity"
              options={cityOptions}
              value={addressInput.city}
              onChange={(value) => setAddressField('city', value)}
              placeholder={addressInput.state ? 'Search city…' : 'Select state first'}
              disabled={!addressInput.state}
            />
          </Box>

          <DialogFormField label="Pincode" htmlFor="createOfficePincode" required>
            <TextField
              id="createOfficePincode"
              fullWidth
              value={addressInput.pincode}
              onChange={(e) => setAddressField('pincode', e.target.value)}
              placeholder="Pincode"
              inputProps={{ inputMode: 'numeric' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSave) handleSave()
              }}
              sx={outlineFieldSx}
            />
          </DialogFormField>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          px: 2.5,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<CloseIcon />}
          onClick={onClose}
          sx={{ textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          disabled={!canSave}
          sx={{ textTransform: 'none' }}
        >
          Add office
        </Button>
      </Box>
    </Dialog>
  )
}
