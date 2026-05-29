'use client'

import { Chip, IconButton } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight'
import {
  myDrawingsGridDepthChipSx,
  myDrawingsGridFolderExpandBtnSx,
} from '@/src/components/tables/my-drawings-table-styles'

/** Top-left level badge + folder chevron — matches My Drawings grid cards */
export function MyDrawingsGridCardChrome({
  level,
  isFolder = false,
  onFolderOpen,
  folderLabel,
}: {
  level: number
  isFolder?: boolean
  onFolderOpen?: () => void
  folderLabel?: string
}) {
  const showLevelBadge = level > 1

  return (
    <>
      {showLevelBadge && (
        <Chip
          icon={<SubdirectoryArrowRightIcon sx={{ fontSize: '12px !important' }} />}
          label={`L${level}`}
          size="small"
          sx={myDrawingsGridDepthChipSx}
        />
      )}

      {isFolder && (
        <IconButton
          size="small"
          aria-label={folderLabel ? `Open ${folderLabel}` : 'Open folder'}
          onClick={(e) => {
            e.stopPropagation()
            onFolderOpen?.()
          }}
          sx={myDrawingsGridFolderExpandBtnSx(showLevelBadge)}
        >
          <ChevronRightIcon fontSize="small" sx={{ color: '#4A5565' }} />
        </IconButton>
      )}
    </>
  )
}
