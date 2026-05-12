'use client'

import { useState } from 'react'
import { AppSidebar, type AppTab } from '@/components/camera/app-sidebar'
import { AppHeader } from '@/components/camera/app-header'
import { CameraManagement } from '@/components/camera/camera-management'
import { EarthView } from '@/components/earth/earth-view'

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>('earth')

  return (
    <div className="flex h-screen">
      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-background">
          {activeTab === 'earth' && <EarthView />}
          {activeTab === 'camera' && <CameraManagement />}
          {activeTab !== 'earth' && activeTab !== 'camera' && (
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
