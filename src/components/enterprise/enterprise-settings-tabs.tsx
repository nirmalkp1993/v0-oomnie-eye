'use client'

import type { ReactElement, ReactNode, SyntheticEvent } from 'react'
import { Box, Tab, Tabs, type SxProps, type Theme } from '@mui/material'

/** Tab strip styling aligned with OomniEye GlobalSettingsDialog / Settings module */
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
}

export interface EnterpriseSettingsTabsProps {
  value: string
  onChange: (value: string) => void
  tabs: EnterpriseSettingsTabItem[]
  ariaLabel?: string
}

export function EnterpriseSettingsTabs({
  value,
  onChange,
  tabs,
  ariaLabel = 'section tabs',
}: EnterpriseSettingsTabsProps) {
  const index = Math.max(
    0,
    tabs.findIndex((t) => t.value === value),
  )

  const handleChange = (_: SyntheticEvent, newIndex: number) => {
    const next = tabs[newIndex]?.value
    if (next != null) onChange(next)
  }

  return (
    <Box sx={{ borderBottom: 0 }}>
      <Tabs
        value={index}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={ariaLabel}
        sx={enterpriseSettingsTabsSx}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={tab.value}
            id={`enterprise-settings-tab-${i}`}
            aria-controls={`enterprise-settings-tabpanel-${i}`}
            label={
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
            }
          />
        ))}
      </Tabs>
    </Box>
  )
}
