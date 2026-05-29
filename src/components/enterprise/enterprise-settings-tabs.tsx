'use client'

import type { ReactElement, ReactNode, SyntheticEvent } from 'react'
import { Box, Tab, Tabs, type SxProps, type Theme } from '@mui/material'

/** Parent page tabs — aligned with OomniEye SettingsPage / CameraDetailPage */
export const enterprisePageTabsSx: SxProps<Theme> = {
  borderBottom: 1,
  borderColor: 'divider',
  mb: 2,
  '& .MuiTab-root': {
    minHeight: 35,
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 24,
  },
  '& .MuiTabs-indicator': {
    height: 4,
    backgroundColor: 'primary.main',
  },
}

/** Tab strip styling aligned with OomniEye GlobalSettingsDialog */
export const enterpriseSettingsTabsSx: SxProps<Theme> = (theme) => ({
  minHeight: 64,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-flexContainer': {
    gap: 0,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    minHeight: 64,
    minWidth: 140,
    maxWidth: 200,
    px: 3,
    py: 2,
    fontWeight: 500,
    fontSize: '14px !important',
    lineHeight: '20px !important',
    color: `${theme.palette.text.primary} !important`,
    opacity: '1 !important',
    whiteSpace: 'nowrap',
    overflow: 'visible !important',
    '&:hover': {
      color: `${theme.palette.primary.main} !important`,
      bgcolor: theme.palette.action.hover,
    },
    '&.Mui-selected': {
      color: `${theme.palette.primary.main} !important`,
      bgcolor:
        theme.palette.mode === 'dark'
          ? 'rgba(144, 202, 249, 0.08)'
          : 'rgba(8, 145, 178, 0.08)',
      fontWeight: 600,
    },
    '&.Mui-disabled': {
      opacity: '0.38 !important',
      color: `${theme.palette.text.disabled} !important`,
      pointerEvents: 'none',
    },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    bgcolor: 'primary.main',
  },
})

export interface EnterpriseSettingsTabItem {
  value: string
  label: ReactNode
  icon?: ReactElement
  disabled?: boolean
}

export interface EnterpriseSettingsTabsProps {
  value: string
  onChange: (value: string) => void
  tabs: EnterpriseSettingsTabItem[]
  ariaLabel?: string
  /** `page` matches SettingsPage; `dialog` matches GlobalSettingsDialog */
  variant?: 'page' | 'dialog'
}

export function EnterpriseSettingsTabs({
  value,
  onChange,
  tabs,
  ariaLabel = 'section tabs',
  variant = 'dialog',
}: EnterpriseSettingsTabsProps) {
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.value === value),
  )

  const handleChange = (_: SyntheticEvent, newIndex: number) => {
    const tab = tabs[newIndex]
    if (tab?.value != null && !tab.disabled) onChange(tab.value)
  }

  const isPageVariant = variant === 'page'

  return (
    <Box sx={{ borderBottom: 0 }}>
      <Tabs
        value={index}
        onChange={handleChange}
        variant={isPageVariant ? 'fullWidth' : 'scrollable'}
        scrollButtons={isPageVariant ? false : 'auto'}
        allowScrollButtonsMobile={!isPageVariant}
        aria-label={ariaLabel}
        sx={isPageVariant ? enterprisePageTabsSx : enterpriseSettingsTabsSx}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={tab.value}
            disabled={tab.disabled}
            id={`enterprise-settings-tab-${i}`}
            aria-controls={`enterprise-settings-tabpanel-${i}`}
            icon={isPageVariant ? tab.icon : undefined}
            iconPosition={isPageVariant ? 'start' : undefined}
            label={
              isPageVariant ? (
                tab.label
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {tab.icon ? (
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        color: 'inherit',
                        '& svg': { width: 18, height: 18 },
                      }}
                    >
                      {tab.icon}
                    </Box>
                  ) : null}
                  <Box component="span" sx={{ fontSize: 14, fontWeight: 'inherit' }}>
                    {tab.label}
                  </Box>
                </Box>
              )
            }
          />
        ))}
      </Tabs>
    </Box>
  )
}
