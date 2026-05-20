import type { ExplorerSortDirection } from '@/lib/explorer-list-table/types'

export function compareExplorerSortValues(
  a: string,
  b: string,
  direction: ExplorerSortDirection
): number {
  const aTrim = a.trim()
  const bTrim = b.trim()
  const aNum = Number(aTrim)
  const bNum = Number(bTrim)
  const bothNumeric =
    aTrim !== '' &&
    bTrim !== '' &&
    !Number.isNaN(aNum) &&
    !Number.isNaN(bNum) &&
    /^-?\d+(\.\d+)?$/.test(aTrim) &&
    /^-?\d+(\.\d+)?$/.test(bTrim)

  let cmp: number
  if (bothNumeric) {
    cmp = aNum - bNum
  } else {
    cmp = aTrim.localeCompare(bTrim, undefined, { numeric: true, sensitivity: 'base' })
  }

  return direction === 'asc' ? cmp : -cmp
}
