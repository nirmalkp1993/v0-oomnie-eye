import { SELECT_EMPTY_VALUE } from '@/src/constants/add-user'
import type { NestedPathOption } from '@/src/lib/nested-tree-path-options'

export function resolveStoredLabel(stored: string, options: NestedPathOption[]): string {
  if (!stored || stored === SELECT_EMPTY_VALUE) return ''
  const exact = options.find((option) => option.label === stored)
  if (exact) return exact.label
  const byLeaf = options.find((option) => {
    const parts = option.label.split(' > ')
    return parts[parts.length - 1] === stored
  })
  return byLeaf?.label ?? stored
}

export function resolveStoredLabels(stored: string[], options: NestedPathOption[]): string[] {
  const resolved = stored
    .map((value) => resolveStoredLabel(value, options))
    .filter((label): label is string => Boolean(label))
  return [...new Set(resolved)]
}

export function formatHierarchyTriggerLabel(stored: string, options: NestedPathOption[]): string {
  const resolved = resolveStoredLabel(stored, options)
  return resolved || 'Select…'
}

export function formatHierarchyMultiTriggerLabel(
  stored: string[],
  options: NestedPathOption[],
): string {
  const labels = resolveStoredLabels(stored, options)
  if (labels.length === 0) return 'Select…'
  return labels.join(', ')
}

export function hierarchyFieldsFromUser(value: string | string[] | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter((item) => item && item !== '—' && item !== SELECT_EMPTY_VALUE)
  }
  if (value === '—' || value === SELECT_EMPTY_VALUE) return []
  return [value]
}

export function formatHierarchyFieldDisplay(values: string[] | undefined, fallback = '—'): string {
  if (!values || values.length === 0) return fallback
  return values.join(', ')
}
