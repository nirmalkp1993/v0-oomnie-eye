'use client'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import {
  USER_ROLE_MATRIX_COLUMNS,
  USER_ROLE_MATRIX_MODULES,
  type UserRoleMatrixAction,
  type UserRoleMatrixGrants,
  isUserRoleMatrixActionApplicable,
} from '@/src/constants/user-role-permission-matrix'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import {
  MY_DRAWINGS_TABLE,
  myDrawingsBodyPrimaryTypographySx,
  myDrawingsBodyRowSx,
  myDrawingsBodySecondaryTypographySx,
  myDrawingsHeaderTypographySx,
  myDrawingsTableBodySx,
  myDrawingsTableCellSx,
  myDrawingsTableHeadSx,
} from '@/src/components/user-management/permissions/permissions-shared-styles'

const compactModuleHeaderSx = {
  ...myDrawingsTableCellSx,
  width: '34%',
  bgcolor: MY_DRAWINGS_TABLE.headerBg,
  verticalAlign: 'middle',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
} as const

const compactModuleBodySx = {
  ...myDrawingsTableCellSx,
  width: '34%',
  verticalAlign: 'top',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
} as const

const compactActionCellSx = {
  ...myDrawingsTableCellSx,
  width: `${66 / USER_ROLE_MATRIX_COLUMNS.length}%`,
  textAlign: 'center',
  px: 0.25,
} as const

function MatrixCell({
  granted,
  applicable,
  label,
}: {
  granted: boolean
  applicable: boolean
  label: string
}) {
  if (!applicable) {
    return (
      <Typography variant="body2" color="text.disabled" aria-hidden>
        —
      </Typography>
    )
  }

  if (granted) {
    return <CheckCircleIcon sx={{ fontSize: 22, color: 'primary.main' }} aria-label={label} />
  }

  return (
    <Typography variant="body2" color="text.disabled" aria-label={label}>
      —
    </Typography>
  )
}

export function RolePermissionMatrixReadonly({ grants }: { grants: UserRoleMatrixGrants }) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        overflow: 'hidden',
        minWidth: 0,
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      <TableContainer sx={{ maxHeight: 400, overflowY: 'auto', overflowX: 'hidden' }}>
        <Table
          stickyHeader
          size="small"
          aria-label="Role permission matrix"
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            '& .MuiTableCell-root': { py: 0.75, px: 1 },
          }}
        >
          <TableHead sx={myDrawingsTableHeadSx}>
            <TableRow hover={false}>
              <TableCell sx={compactModuleHeaderSx}>
                <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                  Module
                </Typography>
              </TableCell>
              {USER_ROLE_MATRIX_COLUMNS.map((column) => (
                <TableCell key={column.key} align="center" sx={compactActionCellSx}>
                  <Typography variant="body2" sx={myDrawingsHeaderTypographySx}>
                    {column.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={myDrawingsTableBodySx}>
            {USER_ROLE_MATRIX_MODULES.map((module) => {
              const moduleGrants = grants[module.id] ?? new Set<UserRoleMatrixAction>()

              return (
                <TableRow key={module.id} hover={false} sx={myDrawingsBodyRowSx()}>
                  <TableCell sx={compactModuleBodySx}>
                    <Typography variant="body2" sx={{ ...myDrawingsBodyPrimaryTypographySx, fontWeight: 600 }}>
                      {module.name}
                    </Typography>
                    <Typography variant="body2" sx={myDrawingsBodySecondaryTypographySx} display="block">
                      {module.description}
                    </Typography>
                  </TableCell>
                  {USER_ROLE_MATRIX_COLUMNS.map((column) => {
                    const applicable = isUserRoleMatrixActionApplicable(module.id, column.key)
                    const granted = applicable && moduleGrants.has(column.key)
                    return (
                      <TableCell key={column.key} align="center" sx={compactActionCellSx}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <MatrixCell
                            granted={granted}
                            applicable={applicable}
                            label={`${column.label} ${module.name}`}
                          />
                        </Box>
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
