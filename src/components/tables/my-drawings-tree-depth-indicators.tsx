'use client'

import { Box } from '@mui/material'
import { MY_DRAWINGS_TABLE, MY_DRAWINGS_TOOLBAR } from '@/src/components/tables/my-drawings-table-styles'

/** Tree guide dots/lines — matches My Drawings GoogleDriveFileList name column */
export function MyDrawingsTreeDepthIndicators({
  depth,
  isFolder = false,
}: {
  depth: number
  isFolder?: boolean
}) {
  if (depth <= 0) return null

  return (
    <>
      {Array.from({ length: depth }).map((_, idx) => (
        <Box
          key={idx}
          sx={{
            position: 'absolute',
            left: `${idx * 24 + 10}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            bgcolor: idx === depth - 1 ? MY_DRAWINGS_TOOLBAR.depthDotActive : MY_DRAWINGS_TABLE.border,
            transition: 'all 0.2s ease-in-out',
          }}
        />
      ))}
      <Box
        sx={{
          position: 'absolute',
          left: `${(depth - 1) * 24 + 12}px`,
          top: '-50%',
          bottom: '50%',
          width: '1px',
          bgcolor: MY_DRAWINGS_TABLE.border,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: `${(depth - 1) * 24 + 12}px`,
          top: '50%',
          width: `${isFolder ? 8 : 12}px`,
          height: '1px',
          bgcolor: MY_DRAWINGS_TABLE.border,
        }}
      />
    </>
  )
}
