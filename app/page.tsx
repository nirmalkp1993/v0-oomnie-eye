'use client'

import { useCallback, useEffect, useState } from 'react'
import { AppSidebar, type AppTab, isCameraTab, isUserManagementTab } from '@/components/camera/app-sidebar'
import { AppHeader } from '@/components/camera/app-header'
import { CameraManagement } from '@/components/camera/camera-management'
import { CameraRecordingView } from '@/components/camera/camera-recording-view'
import { EarthView } from '@/components/earth/earth-view'
import { ReportManagement } from '@/components/report/report-management'
import { MuiAdminProvider } from '@/src/components/providers/mui-admin-provider'
import { GroupsPage } from '@/src/views/user-management/groups-page'
import { PermissionsPage } from '@/src/views/user-management/permissions-page'
import { RolesPage } from '@/src/views/user-management/roles-page'
import { UsersPage } from '@/src/views/user-management/users-page'
import { useImpersonationStore } from '@/lib/impersonation-store'
import { ImpersonationBanner } from '@/src/components/user-management/impersonation-banner'

function usesEnterpriseTheme(tab: AppTab): boolean {
  return isCameraTab(tab) || tab === 'reports' || isUserManagementTab(tab)
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('earth')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((prev) => !prev)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        setSidebarExpanded((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    useImpersonationStore.getState().hydrate()
  }, [])

  const mainContent = (
    <>
      {activeTab === 'earth' && <EarthView />}
      {activeTab === 'camera' && <CameraManagement mode="cameras" />}
      {activeTab === 'camera-groups' && <CameraManagement mode="groups" />}
      {activeTab === 'camera-recording' && <CameraRecordingView />}
      {activeTab === 'reports' && <ReportManagement />}
      {activeTab === 'um-users' && <UsersPage />}
      {activeTab === 'um-groups' && <GroupsPage />}
      {activeTab === 'um-roles' && <RolesPage />}
      {activeTab === 'um-permissions' && <PermissionsPage />}
      {activeTab !== 'earth' &&
        !isCameraTab(activeTab) &&
        activeTab !== 'reports' &&
        !isUserManagementTab(activeTab) && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-accent capitalize">{activeTab}</h2>
              <p className="mt-2 text-muted-foreground">This section is under development</p>
            </div>
          </div>
        )}
    </>
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppHeader sidebarExpanded={sidebarExpanded} onSidebarToggle={toggleSidebar} />
      <ImpersonationBanner />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AppSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          expanded={sidebarExpanded}
          onExpandedChange={setSidebarExpanded}
        />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-background">
          {usesEnterpriseTheme(activeTab) ? (
            <MuiAdminProvider>{mainContent}</MuiAdminProvider>
          ) : (
            mainContent
          )}
        </main>
      </div>
    </div>
  )
}
