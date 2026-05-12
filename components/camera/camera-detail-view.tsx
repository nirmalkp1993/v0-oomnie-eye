'use client'

import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Camera, Settings, Video, Film, Calendar, Terminal } from 'lucide-react'
import { CameraDetailsTab } from './tabs/camera-details-tab'
import { StreamConfigTab } from './tabs/stream-config-tab'
import { RecordingTab } from './tabs/recording-tab'
import { ScheduleTab } from './tabs/schedule-tab'
import { CameraLogTab } from './tabs/camera-log-tab'
import type { CameraTab } from '@/types/camera'

export function CameraDetailView() {
  const { selectedCamera, setSelectedCamera, activeTab, setActiveTab } = useCameraStore()

  if (!selectedCamera) return null

  const handleBack = () => {
    setSelectedCamera(null)
  }

  const tabs: { value: CameraTab; label: string; icon: React.ElementType }[] = [
    { value: 'details', label: 'Camera Details', icon: Camera },
    { value: 'stream', label: 'Stream Configuration', icon: Video },
    { value: 'recording', label: 'Recording', icon: Film },
    { value: 'schedule', label: 'Stream Recording Schedule', icon: Calendar },
    { value: 'logs', label: 'Camera Log', icon: Terminal },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back To Camera
          </Button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-accent">{selectedCamera.name}</h1>
            <Badge
              className={
                selectedCamera.status === 'live'
                  ? 'bg-live text-white'
                  : selectedCamera.status === 'connecting'
                  ? 'bg-warning text-warning-foreground'
                  : 'bg-stopped text-white'
              }
            >
              {selectedCamera.status.toUpperCase()}
            </Badge>
          </div>
          <Button variant="outline" className="gap-2 border-border text-muted-foreground">
            <Settings className="size-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CameraTab)}
        className="flex-1"
      >
        <div className="border-b border-border bg-card">
          <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative rounded-none border-b-2 border-transparent px-6 py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  <Icon className="mr-2 size-4" />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="details" className="mt-0">
            <CameraDetailsTab />
          </TabsContent>
          <TabsContent value="stream" className="mt-0">
            <StreamConfigTab />
          </TabsContent>
          <TabsContent value="recording" className="mt-0">
            <RecordingTab />
          </TabsContent>
          <TabsContent value="schedule" className="mt-0">
            <ScheduleTab />
          </TabsContent>
          <TabsContent value="logs" className="mt-0">
            <CameraLogTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
