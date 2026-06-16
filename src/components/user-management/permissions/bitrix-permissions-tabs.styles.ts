'use client'

import type { SxProps, Theme } from '@mui/material/styles'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'

/** Bitrix24-style sub-tabs for the permissions page */
export const bitrixPermissionsTabsSx: SxProps<Theme> = {
  borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
  mb: 0,
  minHeight: 40,
  '& .MuiTab-root': {
    minHeight: 40,
    fontSize: '0.8125rem',
    fontWeight: 400,
    fontFamily: BITRIX_ACCESS_UI.fontFamily,
    textTransform: 'none',
    py: 1,
    px: 2,
    color: `${BITRIX_ACCESS_UI.textPrimary} !important`,
    opacity: '1 !important',
    '& .MuiTab-iconWrapper': {
      marginRight: '6px',
      marginBottom: '0 !important',
    },
    '& .MuiSvgIcon-root': {
      fontSize: 17,
      color: 'inherit',
    },
    '&:hover': {
      color: `${BITRIX_ACCESS_UI.linkBlue} !important`,
      bgcolor: BITRIX_ACCESS_UI.sectionBg,
    },
    '&.Mui-selected': {
      color: `${BITRIX_ACCESS_UI.linkBlue} !important`,
      fontWeight: 600,
      bgcolor: 'transparent !important',
    },
  },
  '& .MuiTabs-indicator': {
    height: 2,
    backgroundColor: BITRIX_ACCESS_UI.primaryBlue,
  },
}
