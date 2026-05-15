'use client'

import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  PERMISSION_COLUMNS,
  PERMISSION_MODULES,
  type PermissionMatrix,
} from '@/src/constants/permissions-matrix'

interface PermissionMatrixReadonlyProps {
  matrix: PermissionMatrix
  maxHeight?: number
}

export function PermissionMatrixReadonly({ matrix, maxHeight = 280 }: PermissionMatrixReadonlyProps) {
  const theme = useTheme()

  return (
    <TableContainer
      sx={{
        maxHeight,
        borderRadius: 1.5,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                position: 'sticky',
                left: 0,
                zIndex: 3,
                minWidth: 140,
                fontWeight: 700,
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Module
              </Typography>
            </TableCell>
            {PERMISSION_COLUMNS.map((c) => (
              <TableCell
                key={c}
                align="center"
                sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06), px: 0.75 }}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary" noWrap>
                  {c}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {PERMISSION_MODULES.map((mod) => (
            <TableRow key={mod} hover>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  fontWeight: 600,
                  bgcolor: 'background.paper',
                  fontSize: '0.8125rem',
                  py: 1,
                }}
              >
                {mod}
              </TableCell>
              {PERMISSION_COLUMNS.map((col) => (
                <TableCell key={col} align="center" sx={{ px: 0.5, py: 0.75 }}>
                  <Tooltip title={`${mod} — ${col}`}>
                    <Checkbox size="small" checked={matrix[mod][col]} disabled sx={{ p: 0.25 }} />
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
