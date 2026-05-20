import type { DataGridProps } from '@mui/x-data-grid'
import type { SxProps, Theme } from '@mui/material/styles'
import { UserManagementGridPanel } from '@/src/components/user-management/user-management-grid-panel'

/** Primary name column — matches explorer list `font-medium text-foreground` */
export const UM_GRID_CELL_PRIMARY = 'um-grid-cell-primary'

/** Secondary data columns — matches explorer list `text-muted-foreground` */
export const UM_GRID_CELL_MUTED = 'um-grid-cell-muted'

/**
 * Visual styling aligned with Camera / Report explorer tables:
 * primary header titles, muted body cells, primary-tint row hover.
 */
export const userManagementDataGridSx: SxProps<Theme> = {
  border: 'none',
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'transparent',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  '& .MuiDataGrid-columnHeaderTitle': {
    fontWeight: 600,
    color: '#0891b2',
  },
  '& .MuiDataGrid-row': {
    cursor: 'default',
  },
  '& .MuiDataGrid-cell': {
    fontSize: '0.875rem',
    borderColor: 'divider',
    color: '#6b7280',
  },
  [`& .${UM_GRID_CELL_PRIMARY}`]: {
    fontWeight: 500,
    color: '#1a1a2e',
  },
  [`& .${UM_GRID_CELL_MUTED}`]: {
    color: '#6b7280',
  },
}

/** Shared DataGrid behavior for user-management tables */
export const userManagementDataGridDefaults = {
  disableColumnMenu: true,
  filterMode: 'client',
  disableColumnFilter: false,
  disableColumnSelector: false,
  sortingOrder: ['asc', 'desc', null],
  sx: userManagementDataGridSx,
  slots: {
    panel: UserManagementGridPanel,
  },
  slotProps: {
    filterPanel: {
      filterFormProps: {
        logicOperatorInputProps: { variant: 'outlined', size: 'small' },
        columnInputProps: { variant: 'outlined', size: 'small' },
        operatorInputProps: { variant: 'outlined', size: 'small' },
        valueInputProps: { variant: 'outlined', size: 'small' },
      },
    },
    columnsManagement: {
      disableShowHideToggle: false,
    },
  },
} satisfies Partial<DataGridProps>
