'use client'

import { lazy, Suspense, useState } from 'react'
import { Box, CircularProgress, Tab, Tabs } from '@mui/material'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined'
import { enterprisePageTabsSx } from '@/src/components/enterprise/enterprise-settings-tabs'
import { BitrixPermissionsProvider } from '@/src/contexts/bitrix-permissions-context'
import { EffectivePreviewTab } from '@/src/components/user-management/permissions/effective-preview-tab'
import { FieldPermissionsTab } from '@/src/components/user-management/permissions/field-permissions-tab'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
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
      <UserManagementPageShell title="Permissions">
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value: PermissionsTabId) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons={false}
            aria-label="Permissions sections"
            sx={[
              enterprisePageTabsSx,
              {
                mb: 2,
                minHeight: 'auto',
                '& .MuiTabs-flexContainer': {
                  gap: 0.5,
                },
                '& .MuiTab-root': {
                  minHeight: 34,
                  fontSize: '0.8125rem',
                  lineHeight: 1.3,
                  py: 0.625,
                  px: 1.5,
                  gap: 0.75,
                  '& .MuiTab-iconWrapper': {
                    marginBottom: 0,
                    marginRight: '8px',
                  },
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 18,
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                },
              },
            ]}
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
              pt: 1.5,
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
      </UserManagementPageShell>
    </BitrixPermissionsProvider>
  )
}
