'use client'

import type { ElementType, ReactNode, SyntheticEvent } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { Box, Tab, Tabs, ThemeProvider } from '@mui/material'
import { cn } from '@/lib/utils'
import { muiPlacemarkClusterTheme } from '@/src/components/theme/mui-placemark-cluster-theme'

export interface DialogEarthTabConfig {
  value: string
  label: string
  icon: ElementType<{ className?: string }>
}

interface DialogEarthTabsContextValue {
  activeValue: string
  tabs: DialogEarthTabConfig[]
  registerPanel: (value: string, el: HTMLElement | null) => void
}

const DialogEarthTabsContext = createContext<DialogEarthTabsContextValue>({
  activeValue: '',
  tabs: [],
  registerPanel: () => {},
})

interface DialogEarthTabsProps {
  value: string
  onValueChange: (value: string) => void
  tabs: DialogEarthTabConfig[]
  children: ReactNode
  className?: string
  contentClassName?: string
}

const earthDialogTabsSx = {
  borderBottom: 1,
  borderColor: 'divider',
  mx: -3,
  px: 3,
  mb: 0,
  minHeight: 64,
  flexShrink: 0,
  '& .MuiTab-root': {
    minHeight: 64,
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
  },
  '& .MuiTabs-indicator': { height: 4, backgroundColor: 'primary.main' },
} as const

function DialogEarthTabsInner({
  value,
  onValueChange,
  tabs,
  children,
  className,
  contentClassName,
}: DialogEarthTabsProps) {
  const index = Math.max(0, tabs.findIndex((t) => t.value === value))
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<Map<string, HTMLElement>>(new Map())

  const registerPanel = useCallback((panelValue: string, el: HTMLElement | null) => {
    if (el) panelRefs.current.set(panelValue, el)
    else panelRefs.current.delete(panelValue)
  }, [])

  const scrollToPanel = useCallback((panelValue: string, behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current
    const panel = panelRefs.current.get(panelValue)
    if (!container || !panel) return

    const containerTop = container.getBoundingClientRect().top
    const panelTop = panel.getBoundingClientRect().top
    const nextTop = container.scrollTop + (panelTop - containerTop)

    container.scrollTo({ top: nextTop, behavior })
  }, [])

  const handleChange = (_: SyntheticEvent, newIndex: number) => {
    const next = tabs[newIndex]?.value
    if (next != null) onValueChange(next)
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollToPanel(value)
    })
    return () => cancelAnimationFrame(frame)
  }, [value, scrollToPanel])

  const contextValue = useMemo(
    () => ({ activeValue: value, tabs, registerPanel }),
    [value, tabs, registerPanel]
  )

  return (
    <DialogEarthTabsContext.Provider value={contextValue}>
      <Box className={cn('flex min-h-0 flex-col', className)}>
        <Tabs value={index} onChange={handleChange} variant="scrollable" scrollButtons="auto" sx={earthDialogTabsSx}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Tab
                key={tab.value}
                id={`dialog-earth-tab-${tab.value}`}
                aria-controls={`dialog-earth-panel-${tab.value}`}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon className="size-4" aria-hidden />
                    {tab.label}
                  </Box>
                }
              />
            )
          })}
        </Tabs>
        <Box
          ref={scrollContainerRef}
          className={cn('min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2', contentClassName)}
        >
          {children}
        </Box>
      </Box>
    </DialogEarthTabsContext.Provider>
  )
}

export function DialogEarthTabs(props: DialogEarthTabsProps) {
  return (
    <ThemeProvider theme={muiPlacemarkClusterTheme}>
      <DialogEarthTabsInner {...props} />
    </ThemeProvider>
  )
}

/** Section on the shared scroll page — all panels stay mounted and visible */
export function TabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: ReactNode
  className?: string
}) {
  const { activeValue, registerPanel } = useContext(DialogEarthTabsContext)
  const isActive = value === activeValue

  return (
    <Box
      ref={(el) => registerPanel(value, el)}
      role="tabpanel"
      id={`dialog-earth-panel-${value}`}
      aria-labelledby={`dialog-earth-tab-${value}`}
      className={className}
      sx={{
        scrollMarginTop: 8,
        pb: 3,
        '&:last-child': { pb: 1 },
      }}
      aria-current={isActive ? 'true' : undefined}
    >
      {children}
    </Box>
  )
}
