'use client'

import {
  Close as CloseIcon,
  LocationOn as LocationOnIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { PLACEMARK_HEADER_GRADIENT } from './placemark-card-constants'
import { PlacemarkOpacitySlider } from './placemark-opacity-slider'

export type PlacemarkCardHeaderMode = 'preview' | 'edit' | 'view'

export function PlacemarkCardHeader({
  title,
  mode,
  cardBackgroundOpacity,
  onOpacityChange,
  onOpacityCommit,
  placesAutoOpen,
  onPlacesAutoOpenChange,
  onClose,
  showUnsavedChip = false,
  subtitle,
  placesAutoOpenDisabled = false,
}: {
  title: string
  mode: PlacemarkCardHeaderMode
  cardBackgroundOpacity: number
  onOpacityChange: (value: number) => void
  onOpacityCommit: (value: number) => void
  placesAutoOpen: boolean
  onPlacesAutoOpenChange: (checked: boolean) => void
  onClose: () => void
  showUnsavedChip?: boolean
  subtitle?: string
  placesAutoOpenDisabled?: boolean
}) {
  const gradient =
    mode === 'preview'
      ? PLACEMARK_HEADER_GRADIENT.preview
      : mode === 'view'
        ? PLACEMARK_HEADER_GRADIENT.viewing
        : PLACEMARK_HEADER_GRADIENT.edit

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        rowGap: 1.25,
        columnGap: 2,
        minWidth: 0,
        pb: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '1 1 200px', minWidth: 0 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LocationOnIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" component="div" noWrap>
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, display: 'block', lineHeight: 1.4, whiteSpace: 'normal' }}
            >
              {subtitle}
            </Typography>
          ) : null}
          {showUnsavedChip ? (
            <Chip label="Unsaved Changes" size="small" color="warning" sx={{ mt: 0.5 }} />
          ) : null}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: { xs: 0.5, sm: 1 },
          flex: { xs: '1 1 100%', sm: '0 1 auto' },
          minWidth: 0,
          ml: { xs: 0, sm: 'auto' },
          justifyContent: 'flex-end',
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        <PlacemarkOpacitySlider
          value={cardBackgroundOpacity}
          onChange={onOpacityChange}
          onChangeCommitted={onOpacityCommit}
          ariaLabel="Placemark card background opacity"
        />
        <Tooltip title="Auto-open placemark card when choosing from Places panel">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: { xs: 'none', md: 'inline' },
                whiteSpace: 'nowrap',
                maxWidth: 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Places auto-open
            </Typography>
            <Switch
              size="small"
              checked={placesAutoOpen}
              disabled={placesAutoOpenDisabled}
              onChange={(_, checked) => onPlacesAutoOpenChange(checked)}
              inputProps={{ 'aria-label': 'Places auto-open' }}
            />
          </Box>
        </Tooltip>
        <Tooltip title="Default pin values">
          <IconButton size="small" sx={{ flexShrink: 0, color: 'text.secondary' }} aria-label="Pin default settings">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton onClick={onClose} size="small" sx={{ flexShrink: 0, color: 'text.secondary' }} aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}
