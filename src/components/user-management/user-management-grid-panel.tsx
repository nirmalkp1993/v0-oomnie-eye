'use client'

import ClickAwayListener from '@mui/material/ClickAwayListener'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import { styled } from '@mui/material/styles'
import type { GridPanelProps } from '@mui/x-data-grid'
import { gridPanelClasses } from '@mui/x-data-grid'
import { gridPreferencePanelStateSelector } from '@mui/x-data-grid/hooks/features/preferencesPanel/gridPreferencePanelSelector'
import { GridPreferencePanelsValue } from '@mui/x-data-grid/hooks/features/preferencesPanel/gridPreferencePanelsValue'
import { useGridApiContext } from '@mui/x-data-grid/hooks/utils/useGridApiContext'
import { useGridRootProps } from '@mui/x-data-grid/hooks/utils/useGridRootProps'
import { useGridSelector } from '@mui/x-data-grid/hooks/utils/useGridSelector'
import { forwardRef, useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import clsx from 'clsx'

const GridPanelRoot = styled(Popper)(({ theme }) => ({
  zIndex: theme.zIndex.modal,
}))

const GridPaperRoot = styled(Paper)(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.paper,
  minWidth: 300,
  maxHeight: 450,
  display: 'flex',
  maxWidth: `calc(100vw - ${theme.spacing(0.5)})`,
  overflow: 'auto',
}))

/**
 * Anchors filter/columns panels to the toolbar buttons (via preferencePanel.labelId)
 * instead of the in-grid panel anchor below the column headers.
 */
export const UserManagementGridPanel = forwardRef<HTMLDivElement, GridPanelProps>(
  function UserManagementGridPanel(props, ref) {
    const { children, className, open, as: _as, ...other } = props
    const apiRef = useGridApiContext()
    const rootProps = useGridRootProps()
    const preferencePanel = useGridSelector(apiRef, gridPreferencePanelStateSelector)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [isPlaced, setIsPlaced] = useState(false)

    const placement =
      preferencePanel.openedPanelValue === GridPreferencePanelsValue.columns
        ? 'bottom-end'
        : 'bottom-start'

    const resolveAnchor = useCallback(() => {
      if (preferencePanel.labelId) {
        const byButton = document.getElementById(preferencePanel.labelId)
        if (byButton) return byButton
      }
      return (
        apiRef.current.rootElementRef?.current?.querySelector<HTMLElement>(
          '[data-id="gridPanelAnchor"]'
        ) ?? null
      )
    }, [apiRef, preferencePanel.labelId])

    useEffect(() => {
      if (!open) {
        setAnchorEl(null)
        setIsPlaced(false)
        return
      }
      setAnchorEl(resolveAnchor())
    }, [open, resolveAnchor, preferencePanel.labelId])

    const handleClickAway = useCallback(() => {
      apiRef.current.hidePreferences()
    }, [apiRef])

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          apiRef.current.hidePreferences()
        }
      },
      [apiRef]
    )

    const modifiers = useMemo(
      () => [
        {
          name: 'offset',
          options: { offset: [0, 8] },
        },
        {
          name: 'flip',
          enabled: true,
          options: { rootBoundary: 'document' },
        },
        {
          name: 'preventOverflow',
          enabled: true,
          options: { padding: 8, rootBoundary: 'document' },
        },
        {
          name: 'isPlaced',
          enabled: true,
          phase: 'main' as const,
          fn: () => {
            setIsPlaced(true)
          },
          effect: () => () => {
            setIsPlaced(false)
          },
        },
      ],
      []
    )

    if (!open || !anchorEl) {
      return null
    }

    return (
      <GridPanelRoot
        ref={ref}
        open={open}
        placement={placement}
        className={clsx(gridPanelClasses.panel, className)}
        ownerState={rootProps}
        anchorEl={anchorEl}
        modifiers={modifiers}
        {...other}
      >
        <ClickAwayListener
          mouseEvent="onPointerUp"
          touchEvent={false}
          onClickAway={handleClickAway}
        >
          <GridPaperRoot className={gridPanelClasses.paper} elevation={8} onKeyDown={handleKeyDown}>
            {isPlaced ? children : null}
          </GridPaperRoot>
        </ClickAwayListener>
      </GridPanelRoot>
    )
  }
)
