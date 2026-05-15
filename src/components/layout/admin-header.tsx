'use client'

import MenuIcon from '@mui/icons-material/Menu'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
}

export function AdminHeader({ title, subtitle, onMenuClick }: AdminHeaderProps) {
  return (
    <AppBar position="sticky" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar sx={{ gap: 2, minHeight: 72 }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="open navigation"
          onClick={onMenuClick}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <TextField
          size="small"
          placeholder="Global search…"
          sx={{
            width: { xs: 0, sm: 220, md: 320 },
            display: { xs: 'none', sm: 'inline-flex' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 999,
              bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <IconButton color="inherit" size="medium">
          <Badge color="error" variant="dot">
            <NotificationsNoneOutlinedIcon />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
