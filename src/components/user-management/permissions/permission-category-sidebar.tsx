'use client'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import {
  BITRIX_ACCESS_MODULES,
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
        borderRight: '1px solid',
        borderColor: BITRIX_ACCESS_UI.borderColor,
        bgcolor: 'background.paper',
        maxHeight: 640,
        overflow: 'auto',
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

        return (
          <Box key={category}>
            <ListItemButton
              selected={isCategorySelected && !isCrm}
              onClick={() => onSelectCategory(category)}
              sx={{
                py: 1.25,
                px: 2,
                borderBottom: '1px solid',
                borderColor: BITRIX_ACCESS_UI.borderColor,
                bgcolor: isCategorySelected ? '#e8f7fc' : 'transparent',
                '&.Mui-selected': { bgcolor: '#e8f7fc' },
                '&.Mui-selected:hover': { bgcolor: '#dff3fa' },
              }}
            >
              <ListItemText
                primary={BITRIX_CATEGORY_LABELS[category]}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: isCategorySelected ? 600 : 500,
                  color: isCategorySelected ? BITRIX_ACCESS_UI.linkBlue : 'text.primary',
                }}
              />
              {isCategorySelected ? (
                <ExpandLessIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 18, color: BITRIX_ACCESS_UI.textSecondary }} />
              )}
            </ListItemButton>

            {isCategorySelected && isCrm ? (
              <List dense disablePadding sx={{ pb: 1 }}>
                {modules.map((mod) => {
                  const selected = selectedModuleId === mod.id
                  return (
                    <ListItemButton
                      key={mod.id}
                      selected={selected}
                      onClick={() => onSelectModule(mod.id)}
                      sx={{
                        py: 0.65,
                        pl: 3,
                        pr: 2,
                        bgcolor: selected ? '#f0f9fc' : 'transparent',
                        borderLeft: '3px solid',
                        borderColor: selected ? BITRIX_ACCESS_UI.primaryBlue : 'transparent',
                      }}
                    >
                      <ListItemText
                        primary={getModuleDisplayName(mod)}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontSize: '0.8125rem',
                          fontWeight: selected ? 600 : 400,
                          color: selected ? BITRIX_ACCESS_UI.linkBlue : 'text.primary',
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

export function getDefaultCategoryModules(category: BitrixModuleCategory) {
  return getModulesByCategory(category)
}

export { BITRIX_ACCESS_MODULES }
