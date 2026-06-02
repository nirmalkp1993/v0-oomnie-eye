'use client'

import { useMemo } from 'react'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import LinkIcon from '@mui/icons-material/Link'
import { Box, Divider, Paper, Typography } from '@mui/material'
import { PERMISSION_MATRIX_MODULES } from '@/src/constants/permissions-page-matrix'
import type { MatrixSummary } from '@/src/types/permissions-page'
import {
  settingsBodyPrimarySx,
  settingsBodySecondarySx,
  settingsCaptionLabelSx,
  settingsSectionTitleSx,
  settingsStickyPanelSx,
  summaryCardSx,
} from './permissions-shared-styles'

export function PermissionsSummaryPanel({ summary }: { summary: MatrixSummary }) {
  const actionEntries = useMemo(
    () =>
      Object.entries(summary.byAction)
        .filter(([, count]) => (count ?? 0) > 0)
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0)),
    [summary.byAction]
  )

  return (
    <Paper elevation={0} sx={settingsStickyPanelSx}>
      <Typography variant="subtitle1" sx={{ ...settingsSectionTitleSx, mb: 0.25 }}>
        Summary
      </Typography>
      <Typography variant="caption" sx={{ ...settingsBodySecondarySx, display: 'block', mb: 2 }}>
        Grant overview for this matrix
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={summaryCardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon color="primary" fontSize="small" />
            <Typography variant="body2" sx={settingsBodySecondarySx}>
              Assigned
            </Typography>
            <Typography variant="body2" sx={{ ...settingsBodyPrimarySx, fontWeight: 700, ml: 'auto' }}>
              {summary.assigned}
            </Typography>
          </Box>
        </Box>
        <Box sx={summaryCardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloseIcon sx={{ fontSize: 18, color: 'error.main' }} />
            <Typography variant="body2" sx={settingsBodySecondarySx}>
              Denied
            </Typography>
            <Typography variant="body2" sx={{ ...settingsBodyPrimarySx, fontWeight: 700, ml: 'auto' }}>
              {summary.denied}
            </Typography>
          </Box>
        </Box>
        <Box sx={summaryCardSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
            <Typography variant="body2" sx={settingsBodySecondarySx}>
              Inherited
            </Typography>
            <Typography variant="body2" sx={{ ...settingsBodyPrimarySx, fontWeight: 700, ml: 'auto' }}>
              {summary.inherited}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="caption" sx={{ ...settingsCaptionLabelSx, display: 'block', mb: 1 }}>
        By resource type
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" sx={settingsBodyPrimarySx}>
          Module
        </Typography>
        <Typography variant="body2" sx={{ ...settingsBodyPrimarySx, fontWeight: 600 }}>
          {PERMISSION_MATRIX_MODULES.length}
        </Typography>
      </Box>

      <Typography variant="caption" sx={{ ...settingsCaptionLabelSx, display: 'block', mb: 1 }}>
        By action
      </Typography>
      {actionEntries.length === 0 ? (
        <Typography variant="body2" sx={settingsBodySecondarySx}>
          —
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {actionEntries.map(([action, count]) => (
            <Box key={action} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ ...settingsBodyPrimarySx, textTransform: 'capitalize' }}>
                {action}
              </Typography>
              <Typography variant="body2" sx={{ ...settingsBodyPrimarySx, fontWeight: 600 }}>
                {count}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  )
}
