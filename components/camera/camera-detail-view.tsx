'use client'

import { useCameraStore } from '@/lib/camera-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ArrowLeft, Camera, Video, Film, Calendar, Terminal } from 'lucide-react'
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
      <div className="border-b border-border bg-card px-6 py-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleBack}
                aria-label="Back to camera"
                className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              Back to camera
            </TooltipContent>
          </Tooltip>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="truncate text-2xl font-bold text-accent">{selectedCamera.name}</h1>
            <Badge
              className={cn(
                'shrink-0',
                selectedCamera.status === 'live'
                  ? 'bg-live text-white'
                  : selectedCamera.status === 'connecting'
                  ? 'bg-warning text-warning-foreground'
                  : 'bg-stopped text-white',
              )}
            >
              {selectedCamera.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CameraTab)}
        className="flex-1 gap-0"
      >
        <div className="w-full border-b border-border bg-muted/50">
          <TabsList
            className={cn(
              'flex h-auto w-full min-w-0 flex-wrap items-stretch justify-start gap-0 rounded-none',
              'border-0 bg-transparent p-0 text-foreground shadow-none',
            )}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    'relative flex flex-1 shrink-0 items-center justify-center gap-2 rounded-none border-0',
                    'border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium shadow-none',
                    'text-foreground/80 hover:text-foreground',
                    'focus-visible:z-10 focus-visible:ring-0 focus-visible:outline-none',
                    'data-[state=active]:shadow-none',
                    'data-[state=active]:border-blue-600 data-[state=active]:!bg-transparent data-[state=active]:!text-blue-600',
                    'dark:data-[state=active]:!text-blue-500',
                    'sm:flex-none sm:justify-start sm:px-6',
                    '[&_svg]:size-[18px] [&_svg]:shrink-0',
                  )}
                >
                  <Icon className="stroke-[1.75]" aria-hidden />
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-2">
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
