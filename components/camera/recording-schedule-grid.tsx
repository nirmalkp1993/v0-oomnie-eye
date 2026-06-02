'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import type { RecordingScheduleDayKey, RecordingScheduleSlots } from '@/types/camera'
import {
  RECORDING_SCHEDULE_DAY_KEYS,
  RECORDING_SCHEDULE_DAY_LABELS,
  SLOTS_PER_DAY,
  cloneRecordingScheduleSlots,
  formatSlotRowLabel,
} from '@/lib/recording-schedule'

const SLOT_INDICES = Array.from({ length: SLOTS_PER_DAY }, (_, i) => i)

interface Props {
  value: RecordingScheduleSlots
  onChange: (next: RecordingScheduleSlots) => void
  disabled?: boolean
}

export function RecordingScheduleGrid({ value, onChange, disabled }: Props) {
  const theme = useTheme()
  const paintRef = useRef<'select' | 'erase' | null>(null)

  useEffect(() => {
    const endPaint = (): void => {
      paintRef.current = null
    }
    window.addEventListener('pointerup', endPaint)
    window.addEventListener('pointercancel', endPaint)
    return () => {
      window.removeEventListener('pointerup', endPaint)
      window.removeEventListener('pointercancel', endPaint)
    }
  }, [])

  const setSlot = useCallback(
    (day: RecordingScheduleDayKey, slotIndex: number, selected: boolean): void => {
      if (disabled || value[day][slotIndex] === selected) return
      const next = cloneRecordingScheduleSlots(value)
      next[day][slotIndex] = selected
      onChange(next)
    },
    [disabled, onChange, value],
  )

  const setAll = useCallback(
    (selected: boolean): void => {
      if (disabled) return
      const next = cloneRecordingScheduleSlots(value)
      for (const d of RECORDING_SCHEDULE_DAY_KEYS) {
        for (let i = 0; i < SLOTS_PER_DAY; i += 1) {
          next[d][i] = selected
        }
      }
      onChange(next)
    },
    [disabled, onChange, value],
  )

  const setDayAll = useCallback(
    (day: RecordingScheduleDayKey, selected: boolean): void => {
      if (disabled) return
      const next = cloneRecordingScheduleSlots(value)
      for (let i = 0; i < SLOTS_PER_DAY; i += 1) {
        next[day][i] = selected
      }
      onChange(next)
    },
    [disabled, onChange, value],
  )

  const toggleAllDay = useCallback(
    (day: RecordingScheduleDayKey): void => {
      const anyOff = value[day].some((v) => !v)
      setDayAll(day, anyOff)
    },
    [setDayAll, value],
  )

  const onCellPointerDown = (
    day: RecordingScheduleDayKey,
    slotIndex: number,
    e: React.PointerEvent,
  ): void => {
    if (disabled || e.button !== 0) return
    e.preventDefault()
    const nextSelected = !value[day][slotIndex]
    paintRef.current = nextSelected ? 'select' : 'erase'
    setSlot(day, slotIndex, nextSelected)
  }

  const onCellPointerEnter = (
    day: RecordingScheduleDayKey,
    slotIndex: number,
    e: React.PointerEvent,
  ): void => {
    if (disabled || paintRef.current === null) return
    if ((e.buttons & 1) === 0) return
    const wantSelect = paintRef.current === 'select'
    setSlot(day, slotIndex, wantSelect)
  }

  const selectedBg = `${theme.palette.primary.main}4D`
  const selectedHoverBg = `${theme.palette.primary.main}66`

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1 }}>
        <Button size="small" variant="outlined" disabled={disabled} onClick={() => setAll(true)}>
          Select all
        </Button>
        <Button size="small" variant="outlined" disabled={disabled} onClick={() => setAll(false)}>
          Clear all
        </Button>
      </Box>

      <Box
        sx={{
          width: '100%',
          overflow: 'auto',
          maxHeight: 'min(70vh, 520px)',
          borderRadius: 1,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Table
          size="small"
          sx={{
            width: '100%',
            minWidth: 880,
            tableLayout: 'fixed',
            borderCollapse: 'collapse',
            '& .MuiTableCell-root': {
              border: 1,
              borderColor: 'divider',
              p: 0,
              fontSize: '0.6875rem',
            },
          }}
          role="grid"
          aria-label="Weekly recording schedule in 30-minute slots"
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  width: 64,
                  minWidth: 64,
                  px: 0.5,
                  py: 1,
                  bgcolor: 'background.paper',
                  fontWeight: 600,
                  color: 'text.secondary',
                }}
              >
                Time
              </TableCell>
              {RECORDING_SCHEDULE_DAY_KEYS.map((day) => (
                <TableCell
                  key={day}
                  align="center"
                  sx={{
                    bgcolor: 'action.hover',
                    fontWeight: 600,
                    py: 0.5,
                    minWidth: 44,
                  }}
                >
                  <Box component="span" sx={{ fontSize: '0.75rem' }}>
                    {RECORDING_SCHEDULE_DAY_LABELS[day]}
                  </Box>
                  <Button
                    type="button"
                    size="small"
                    disabled={disabled}
                    onClick={() => toggleAllDay(day)}
                    sx={{
                      mt: 0.5,
                      display: 'block',
                      width: '100%',
                      minWidth: 0,
                      py: 0.25,
                      fontSize: '0.625rem',
                      fontWeight: 400,
                      color: 'text.secondary',
                      textTransform: 'none',
                    }}
                  >
                    All day
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {SLOT_INDICES.map((slotIndex) => (
              <TableRow key={slotIndex} sx={{ height: 22 }}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    whiteSpace: 'nowrap',
                    px: 0.5,
                    bgcolor: 'background.paper',
                    fontWeight: 400,
                    color: slotIndex % 2 === 0 ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {formatSlotRowLabel(slotIndex)}
                </TableCell>
                {RECORDING_SCHEDULE_DAY_KEYS.map((day) => {
                  const selected = value[day][slotIndex]
                  return (
                    <TableCell key={`${day}-${slotIndex}`} role="gridcell">
                      <Box
                        component="button"
                        type="button"
                        disabled={disabled}
                        aria-selected={selected}
                        tabIndex={-1}
                        onPointerDown={(e) => onCellPointerDown(day, slotIndex, e)}
                        onPointerEnter={(e) => onCellPointerEnter(day, slotIndex, e)}
                        sx={{
                          display: 'block',
                          width: '100%',
                          minWidth: 40,
                          height: 22,
                          border: 0,
                          p: 0,
                          cursor: disabled ? 'default' : 'pointer',
                          bgcolor: selected ? selectedBg : 'action.hover',
                          transition: 'background-color 0.15s',
                          '&:hover': disabled
                            ? undefined
                            : { bgcolor: selected ? selectedHoverBg : 'action.selected' },
                          '&:focus-visible': {
                            outline: 2,
                            outlineColor: 'primary.main',
                            outlineOffset: -2,
                          },
                        }}
                      />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Selected slots (primary tint) are recorded when the camera is in scheduled mode, active,
        and recording is enabled. Times follow the server&apos;s effective timezone (saved per
        camera or <Box component="span" sx={{ fontFamily: 'monospace' }}>DEFAULT_RECORDING_SCHEDULE_TIMEZONE</Box>, default{' '}
        <Box component="span" sx={{ fontFamily: 'monospace' }}>Asia/Kolkata</Box>). An empty grid
        means no scheduled windows.
      </Typography>
    </Box>
  )
}
