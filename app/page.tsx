import { AppSidebar } from '@/components/camera/app-sidebar'
import { AppHeader } from '@/components/camera/app-header'
import { CameraManagement } from '@/components/camera/camera-management'

export default function Home() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-auto bg-background">
          <CameraManagement />
        </main>
      </div>
    </div>
  )
}
