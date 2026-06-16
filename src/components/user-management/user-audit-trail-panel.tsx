'use client'

import { useEffect, useMemo, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { History } from 'lucide-react'
import { useUserAuditStore } from '@/lib/user-audit-store'
import { EarthDialogSectionCard } from '@/src/components/modals/dialog-section-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { USER_AUDIT_CATEGORIES } from '@/src/constants/user-audit-categories'
import { formatAuditDate } from '@/src/lib/user-management/user-audit-log.utils'
import { countAuditByCategory, filterAuditEntries } from '@/src/lib/user-management/user-audit.utils'
import type { UserAuditCategory } from '@/src/types/user-management'
import { auditCardSx } from '@/src/components/user-management/user-detail/user-detail-styles'

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
      tooltip="Actions such as user added, updated, retired, and removed"
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
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Showing {visibleEntries.length} event{visibleEntries.length === 1 ? '' : 's'} · click a
              category again to show all
            </Typography>
          ) : null}

          <Stack spacing={1.25}>
            {visibleEntries.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No history events yet.
              </Typography>
            ) : (
              visibleEntries.map((entry) => (
                <Box key={entry.id} sx={auditCardSx}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {entry.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.context}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {formatAuditDate(entry.date)}
                  </Typography>
                </Box>
              ))
            )}
          </Stack>
        </>
      )}
    </EarthDialogSectionCard>
  )
}
