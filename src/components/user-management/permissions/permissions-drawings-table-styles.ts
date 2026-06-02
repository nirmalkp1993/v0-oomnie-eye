'use client'

import type { SxProps, Theme } from '@mui/material/styles'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsBodyPrimaryTypographySx,
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsHeaderTypographySx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
  myDrawingsTableSx,
} from '@/src/components/tables/my-drawings-table-styles'

export {
  MY_DRAWINGS_TABLE,
  myDrawingsBodyPrimaryTypographySx,
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsHeaderTypographySx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
  myDrawingsTableSx,
}

/** Sticky first column — permission matrix / field matrix */
export const permissionsStickyModuleHeaderSx: SxProps<Theme> = {
  ...myDrawingsTableCellSx,
  position: 'sticky',
  left: 0,
  zIndex: 103,
  bgcolor: MY_DRAWINGS_TABLE.headerBg,
  minWidth: 220,
  maxWidth: 280,
  verticalAlign: 'middle',
}

export const permissionsStickyModuleBodySx: SxProps<Theme> = {
  ...myDrawingsTableCellSx,
  position: 'sticky',
  left: 0,
  zIndex: 1,
  bgcolor: 'background.paper',
  minWidth: 220,
  maxWidth: 280,
  verticalAlign: 'top',
  whiteSpace: 'normal',
}

export const permissionsMatrixActionCellSx: SxProps<Theme> = {
  ...myDrawingsTableCellSx,
  textAlign: 'center',
  width: 52,
  minWidth: 52,
  px: 0.5,
}
