'use client'

import AutoAwesomeMotionOutlinedIcon from '@mui/icons-material/AutoAwesomeMotionOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import ViewQuiltOutlinedIcon from '@mui/icons-material/ViewQuiltOutlined'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  BITRIX_CATEGORY_LABELS,
  getModuleDisplayName,
  getModulesByCategory,
} from '@/src/constants/permissions-page-matrix'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import type { BitrixModuleCategory } from '@/src/types/permissions-page'

const CATEGORY_ORDER: BitrixModuleCategory[] = [
  'crm',
  'forms',
  'widgets',
  'automations',
  'platform',
]

const CATEGORY_ICONS: Record<BitrixModuleCategory, typeof CategoryOutlinedIcon> = {
  crm: CategoryOutlinedIcon,
  forms: ViewQuiltOutlinedIcon,
  widgets: HubOutlinedIcon,
  automations: AutoAwesomeMotionOutlinedIcon,
  platform: CategoryOutlinedIcon,
}

/** Bitrix sidebar: top-level sections; CRM shows entity list underneath. */
export function PermissionCategorySidebar({
  selectedCategory,
  onSelectCategory,
  selectedModuleId,
  onSelectModule,
  searchQuery = '',
}: {
  selectedCategory: BitrixModuleCategory
  onSelectCategory: (category: BitrixModuleCategory) => void
  selectedModuleId: string | null
  onSelectModule: (moduleId: string) => void
  searchQuery?: string
}) {
  const q = searchQuery.trim().toLowerCase()

  return (
    <Box
      sx={{
        width: BITRIX_ACCESS_UI.sidebarWidth,
        flexShrink: 0,
        borderRight: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
        bgcolor: '#fff',
        overflow: 'auto',
        fontFamily: BITRIX_ACCESS_UI.fontFamily,
      }}
    >
      {CATEGORY_ORDER.map((category) => {
        const modules = getModulesByCategory(category).filter((m) => {
          if (!q) return true
          const name = getModuleDisplayName(m).toLowerCase()
          return name.includes(q) || m.id.includes(q)
        })
        if (modules.length === 0 && q) return null

        const isCategorySelected = selectedCategory === category
        const isCrm = category === 'crm'
        const CategoryIcon = CATEGORY_ICONS[category]

        return (
          <Box key={category}>
            <ListItemButton
              selected={isCategorySelected && !isCrm}
              onClick={() => onSelectCategory(category)}
              sx={{
                py: 1.1,
                px: 1.75,
                borderBottom: `1px solid ${BITRIX_ACCESS_UI.borderColor}`,
                bgcolor: isCategorySelected ? '#eef9fc' : 'transparent',
                '&.Mui-selected': { bgcolor: '#eef9fc' },
                '&.Mui-selected:hover': { bgcolor: '#e3f5fa' },
                '&:hover': { bgcolor: isCategorySelected ? '#e3f5fa' : BITRIX_ACCESS_UI.sectionBg },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CategoryIcon
                  sx={{
                    fontSize: 18,
                    color: isCategorySelected ? BITRIX_ACCESS_UI.linkBlue : BITRIX_ACCESS_UI.textSecondary,
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={BITRIX_CATEGORY_LABELS[category]}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontSize: '0.8125rem',
                  fontWeight: isCategorySelected ? 600 : 500,
                  color: isCategorySelected ? BITRIX_ACCESS_UI.linkBlue : BITRIX_ACCESS_UI.textPrimary,
                }}
              />
              {isCategorySelected ? (
                <ExpandLessIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
              )}
            </ListItemButton>

            {isCategorySelected && isCrm ? (
              <List dense disablePadding sx={{ pb: 0.5, bgcolor: '#fff' }}>
                {modules.map((mod) => {
                  const selected = selectedModuleId === mod.id
                  return (
                    <ListItemButton
                      key={mod.id}
                      selected={selected}
                      onClick={() => onSelectModule(mod.id)}
                      sx={{
                        py: 0.55,
                        pl: 4.5,
                        pr: 1.75,
                        minHeight: 32,
                        bgcolor: selected ? '#f0f9fc' : 'transparent',
                        borderLeft: '3px solid',
                        borderColor: selected ? BITRIX_ACCESS_UI.primaryBlue : 'transparent',
                        '&:hover': { bgcolor: selected ? '#f0f9fc' : BITRIX_ACCESS_UI.sectionBg },
                      }}
                    >
                      <ListItemText
                        primary={getModuleDisplayName(mod)}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontSize: '0.8125rem',
                          fontWeight: selected ? 600 : 400,
                          color: selected ? BITRIX_ACCESS_UI.linkBlue : BITRIX_ACCESS_UI.textPrimary,
                        }}
                      />
                    </ListItemButton>
                  )
                })}
              </List>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}
