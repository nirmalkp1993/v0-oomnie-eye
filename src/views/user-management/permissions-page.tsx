'use client'

import { lazy, Suspense, useState } from 'react'
import { Box, CircularProgress, Tab, Tabs, Typography } from '@mui/material'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined'
import { BITRIX_ACCESS_UI } from '@/src/constants/bitrix-access-ui'
import { bitrixPermissionsTabsSx } from '@/src/components/user-management/permissions/bitrix-permissions-tabs.styles'
import { BitrixPermissionsProvider } from '@/src/contexts/bitrix-permissions-context'
import { EffectivePreviewTab } from '@/src/components/user-management/permissions/effective-preview-tab'
import { FieldPermissionsTab } from '@/src/components/user-management/permissions/field-permissions-tab'
import type { PermissionsTabId } from '@/src/types/permissions-page'

const BitrixAccessPermissionsView = lazy(
  () =>
    import('@/src/views/user-management/bitrix-access-permissions-view').then((m) => ({
      default: m.BitrixAccessPermissionsView,
    })),
)

function TabLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={28} />
    </Box>
  )
}

export function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<PermissionsTabId>('access')

  return (
    <BitrixPermissionsProvider>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          p: { xs: 2, md: 3 },
          bgcolor: 'background.default',
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 600,
            fontSize: '1.25rem',
            color: BITRIX_ACCESS_UI.textPrimary,
            fontFamily: BITRIX_ACCESS_UI.fontFamily,
            mb: 2,
          }}
        >
          Permissions
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value: PermissionsTabId) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons={false}
            aria-label="Permissions sections"
            sx={bitrixPermissionsTabsSx}
          >
            <Tab
              value="access"
              icon={<GridViewOutlinedIcon />}
              iconPosition="start"
              label="Access permissions"
              id="permissions-tab-access"
              aria-controls="permissions-tabpanel-access"
            />
            <Tab
              value="fields"
              icon={<ViewColumnOutlinedIcon />}
              iconPosition="start"
              label="Field permissions"
              id="permissions-tab-fields"
              aria-controls="permissions-tabpanel-fields"
            />
            <Tab
              value="effective"
              icon={<PreviewOutlinedIcon />}
              iconPosition="start"
              label="Effective preview"
              id="permissions-tab-effective"
              aria-controls="permissions-tabpanel-effective"
            />
          </Tabs>

          <Box
            role="tabpanel"
            id={`permissions-tabpanel-${activeTab}`}
            aria-labelledby={`permissions-tab-${activeTab}`}
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              pt: activeTab === 'access' ? 1.5 : 2,
            }}
          >
            {activeTab === 'access' ? (
              <Suspense fallback={<TabLoader />}>
                <BitrixAccessPermissionsView />
              </Suspense>
            ) : null}
            {activeTab === 'fields' ? <FieldPermissionsTab /> : null}
            {activeTab === 'effective' ? <EffectivePreviewTab /> : null}
          </Box>
        </Box>
      </Box>
    </BitrixPermissionsProvider>
  )
}
