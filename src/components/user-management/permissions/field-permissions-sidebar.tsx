'use client'

import { useMemo } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import {
  Box,
  Chip,
  FormControl,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { MOCK_USERS } from '@/src/mock-data/users'
import type {
  FieldPermissionFlags,
  FieldPreviewStatus,
  FormFieldDefinition,
} from '@/src/types/field-permissions'
import {
  canExport,
  canPrint,
  resolvePreviewStatus,
} from '@/src/lib/user-management/field-permissions.utils'
import {
  settingsBodySecondarySx,
  settingsPaperSx,
  settingsSectionTitleSx,
} from './permissions-shared-styles'

const STATUS_LABELS: Record<FieldPreviewStatus, string> = {
  editable: 'Editable',
  readOnly: 'Read-only',
  masked: 'Masked',
  hidden: 'Hidden',
}

const statusChipColor: Record<
  FieldPreviewStatus,
  'default' | 'primary' | 'warning' | 'error'
> = {
  editable: 'default',
  readOnly: 'warning',
  masked: 'error',
  hidden: 'error',
}

function StatusChip({ status }: { status: FieldPreviewStatus }) {
  return (
    <Chip
      size="small"
      label={STATUS_LABELS[status]}
      color={statusChipColor[status]}
      sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
    />
  )
}

export interface FieldPermissionsSidebarProps {
  fields: FormFieldDefinition[]
  grants: Record<string, FieldPermissionFlags>
  previewUserId: string
  previewUserRoles: string[]
  onPreviewUserChange: (userId: string) => void
}

export function FieldPermissionsSidebar({
  fields,
  grants,
  previewUserId,
  previewUserRoles,
  onPreviewUserChange,
}: FieldPermissionsSidebarProps) {
  const previewRows = useMemo(
    () =>
      fields.map((field) => {
        const flags = grants[field.id]
        const status = flags ? resolvePreviewStatus(flags) : 'hidden'
        return {
          field,
          status,
          exportOk: flags ? canExport(flags) : false,
          printOk: flags ? canPrint(flags) : false,
        }
      }),
    [fields, grants],
  )

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 300 },
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignSelf: 'flex-start',
        position: { md: 'sticky' },
        top: 16,
      }}
    >
      <Paper elevation={0} sx={{ ...settingsPaperSx, p: 2, overflow: 'visible' }}>
        <Typography variant="subtitle2" sx={{ ...settingsSectionTitleSx, mb: 0.5 }}>
          Field preview
        </Typography>
        <Typography variant="caption" sx={{ ...settingsBodySecondarySx, display: 'block', mb: 1.5 }}>
          Preview the field behavior for the selected user.
        </Typography>

        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <Select
            value={previewUserId}
            onChange={(e) => onPreviewUserChange(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            {MOCK_USERS.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {previewUserRoles.length > 0 ? (
          <Typography variant="caption" sx={{ ...settingsBodySecondarySx, display: 'block', mb: 1.5 }}>
            Roles: {previewUserRoles.join(', ')}
          </Typography>
        ) : null}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {previewRows.map(({ field, status }) => (
            <Box key={field.id}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {field.label}
                </Typography>
                <StatusChip status={status} />
              </Box>
              <TextField
                fullWidth
                size="small"
                multiline={field.type === 'textarea'}
                minRows={field.type === 'textarea' ? 2 : undefined}
                disabled={status !== 'editable'}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' },
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ ...settingsPaperSx, p: 2, overflow: 'visible' }}>
        <Typography variant="subtitle2" sx={{ ...settingsSectionTitleSx, mb: 1.5 }}>
          Export / print summary
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 40px 40px 80px',
            gap: 0.5,
            mb: 0.75,
            px: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Field
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textAlign: 'center' }}>
            Export
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textAlign: 'center' }}>
            Print
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textAlign: 'right' }}>
            Status
          </Typography>
        </Box>
        <Box>
          {previewRows.map(({ field, exportOk, printOk, status }) => (
            <Box
              key={field.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 40px 40px 80px',
                gap: 0.5,
                alignItems: 'center',
                py: 0.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" noWrap>
                {field.label}
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                {exportOk ? (
                  <CheckIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    —
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                {printOk ? (
                  <CheckIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    —
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <StatusChip status={status} />
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  )
}
