import type { SxProps, Theme } from '@mui/material/styles'

export const outlineFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: (theme) =>
      theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.action.hover,
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: 'text.disabled' },
    '&.Mui-focused fieldset': { borderWidth: 1 },
  },
}

export const fieldLabelSx: SxProps<Theme> = {
  display: 'block',
  mb: 0.75,
  fontWeight: 500,
  fontSize: '0.875rem',
  color: 'text.primary',
  lineHeight: 1.4,
}

export const sectionTitleSx: SxProps<Theme> = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'text.secondary',
  mb: 0.75,
}

export const groupTypeToggleSx: SxProps<Theme> = {
  bgcolor: 'action.hover',
  borderRadius: 2,
  p: 0.5,
  '& .MuiToggleButton-root': {
    flex: 1,
    textTransform: 'none',
    fontWeight: 600,
    border: 'none',
    borderRadius: 1.5,
    py: 1,
    color: (theme) => `${theme.palette.text.secondary} !important`,
    backgroundColor: 'transparent !important',
    '&:hover': {
      backgroundColor: (theme) =>
        `${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)'} !important`,
      color: (theme) => `${theme.palette.text.primary} !important`,
      transform: 'none',
      boxShadow: 'none',
      filter: 'none',
    },
    '&.Mui-selected': {
      backgroundColor: (theme) => `${theme.palette.background.paper} !important`,
      color: (theme) => `${theme.palette.text.primary} !important`,
      boxShadow: (theme) =>
        theme.palette.mode === 'light' ? '0 1px 3px rgba(15, 23, 42, 0.12)' : theme.shadows[2],
      '&:hover': {
        backgroundColor: (theme) => `${theme.palette.background.paper} !important`,
        color: (theme) => `${theme.palette.text.primary} !important`,
        filter: 'none',
        transform: 'none',
      },
    },
  },
}

export const roleCardSx = (selected: boolean): SxProps<Theme> => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.5,
  p: 1.75,
  borderRadius: 2,
  border: '1px solid',
  borderColor: selected ? 'primary.main' : 'divider',
  bgcolor: 'background.paper',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
  font: 'inherit',
  color: 'inherit',
  transition: (theme) =>
    theme.transitions.create(['border-color', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
  '&:hover': {
    borderColor: selected ? 'primary.main' : 'text.disabled',
    bgcolor: 'action.hover',
  },
})
