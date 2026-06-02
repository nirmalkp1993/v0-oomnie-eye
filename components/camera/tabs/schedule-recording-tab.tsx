'use client'

import { useEffect, useMemo, useState } from 'react'
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined'
import { Box, Button, MenuItem, Stack, Typography } from '@mui/material'
import { useCameraStore } from '@/lib/camera-store'
import {
  createEmptyRecordingScheduleSlots,
  cloneRecordingScheduleSlots,
  recordingScheduleSlotsEqual,
} from '@/lib/recording-schedule'
import {
  PlacemarkLabeledSelect,
  PlacemarkSettingsCard,
} from '@/src/components/earth/placemark-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import { RecordingScheduleGrid } from '../recording-schedule-grid'
import type {
  Camera,
  RecordingMode,
  RecordingScheduleSlots,
  StorageTarget,
} from '@/types/camera'

interface RecordingFormState {
  recordingEnabled: boolean
  recordingMode: RecordingMode
  storageTarget: StorageTarget
  scheduleSlots: RecordingScheduleSlots
}

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
}

function cameraToRecordingForm(c: Camera): RecordingFormState {
  return {
    recordingEnabled: c.recordingEnabled ?? true,
    recordingMode: c.recordingMode ?? 'continuous',
    storageTarget: c.storageTarget ?? 'local',
    scheduleSlots: c.recordingScheduleSlots
      ? cloneRecordingScheduleSlots(c.recordingScheduleSlots)
      : createEmptyRecordingScheduleSlots(),
  }
}

function recordingFormMatchesCamera(form: RecordingFormState, camera: Camera): boolean {
  const saved = cameraToRecordingForm(camera)
  return (
    form.recordingEnabled === saved.recordingEnabled &&
    form.recordingMode === saved.recordingMode &&
    form.storageTarget === saved.storageTarget &&
    recordingScheduleSlotsEqual(form.scheduleSlots, saved.scheduleSlots)
  )
}

export function ScheduleRecordingTab() {
  const { selectedCamera, updateCamera } = useCameraStore()
  const [form, setForm] = useState<RecordingFormState>(() =>
    selectedCamera ? cameraToRecordingForm(selectedCamera) : {
      recordingEnabled: true,
      recordingMode: 'continuous',
      storageTarget: 'local',
      scheduleSlots: createEmptyRecordingScheduleSlots(),
    },
  )

  useEffect(() => {
    if (selectedCamera) {
      setForm(cameraToRecordingForm(selectedCamera))
    }
  }, [selectedCamera])

  const isDirty = useMemo(() => {
    if (!selectedCamera) return false
    return !recordingFormMatchesCamera(form, selectedCamera)
  }, [form, selectedCamera])

  if (!selectedCamera) return null

  const scheduleTimezone = browserTimeZone()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCamera || !isDirty) return
    updateCamera(selectedCamera.id, {
      recordingEnabled: form.recordingEnabled,
      recordingMode: form.recordingMode,
      storageTarget: form.storageTarget,
      recordingScheduleSlots: form.recordingEnabled && form.recordingMode === 'scheduled'
        ? cloneRecordingScheduleSlots(form.scheduleSlots)
        : selectedCamera.recordingScheduleSlots,
    })
  }

  const handleReset = () => {
    if (!selectedCamera) return
    setForm(cameraToRecordingForm(selectedCamera))
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', minWidth: 0 }}
    >
      <PlacemarkSettingsCard
        title="Recording"
        tooltip="Turns recording ON/OFF for this camera. When OFF, no recording mode or schedule is applied."
        headerIcon={<ScheduleOutlinedIcon />}
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
      >
        <Stack spacing={2}>
          <Box sx={{ maxWidth: { md: 480 } }}>
          <PlacemarkLabeledSelect
            label="Recording"
            tooltip="Turns recording ON/OFF for this camera. When OFF, no recording mode or schedule is applied."
            value={form.recordingEnabled ? 'on' : 'off'}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                recordingEnabled: e.target.value === 'on',
              }))
            }
          >
            <MenuItem value="off">Off</MenuItem>
            <MenuItem value="on">On</MenuItem>
          </PlacemarkLabeledSelect>

          {form.recordingEnabled ? (
            <PlacemarkLabeledSelect
              label="Recording mode"
              tooltip="Continuous records 24/7 when active. Scheduled uses the weekly grid below."
              value={form.recordingMode}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  recordingMode: e.target.value as RecordingMode,
                }))
              }
            >
              <MenuItem value="continuous">Continuous (24/7)</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
            </PlacemarkLabeledSelect>
          ) : null}
          </Box>

          {form.recordingEnabled && form.recordingMode === 'scheduled' ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                width: '100%',
                minWidth: 0,
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'action.hover',
                p: 1.5,
              }}
            >
              <Typography
                variant="caption"
                component="p"
                sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.75rem' }}
              >
                Weekly recording schedule
              </Typography>
              <Typography
                variant="caption"
                component="p"
                sx={{
                  fontSize: '0.6875rem',
                  lineHeight: 1.6,
                  color: 'text.secondary',
                }}
              >
                Slot times use the IANA zone{' '}
                <Box
                  component="span"
                  sx={{ fontFamily: 'Roboto Mono, monospace', color: 'text.primary' }}
                >
                  {scheduleTimezone}
                </Box>
                . The server stores the schedule in{' '}
                <Box component="span" sx={{ fontFamily: 'Roboto Mono, monospace' }}>
                  DEFAULT_RECORDING_SCHEDULE_TIMEZONE
                </Box>{' '}
                when none is set yet (default{' '}
                <Box component="span" sx={{ fontFamily: 'Roboto Mono, monospace' }}>
                  Asia/Kolkata
                </Box>
                ).
              </Typography>
              <RecordingScheduleGrid
                value={form.scheduleSlots}
                onChange={(scheduleSlots) =>
                  setForm((prev) => ({ ...prev, scheduleSlots }))
                }
              />
            </Box>
          ) : null}

          <Box sx={{ maxWidth: { md: 480 } }}>
          <PlacemarkLabeledSelect
            label="Storage target"
            value={form.storageTarget}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                storageTarget: e.target.value as StorageTarget,
              }))
            }
          >
            <MenuItem value="nas">NAS</MenuItem>
            <MenuItem value="local">Local</MenuItem>
          </PlacemarkLabeledSelect>
          </Box>
        </Stack>
      </PlacemarkSettingsCard>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          gap: 1.5,
          pt: 1,
        }}
      >
        <Button type="button" variant="outlined" disabled={!isDirty} onClick={handleReset}>
          Reset changes
        </Button>
        <Button type="submit" variant="contained" disabled={!isDirty}>
          Save changes
        </Button>
      </Box>
    </Box>
  )
}
