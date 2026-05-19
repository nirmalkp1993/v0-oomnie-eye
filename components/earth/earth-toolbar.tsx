'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  Home as HomeIcon,
  PhotoCamera as PhotoCameraIcon,
  Place as PlaceIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { IconButton, Paper, Stack, ThemeProvider, Tooltip } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { usePinStore } from '@/lib/pin-store'
import { muiPlacemarkClusterTheme } from '@/src/components/theme/mui-placemark-cluster-theme'

/** Mirrors PlacemarkPlacementModeButton from main frontend */
function EarthPlacementModeButton({
  isPlacingMode,
  isThisKindActive,
  tooltipIdle,
  tooltipPlacing,
  onClick,
  children,
  'aria-label': ariaLabel,
}: {
  isPlacingMode: boolean
  isThisKindActive: boolean
  tooltipIdle: string
  tooltipPlacing: string
  onClick: () => void
  children: ReactNode
  'aria-label': string
}) {
  const theme = useTheme()
  const active = isPlacingMode && isThisKindActive

  return (
    <Tooltip title={isPlacingMode ? tooltipPlacing : tooltipIdle} placement="right" arrow>
      <IconButton
        onClick={onClick}
        size="medium"
        aria-label={ariaLabel}
        sx={{
          color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
          bgcolor: active ? theme.palette.primary.main : 'transparent',
          '&:hover': {
            bgcolor: active
              ? theme.palette.primary.dark
              : alpha(theme.palette.primary.main, 0.3),
          },
          animation: active ? 'earthPlacemarkPulse 2s infinite' : 'none',
          '@keyframes earthPlacemarkPulse': {
            '0%, 100%': {
              boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`,
            },
            '50%': {
              boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0)}`,
            },
          },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  )
}

function EarthToolbarCluster() {
  const theme = useTheme()
  const { isAddingPin, pendingPinLocation, setIsAddingPin } = usePinStore()
  const [searchPanelOpen, setSearchPanelOpen] = useState(false)

  const toggleSearch = useCallback(() => {
    setSearchPanelOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        e.stopPropagation()
        toggleSearch()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown, true)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true)
  }, [toggleSearch])

  const handleSearchClick = useCallback(() => {
    console.log('[v0] Search clicked', { searchPanelOpen })
    toggleSearch()
  }, [searchPanelOpen, toggleSearch])

  const handleHomeClick = useCallback(() => {
    console.log('[v0] Home clicked')
  }, [])

  const handlePlacemarkClick = useCallback(() => {
    console.log('[v0] Add Location Pin clicked')
  }, [])

  const handleCameraPlacemarkClick = useCallback(() => {
    if (isAddingPin) {
      setIsAddingPin(false)
      return
    }
    if (!pendingPinLocation) {
      setIsAddingPin(true)
    }
  }, [isAddingPin, pendingPinLocation, setIsAddingPin])

  useEffect(() => {
    if (!isAddingPin) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsAddingPin(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isAddingPin, setIsAddingPin])

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: theme.spacing(2),
        left: theme.spacing(2),
        zIndex: theme.zIndex.fab,
        pointerEvents: 'auto',
        bgcolor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        fontFamily: theme.typography.fontFamily,
      }}
      role="toolbar"
      aria-label="Earth map controls"
    >
      <Stack direction="column" spacing={0.5} sx={{ p: theme.spacing(0.5) }}>
        <Tooltip title="Places / Search" placement="right" arrow>
          <IconButton
            onClick={handleSearchClick}
            size="medium"
            aria-label="Places / Search"
            sx={{
              color: searchPanelOpen ? theme.palette.primary.main : theme.palette.text.primary,
              bgcolor: searchPanelOpen ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
              },
            }}
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Return to Default Location" placement="right" arrow>
          <IconButton
            onClick={handleHomeClick}
            size="medium"
            aria-label="Return to Default Location"
            sx={{
              color: theme.palette.text.primary,
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
              },
            }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>

        <EarthPlacementModeButton
          isPlacingMode={false}
          isThisKindActive={false}
          tooltipIdle="Add Placemark"
          tooltipPlacing="Cancel Placement (ESC)"
          onClick={handlePlacemarkClick}
          aria-label="Add placemark"
        >
          <PlaceIcon />
        </EarthPlacementModeButton>

        <EarthPlacementModeButton
          isPlacingMode={isAddingPin}
          isThisKindActive
          tooltipIdle="Add Camera Placemark"
          tooltipPlacing="Cancel Placement (ESC)"
          onClick={handleCameraPlacemarkClick}
          aria-label="Add camera placemark"
        >
          <PhotoCameraIcon />
        </EarthPlacementModeButton>
      </Stack>
    </Paper>
  )
}

export function EarthToolbar() {
  return (
    <ThemeProvider theme={muiPlacemarkClusterTheme}>
      <EarthToolbarCluster />
    </ThemeProvider>
  )
}
