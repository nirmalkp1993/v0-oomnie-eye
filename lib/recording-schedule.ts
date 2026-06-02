import type { RecordingScheduleDayKey, RecordingScheduleSlots } from '@/types/camera'

export const RECORDING_SCHEDULE_DAY_KEYS: readonly RecordingScheduleDayKey[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
] as const

export const RECORDING_SCHEDULE_DAY_LABELS: Record<RecordingScheduleDayKey, string> = {
  sun: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
}

export const SLOTS_PER_DAY = 48

export function createEmptyRecordingScheduleSlots(): RecordingScheduleSlots {
  const empty = (): boolean[] => Array.from({ length: SLOTS_PER_DAY }, () => false)
  return {
    sun: empty(),
    mon: empty(),
    tue: empty(),
    wed: empty(),
    thu: empty(),
    fri: empty(),
    sat: empty(),
  }
}

export function cloneRecordingScheduleSlots(slots: RecordingScheduleSlots): RecordingScheduleSlots {
  return {
    sun: [...slots.sun],
    mon: [...slots.mon],
    tue: [...slots.tue],
    wed: [...slots.wed],
    thu: [...slots.thu],
    fri: [...slots.fri],
    sat: [...slots.sat],
  }
}

export function formatSlotRowLabel(slotIndex: number): string {
  const hour = Math.floor(slotIndex / 2)
  const mm = slotIndex % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${mm}`
}

export function recordingScheduleSlotsEqual(
  a: RecordingScheduleSlots,
  b: RecordingScheduleSlots,
): boolean {
  return RECORDING_SCHEDULE_DAY_KEYS.every((day) =>
    a[day].every((v, i) => v === b[day][i]),
  )
}
