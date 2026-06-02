import type { SxProps, Theme } from '@mui/material/styles'

export const modalTitleRootSx: SxProps<Theme> = {
  pb: 2,
  pt: { xs: 2.5, sm: 3 },
  px: { xs: 2.5, sm: 3 },
  pr: { xs: 2, sm: 2.5 },
}

export const modalTitleRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 2,
}

export const modalTitleTextSx: SxProps<Theme> = (theme) => ({
  ...theme.typography.h5,
})

export const modalSubtitleTextSx: SxProps<Theme> = (theme) => ({
  ...theme.typography.body2,
  mt: 0.5,
  display: 'block',
})

export const modalCloseButtonSx: SxProps<Theme> = {
  mt: -0.5,
  flexShrink: 0,
  color: 'text.secondary',
  '&:hover': {
    color: 'text.primary',
    bgcolor: 'action.hover',
  },
}
