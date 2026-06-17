'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { History } from 'lucide-react'
import { useUserAuditStore } from '@/lib/user-audit-store'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import { USER_AUDIT_CATEGORIES } from '@/src/constants/user-audit-categories'
import { formatAuditDate } from '@/src/lib/user-management/user-audit-log.utils'
import { countAuditByCategory, filterAuditEntries, getAuditCategoryMeta } from '@/src/lib/user-management/user-audit.utils'
import type { UserAuditCategory, UserAuditEntry, UserListItem } from '@/src/types/user-management'

const AUDIT_COLUMNS = [
  { id: 'date', label: 'Date & Time', width: '16%' },
  { id: 'actionType', label: 'Action Type', width: '18%' },
  { id: 'description', label: 'Description', width: '28%' },
  { id: 'details', label: 'Details / Target', width: '38%' },
] as const

const headerCellSx = {
  py: 1.25,
  px: 2,
  fontWeight: 600,
  fontSize: '0.75rem',
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  color: 'text.secondary',
  borderBottom: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
  whiteSpace: 'nowrap',
} as const

const bodyCellSx = {
  py: 1.5,
  px: 2,
  fontSize: '0.8125rem',
  verticalAlign: 'top',
  borderBottom: '1px solid',
  borderColor: 'divider',
} as const

function AuditSummaryCard({
  heading,
  count,
  bg,
  border,
  countColor,
  selected,
  onClick,
}: {
  heading: string
  count: number
  bg: string
  border: string
  countColor: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      sx={{
        flex: '1 1 0',
        minWidth: 120,
        p: 1.5,
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected ? 'primary.main' : border,
        bgcolor: bg,
        textAlign: 'left',
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: selected ? '0 0 0 1px rgba(41, 50, 229, 0.25)' : 'none',
        '&:hover': {
          borderColor: selected ? 'primary.main' : 'text.secondary',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 0.5,
          lineHeight: 1.3,
        }}
      >
        {heading}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: countColor, lineHeight: 1.1 }}>
        {count}
      </Typography>
    </Box>
  )
}

function ActionTypeChip({ entry }: { entry: UserAuditEntry }) {
  const meta = getAuditCategoryMeta(entry.category)

  return (
    <Chip
      label={entry.actionType}
      size="small"
      sx={{
        height: 'auto',
        maxWidth: '100%',
        borderRadius: 1,
        fontWeight: 600,
        fontSize: '0.6875rem',
        letterSpacing: '0.02em',
        bgcolor: meta?.bg ?? 'action.hover',
        border: '1px solid',
        borderColor: meta?.border ?? 'divider',
        color: meta?.countColor ?? 'text.primary',
        '& .MuiChip-label': {
          whiteSpace: 'normal',
          py: 0.5,
          px: 1,
        },
      }}
    />
  )
}

function AuditTrailTable({ entries }: { entries: UserAuditEntry[] }) {
  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No history events yet.
      </Typography>
    )
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={(theme) => ({
        ...getEnterpriseSettingsCardSx(theme),
        maxHeight: 420,
        overflow: 'auto',
      })}
    >
      <Table stickyHeader size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
        <TableHead>
          <TableRow>
            {AUDIT_COLUMNS.map((column) => (
              <TableCell key={column.id} sx={{ ...headerCellSx, width: column.width }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id} hover>
              <TableCell sx={{ ...bodyCellSx, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {formatAuditDate(entry.date)}
              </TableCell>
              <TableCell sx={bodyCellSx}>
                <ActionTypeChip entry={entry} />
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, fontWeight: 500 }}>
                {entry.description}
              </TableCell>
              <TableCell sx={{ ...bodyCellSx, color: 'text.secondary', wordBreak: 'break-word' }}>
                {entry.details}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function UserAuditTrailPanel({ user }: { user: UserListItem | null }) {
  const [activeCategory, setActiveCategory] = useState<UserAuditCategory | null>(null)
  const hydrateFromUsers = useUserAuditStore((state) => state.hydrateFromUsers)
  const ensureUserLogs = useUserAuditStore((state) => state.ensureUserLogs)
  const entriesByUserId = useUserAuditStore((state) => state.entriesByUserId)

  useEffect(() => {
    hydrateFromUsers([])
  }, [hydrateFromUsers])

  useEffect(() => {
    if (user) ensureUserLogs(user)
  }, [ensureUserLogs, user])

  const entries = useMemo(() => {
    if (!user) return []
    const list = entriesByUserId[user.id] ?? []
    return [...list].sort((a, b) => b.date.localeCompare(a.date))
  }, [entriesByUserId, user])

  const counts = useMemo(() => countAuditByCategory(entries), [entries])

  const visibleEntries = useMemo(
    () => filterAuditEntries(entries, activeCategory),
    [activeCategory, entries],
  )

  return (
    <EarthDialogSectionCard
      title="History log"
      icon={History}
      tooltip="Audit trail of user, pin, camera, and admin actions"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
    >
      {!user ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Save the user first to view history.
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.25,
              mb: 2,
            }}
          >
            {USER_AUDIT_CATEGORIES.map((category) => (
              <AuditSummaryCard
                key={category.id}
                heading={category.heading}
                count={counts[category.id]}
                bg={category.bg}
                border={category.border}
                countColor={category.countColor}
                selected={activeCategory === category.id}
                onClick={() =>
                  setActiveCategory((prev) => (prev === category.id ? null : category.id))
                }
              />
            ))}
          </Box>

          {activeCategory ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
              Showing {visibleEntries.length} event{visibleEntries.length === 1 ? '' : 's'} · click a
              category again to show all
            </Typography>
          ) : null}

          <AuditTrailTable entries={visibleEntries} />
        </>
      )}
    </EarthDialogSectionCard>
  )
}
