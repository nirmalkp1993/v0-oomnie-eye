'use client'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import { Box, Menu, Tooltip, Typography } from '@mui/material'
import { BITRIX_SCOPE_DROPDOWN_OPTIONS } from '@/src/constants/role-catalog'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import {
  coerceScopeGrantValues,
  formatScopeGrantLabel,
  getScopeGrantLabels,
  isScopeGrantDenied,
  isScopeOptionSelected,
  toggleScopeGrantOption,
} from '@/src/lib/user-management/bitrix-permissions.utils'
import type { ScopeGrantSelection, ScopeGrantValue } from '@/src/types/permissions-page'
import type { DataScopeId } from '@/src/types/user-management'
import {
  BitrixAccessMenuDivider,
  BitrixAccessMenuFooter,
  BitrixAccessMenuHeader,
  BitrixAccessMenuItem,
  bitrixAccessMenuPaperSx,
} from './bitrix-access-menu'

function cloneScopeGrantSelection(value: ScopeGrantSelection): ScopeGrantSelection {
  if (Array.isArray(value)) return [...value]
  return value
}

const SCOPE_ICONS: Record<DataScopeId | 'deny', { icon: typeof BlockOutlinedIcon; color: string }> = {
  deny: { icon: BlockOutlinedIcon, color: '#e74c3c' },
  office: { icon: BusinessOutlinedIcon, color: '#2067b0' },
  department: { icon: AccountTreeOutlinedIcon, color: '#8e44ad' },
  department_subdepartments: { icon: CorporateFareOutlinedIcon, color: '#16a085' },
  public_data: { icon: PublicOutlinedIcon, color: '#27ae60' },
  own_records: { icon: BusinessOutlinedIcon, color: '#2067b0' },
  assigned_records: { icon: BusinessOutlinedIcon, color: '#2067b0' },
  country: { icon: PublicOutlinedIcon, color: '#27ae60' },
  territory: { icon: PublicOutlinedIcon, color: '#27ae60' },
  region: { icon: PublicOutlinedIcon, color: '#27ae60' },
  business_unit: { icon: CorporateFareOutlinedIcon, color: '#16a085' },
  all_tenant_data: { icon: PublicOutlinedIcon, color: '#27ae60' },
  global_all_tenants: { icon: PublicOutlinedIcon, color: '#27ae60' },
  custom_filter: { icon: AccountTreeOutlinedIcon, color: '#8e44ad' },
}

function ScopeOptionIcon({ scopeId }: { scopeId: DataScopeId | 'deny' }) {
  const config = SCOPE_ICONS[scopeId] ?? SCOPE_ICONS.office
  const Icon = config.icon
  return <Icon sx={{ fontSize: 17, color: config.color }} />
}

/** Lightweight scope cell — menu mounts only when opened (no per-cell Select). */
export const PermissionScopeCell = memo(function PermissionScopeCell({
  value,
  onChange,
  disabled = false,
  label,
}: {
  value: ScopeGrantSelection
  onChange: (value: ScopeGrantSelection) => void
  disabled?: boolean
  label: string
}) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null)
  const [draft, setDraft] = useState<ScopeGrantSelection>(value)
  const open = Boolean(anchor)
  const display = formatScopeGrantLabel(value)
  const tooltipLabels = useMemo(() => getScopeGrantLabels(value), [value])
  const isDeny = isScopeGrantDenied(value)
  const draftIsDeny = isScopeGrantDenied(draft)
  const draftSelectedCount = coerceScopeGrantValues(draft).length

  useEffect(() => {
    if (!open) setDraft(cloneScopeGrantSelection(value))
  }, [open, value])

  const subtitle = useMemo(() => {
    if (draftIsDeny) return 'No access selected. Choose one or more scopes below.'
    if (draftSelectedCount === 1) return '1 scope selected. Add more or click Done.'
    return `${draftSelectedCount} scopes selected. Click Done when finished.`
  }, [draftIsDeny, draftSelectedCount])

  const handleToggle = useCallback((optionId: ScopeGrantValue) => {
    setDraft((prev) => toggleScopeGrantOption(prev, optionId))
  }, [])

  const openMenu = useCallback(
    (element: HTMLElement) => {
      setDraft(cloneScopeGrantSelection(value))
      setAnchor(element)
    },
    [value],
  )

  const closeMenu = useCallback(() => setAnchor(null), [])

  const handleDone = useCallback(() => {
    onChange(draft)
    closeMenu()
  }, [closeMenu, draft, onChange])

  const scopeTrigger = (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      aria-label={label}
      aria-haspopup="listbox"
      aria-expanded={open}
      onClick={(e) => {
        if (!disabled) openMenu(e.currentTarget)
      }}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        bgcolor: open ? BITRIX_ACCESS_UI.accentHoverBg : 'transparent',
        borderRadius: 1,
        px: 0.5,
        py: 0.25,
        m: 0,
        cursor: disabled ? 'default' : 'pointer',
        maxWidth: '100%',
        transition: 'background-color 0.15s ease',
        '&:hover': disabled
          ? {}
          : {
              bgcolor: BITRIX_ACCESS_UI.accentHoverBg,
            },
      }}
    >
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontSize: '0.8125rem',
          color: isDeny ? BITRIX_ACCESS_UI.denyColor : BITRIX_ACCESS_UI.linkBlue,
          fontWeight: isDeny ? 400 : 500,
          maxWidth: 132,
          borderBottom: isDeny || disabled ? 'none' : `1px dotted ${BITRIX_ACCESS_UI.linkBlue}`,
          lineHeight: 1.5,
          textDecoration: 'none',
          '&:hover': disabled
            ? {}
            : {
                color: BITRIX_ACCESS_UI.linkBlue,
                borderBottomColor: BITRIX_ACCESS_UI.linkBlue,
              },
        }}
      >
        {display}
      </Typography>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Tooltip
        title={
          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 2,
              py: 0.25,
              listStyleType: 'disc',
              '& li': { fontSize: '0.75rem', lineHeight: 1.45 },
            }}
          >
            {tooltipLabels.map((item) => (
              <Box component="li" key={item}>
                {item}
              </Box>
            ))}
          </Box>
        }
        placement="top"
        arrow
        enterDelay={400}
      >
        {disabled ? (
          <Box component="span" sx={{ display: 'inline-flex', maxWidth: '100%' }}>
            {scopeTrigger}
          </Box>
        ) : (
          scopeTrigger
        )}
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          paper: { sx: bitrixAccessMenuPaperSx },
        }}
      >
        <BitrixAccessMenuHeader title="Access scope" subtitle={subtitle} />
        <BitrixAccessMenuDivider />
        {BITRIX_SCOPE_DROPDOWN_OPTIONS.map((opt, index) => (
          <Box key={opt.id}>
            {index === 1 ? <BitrixAccessMenuDivider /> : null}
            <BitrixAccessMenuItem
              icon={<ScopeOptionIcon scopeId={opt.id} />}
              title={opt.title}
              description={opt.description}
              selected={isScopeOptionSelected(draft, opt.id)}
              destructive={opt.id === 'deny'}
              multiSelect={opt.id !== 'deny'}
              onClick={() => handleToggle(opt.id)}
            />
          </Box>
        ))}
        <BitrixAccessMenuDivider />
        <BitrixAccessMenuFooter onDone={handleDone} />
      </Menu>
    </Box>
  )
})
