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
  type PermissionColumn,
  type PermissionMatrix,
  type PermissionModule,
} from '@/src/constants/permissions-matrix'

interface PermissionMatrixEditorProps {
  value: PermissionMatrix
  onChange: (next: PermissionMatrix) => void
}

export function PermissionMatrixEditor({ value, onChange }: PermissionMatrixEditorProps) {
  const theme = useTheme()

  const toggle = (mod: PermissionModule, col: PermissionColumn) => {
    const next: PermissionMatrix = { ...value, [mod]: { ...value[mod], [col]: !value[mod][col] } }
    onChange(next)
  }

  return (
    <TableContainer
      sx={{
        maxHeight: 360,
        borderRadius: 2,
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
                minWidth: 200,
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`,
                boxShadow: `4px 0 12px ${alpha(theme.palette.common.black, 0.04)}`,
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Module
              </Typography>
            </TableCell>
            {PERMISSION_COLUMNS.map((col) => (
              <TableCell key={col} align="center" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  {col}
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
                  bgcolor: 'background.paper',
                  fontWeight: 600,
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                }}
              >
                {mod}
              </TableCell>
              {PERMISSION_COLUMNS.map((col) => (
                <TableCell key={col} align="center">
                  <Tooltip title={`${mod} — ${col}`}>
                    <Checkbox
                      size="small"
                      checked={value[mod][col]}
                      onChange={() => toggle(mod, col)}
                    />
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
