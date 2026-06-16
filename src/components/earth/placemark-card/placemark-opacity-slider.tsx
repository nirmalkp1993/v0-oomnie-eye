'use client'

import { Opacity as OpacityIcon } from '@mui/icons-material'
import { Box, Slider, Tooltip } from '@mui/material'
import { sliderClasses } from '@mui/material/Slider'

export const placemarkOpacitySliderSx = {
  width: { xs: 72, sm: 96, md: 120 },
  flexShrink: 0,
  mx: 0.25,
  [`& .${sliderClasses.valueLabel}`]: {
    top: 'auto',
    bottom: -10,
    transform: 'translateY(100%) scale(0)',
    transformOrigin: 'top center',
  },
  [`& .${sliderClasses.valueLabel}.${sliderClasses.valueLabelOpen}`]: {
    transform: 'translateY(100%) scale(1)',
  },
} as const

export function PlacemarkOpacitySlider({
  value,
  onChange,
  onChangeCommitted,
  ariaLabel = 'Card background opacity',
}: {
  value: number
  onChange: (value: number) => void
  onChangeCommitted?: (value: number) => void
  ariaLabel?: string
}) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        flexShrink: 0,
        minHeight: 32,
      }}
    >
      <Tooltip title="Change opacity">
        <Box
          component="span"
          sx={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', color: 'text.secondary' }}
        >
          <OpacityIcon sx={{ fontSize: 20 }} aria-hidden />
        </Box>
      </Tooltip>
      <Slider
        size="small"
        value={value}
        min={0}
        max={100}
        onChange={(_, v) => onChange(v as number)}
        onChangeCommitted={(_, v) => (onChangeCommitted ?? onChange)(v as number)}
        valueLabelDisplay="auto"
        aria-label={ariaLabel}
        sx={placemarkOpacitySliderSx}
      />
    </Box>
  )
}
