'use client'

import { Box, Breadcrumbs, Link, Typography } from '@mui/material'
import {
  myDrawingsBreadcrumbCurrentSx,
  myDrawingsBreadcrumbLinkSx,
  myDrawingsBreadcrumbShellSx,
  myDrawingsBreadcrumbsSx,
} from '@/src/components/tables/my-drawings-table-styles'

export interface UserGroupFolderBreadcrumb {
  id: string
  name: string
}

export function UserGroupFolderBreadcrumbs({
  items,
  onNavigate,
}: {
  items: UserGroupFolderBreadcrumb[]
  onNavigate: (segmentIndex: number) => void
}) {
  if (items.length === 0) return null

  return (
    <Box sx={myDrawingsBreadcrumbShellSx}>
      <Breadcrumbs aria-label="Group folder path" separator="›" sx={myDrawingsBreadcrumbsSx}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          if (isLast) {
            return (
              <Typography
                key={item.id}
                variant="body2"
                noWrap
                title={item.name}
                sx={{
                  ...myDrawingsBreadcrumbCurrentSx,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 300,
                }}
              >
                {item.name}
              </Typography>
            )
          }
          return (
            <Link
              key={item.id}
              component="button"
              type="button"
              variant="body2"
              underline="hover"
              title={item.name}
              onClick={() => onNavigate(index)}
              sx={myDrawingsBreadcrumbLinkSx}
            >
              {item.name}
            </Link>
          )
        })}
      </Breadcrumbs>
    </Box>
  )
}
