'use client'

import { useState } from 'react'
import { AppSidebar, type AppTab, isUserManagementTab } from '@/components/camera/app-sidebar'
import { AppHeader } from '@/components/camera/app-header'
import { CameraManagement } from '@/components/camera/camera-management'
import { EarthView } from '@/components/earth/earth-view'
import { ReportManagement } from '@/components/report/report-management'
import { MuiAdminProvider } from '@/src/components/providers/mui-admin-provider'
import { GroupsPage } from '@/src/views/user-management/groups-page'
import { RoleAssignmentPage } from '@/src/views/user-management/role-assignment-page'
import { RolesPermissionsPage } from '@/src/views/user-management/roles-permissions-page'
import { UsersPage } from '@/src/views/user-management/users-page'

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('earth')

  return (
    <div className="flex h-screen">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
          {activeTab === 'earth' && <EarthView />}
          {activeTab === 'camera' && <CameraManagement />}
          {activeTab === 'reports' && <ReportManagement />}
          {isUserManagementTab(activeTab) && (
            <MuiAdminProvider>
              <div className="flex min-h-0 flex-1 flex-col bg-background text-foreground antialiased">
                {activeTab === 'um-users' && <UsersPage />}
                {activeTab === 'um-groups' && <GroupsPage />}
                {activeTab === 'um-roles' && <RolesPermissionsPage />}
                {activeTab === 'um-role-assignment' && <RoleAssignmentPage />}
              </div>
            </MuiAdminProvider>
          )}
          {activeTab !== 'earth' &&
            activeTab !== 'camera' &&
            activeTab !== 'reports' &&
            !isUserManagementTab(activeTab) && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-accent capitalize">{activeTab}</h2>
                  <p className="mt-2 text-muted-foreground">This section is under development</p>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  )
}
