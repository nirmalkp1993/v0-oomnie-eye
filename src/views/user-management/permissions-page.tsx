'use client'

import { useState } from 'react'
import { Box, Tab, Tabs } from '@mui/material'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined'
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined'
import { settingsChildTabsSx } from '@/src/components/settings/settings-module-tabs.styles'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import { EffectivePreviewTab } from '@/src/components/user-management/permissions/effective-preview-tab'
import { FieldPermissionsTab } from '@/src/components/user-management/permissions/field-permissions-tab'
import { PermissionMatrixTab } from '@/src/components/user-management/permissions/permission-matrix-tab'
import type { PermissionsTabId } from '@/src/types/permissions-page'

export function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<PermissionsTabId>('matrix')

  return (
    <UserManagementPageShell
      title="Permissions"
      description=""
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value: PermissionsTabId) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Permissions sections"
          sx={settingsChildTabsSx}
        >
          <Tab
            value="matrix"
            icon={<GridViewOutlinedIcon />}
            iconPosition="start"
            label="Permission matrix"
            id="permissions-tab-matrix"
            aria-controls="permissions-tabpanel-matrix"
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
          sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}
        >
          {activeTab === 'matrix' ? <PermissionMatrixTab /> : null}
          {activeTab === 'fields' ? <FieldPermissionsTab /> : null}
          {activeTab === 'effective' ? <EffectivePreviewTab /> : null}
        </Box>
      </Box>
    </UserManagementPageShell>
  )
}
