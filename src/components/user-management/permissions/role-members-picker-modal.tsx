'use client'

import { useEffect, useMemo, useState } from 'react'
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import SearchIcon from '@mui/icons-material/Search'
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import {
  buildRoleMemberPickerKey,
  filterPickerItems,
  getRoleMemberPickerItems,
  keysToSelection,
  selectionToKeys,
} from '@/src/lib/user-management/role-members-picker.utils'
import { isSystemRole } from '@/src/lib/user-management/bitrix-permissions.utils'
import type { RoleMemberPickerItem, RoleMemberSelection } from '@/src/types/permissions-page'
import type { RoleListItem } from '@/src/types/user-management'

type RoleMemberPickerTab = 'users' | 'groups'

const TAB_OPTIONS: Array<{ id: RoleMemberPickerTab; label: string; icon: React.ReactNode }> = [
  { id: 'users', label: 'Users', icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} /> },
  { id: 'groups', label: 'User groups', icon: <Groups2OutlinedIcon sx={{ fontSize: 16 }} /> },
]

function formatSelectedCount(selection: RoleMemberSelection): string {
  const users = selection.userIds.length
  const groups = selection.groupIds.length
  if (users === 0 && groups === 0) return 'No members selected'
  const parts: string[] = []
  if (users > 0) parts.push(`${users} user${users === 1 ? '' : 's'}`)
  if (groups > 0) parts.push(`${groups} group${groups === 1 ? '' : 's'}`)
  return parts.join(', ')
}

function CheckboxPickerRow({
  item,
  checked,
  disabled,
  onToggle,
}: {
  item: RoleMemberPickerItem
  checked: boolean
  disabled?: boolean
  onToggle: () => void
}) {
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        width: '100%',
        px: 1.5,
        py: 1,
        border: 'none',
        borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
        bgcolor: checked ? '#eef6fb' : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        '&:hover': disabled ? undefined : { bgcolor: checked ? '#eef6fb' : BITRIX_ACCESS_UI.rowHoverBg },
      }}
    >
      <Checkbox
        checked={checked}
        size="small"
        disabled={disabled}
        tabIndex={-1}
        sx={{ p: 0, flexShrink: 0 }}
      />
      {item.type === 'user' ? (
        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', flexShrink: 0 }}>
          {item.label.slice(0, 1).toUpperCase()}
        </Avatar>
      ) : (
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: '#e8f7fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: BITRIX_ACCESS_UI.linkBlue,
          }}
        >
          <Groups2OutlinedIcon sx={{ fontSize: 14 }} />
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.3 }}>
          {item.label}
        </Typography>
        {item.subtitle ? (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.3 }}>
            {item.subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}

export function RoleMembersPickerModal({
  open,
  role,
  selection,
  onClose,
  onSave,
}: {
  open: boolean
  role: RoleListItem | null
  selection: RoleMemberSelection
  onClose: () => void
  onSave: (selection: RoleMemberSelection) => void
}) {
  const [activeTab, setActiveTab] = useState<RoleMemberPickerTab>('users')
  const [search, setSearch] = useState('')
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())

  const readOnly = role ? isSystemRole(role.id) : false
  const pickerData = useMemo(() => getRoleMemberPickerItems(), [])

  useEffect(() => {
    if (!open) return
    setActiveTab('users')
    setSearch('')
    setSelectedKeys(new Set(selectionToKeys(selection)))
  }, [open, selection])

  const effectiveSelection = useMemo(() => keysToSelection(selectedKeys), [selectedKeys])

  const tabItems = useMemo(
    () => (activeTab === 'users' ? pickerData.users : pickerData.groups),
    [activeTab, pickerData.groups, pickerData.users],
  )

  const visibleItems = useMemo(() => filterPickerItems(tabItems, search), [tabItems, search])

  const toggle = (item: RoleMemberPickerItem) => {
    if (readOnly) return
    const key = buildRoleMemberPickerKey(item.type, item.id)
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const save = () => {
    onSave(keysToSelection(selectedKeys))
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 520,
          maxWidth: 'calc(100vw - 32px)',
          borderRadius: 2,
          border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
          fontFamily: BITRIX_ACCESS_UI.fontFamily,
        },
      }}
    >
      <DialogContent sx={{ p: 2, pb: 1 }}>
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, mb: 1 }}>
          {role ? `Assign members to ${role.name}` : 'Assign members'}
        </Typography>

        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search"
          size="small"
          fullWidth
          sx={{ mb: 1.5 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: 'flex',
            minHeight: 340,
            border: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
            borderRadius: 1.5,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: 148,
              borderRight: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
              bgcolor: '#f7f9fb',
              p: 1,
            }}
          >
            {TAB_OPTIONS.map((tab) => {
              const selected = activeTab === tab.id
              return (
                <Button
                  key={tab.id}
                  fullWidth
                  onClick={() => {
                    setActiveTab(tab.id)
                    setSearch('')
                  }}
                  startIcon={tab.icon}
                  sx={{
                    mb: 0.75,
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.8125rem',
                    borderRadius: 1,
                    color: selected ? '#fff' : BITRIX_ACCESS_UI.textPrimary,
                    bgcolor: selected ? BITRIX_ACCESS_UI.linkBlue : 'transparent',
                    '& .MuiButton-startIcon': { mr: 0.75 },
                    '&:hover': {
                      bgcolor: selected ? BITRIX_ACCESS_UI.linkBlue : '#eef2f4',
                    },
                  }}
                >
                  {tab.label}
                </Button>
              )
            })}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 1.5, py: 0.75, bgcolor: BITRIX_ACCESS_UI.sectionBg }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
                {activeTab === 'users' ? 'Select users' : 'Select user groups'}
              </Typography>
            </Box>
            <Divider />
            {visibleItems.length === 0 ? (
              <Typography sx={{ p: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                No items found.
              </Typography>
            ) : (
              <Box sx={{ flex: 1, overflow: 'auto', maxHeight: 300 }}>
                {visibleItems.map((item) => {
                  const key = buildRoleMemberPickerKey(item.type, item.id)
                  return (
                    <CheckboxPickerRow
                      key={key}
                      item={item}
                      checked={selectedKeys.has(key)}
                      disabled={readOnly}
                      onToggle={() => toggle(item)}
                    />
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 2, pb: 2, pt: 1 }}>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          {formatSelectedCount(effectiveSelection)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose} variant="outlined" size="small">
            {readOnly ? 'Close' : 'Cancel'}
          </Button>
          {!readOnly ? (
            <Button onClick={save} variant="contained" size="small">
              Save
            </Button>
          ) : null}
        </Box>
      </DialogActions>
    </Dialog>
  )
}
