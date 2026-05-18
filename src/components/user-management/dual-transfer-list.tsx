'use client'

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { useCallback, useMemo, useState } from 'react'

export interface TransferUserItem {
  id: string
  label: string
  secondary?: string
}

interface DualTransferListProps {
  available: TransferUserItem[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  leftTitle?: string
  rightTitle?: string
}

function filterItems(items: TransferUserItem[], q: string) {
  const s = q.trim().toLowerCase()
  if (!s) return items
  return items.filter((i) => i.label.toLowerCase().includes(s) || i.secondary?.toLowerCase().includes(s))
}

export function DualTransferList({
  available,
  selectedIds,
  onChange,
  leftTitle = 'Available Users',
  rightTitle = 'Selected Users',
}: DualTransferListProps) {
  const theme = useTheme()
  const [qLeft, setQLeft] = useState('')
  const [qRight, setQRight] = useState('')
  const [checkedLeft, setCheckedLeft] = useState<string[]>([])
  const [checkedRight, setCheckedRight] = useState<string[]>([])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const leftItems = useMemo(
    () => filterItems(available.filter((u) => !selectedSet.has(u.id)), qLeft),
    [available, selectedSet, qLeft]
  )
  const rightItems = useMemo(
    () => filterItems(available.filter((u) => selectedSet.has(u.id)), qRight),
    [available, selectedSet, qRight]
  )

  const toggleAll = useCallback(
    (side: 'left' | 'right', ids: string[], checked: boolean) => {
      if (side === 'left') {
        setCheckedLeft((prev) => {
          const set = new Set(prev)
          for (const id of ids) {
            if (checked) set.add(id)
            else set.delete(id)
          }
          return [...set]
        })
      } else {
        setCheckedRight((prev) => {
          const set = new Set(prev)
          for (const id of ids) {
            if (checked) set.add(id)
            else set.delete(id)
          }
          return [...set]
        })
      }
    },
    []
  )

  const addSelected = () => {
    const set = new Set(selectedIds)
    for (const id of checkedLeft) set.add(id)
    onChange([...set])
    setCheckedLeft([])
  }

  const removeSelected = () => {
    const set = new Set(selectedIds)
    for (const id of checkedRight) set.delete(id)
    onChange([...set])
    setCheckedRight([])
  }

  const panel = (side: 'left' | 'right', title: string, items: TransferUserItem[], q: string, setQ: (v: string) => void) => {
    const checked = side === 'left' ? checkedLeft : checkedRight
    const setChecked = side === 'left' ? setCheckedLeft : setCheckedRight
    const allIds = items.map((i) => i.id)
    const allChecked = allIds.length > 0 && allIds.every((id) => checked.includes(id))

    return (
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, 0.6),
        }}
      >
        <Box sx={{ p: 1.5, pb: 1 }}>
          <p className="text-sm font-medium text-accent">{title}</p>
          <TextField
            size="small"
            fullWidth
            placeholder="Search…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ mt: 1 }}
          />
        </Box>
        <Divider />
        <ListItem dense sx={{ px: 2 }}>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={allChecked}
              indeterminate={checked.length > 0 && !allChecked}
              onChange={(e) => toggleAll(side, allIds, e.target.checked)}
            />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }} primary="Select all (visible)" />
        </ListItem>
        <Divider />
        <List dense sx={{ flex: 1, overflow: 'auto', maxHeight: 280, py: 0 }}>
          {items.map((item) => {
            const isChecked = checked.includes(item.id)
            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  dense
                  onClick={() => {
                    setChecked((prev) =>
                      prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                    )
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox edge="start" tabIndex={-1} checked={isChecked} />
                  </ListItemIcon>
                  <ListItemText primary={item.label} secondary={item.secondary} />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', flexDirection: { xs: 'column', md: 'row' } }}>
      {panel('left', leftTitle, leftItems, qLeft, setQLeft)}
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1, py: { xs: 0, md: 4 } }}>
        <Button variant="outlined" endIcon={<ChevronRightIcon />} onClick={addSelected} disabled={checkedLeft.length === 0}>
          Add {'>>'}
        </Button>
        <Button variant="outlined" startIcon={<ChevronLeftIcon />} onClick={removeSelected} disabled={checkedRight.length === 0}>
          {'<<'} Remove
        </Button>
      </Box>
      {panel('right', rightTitle, rightItems, qRight, setQRight)}
    </Box>
  )
}
