'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, 
  Play,
  Pause,
  Volume2,
  Settings,
  RefreshCw,
  Terminal,
  Info
} from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import type { Camera } from '@/types/camera'

interface CameraStreamModalProps {
  camera: Camera
  onClose: () => void
}

export function CameraStreamModal({ camera, onClose }: CameraStreamModalProps) {
  const [activeTab, setActiveTab] = useState<'stream' | 'logs'>('stream')
  const [isPlaying, setIsPlaying] = useState(true)

  const diagnosticTools = [
    'Clear Logs',
    'Test FTPpost',
    'Ping Camera',
    'Camera Reboot',
    'Camera Log',
    'Camera Profile',
    'Camera Control',
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-[600px] border-border bg-card shadow-2xl">
        {/* Header */}
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-primary">{camera.name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="border-b border-border">
            <TabsList className="h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="stream"
                className="relative rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Stream
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="relative rounded-none border-b-2 border-transparent px-4 py-2 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Camera logs
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-4">
            {/* Stream Tab */}
            <TabsContent value="stream" className="mt-0">
              {/* Video Player */}
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
                </div>
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>
                  <Badge variant="outline" className="border-white/30 text-white">HLS</Badge>
                  <Badge variant="outline" className="border-white/30 text-white">WebRTC</Badge>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20">
                      <Settings className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20">
                      <Volume2 className="size-4" />
                    </Button>
                    <Slider
                      defaultValue={[70]}
                      max={100}
                      step={1}
                      className="w-24"
                    />
                  </div>
                  
                  <Button variant="ghost" size="icon-sm" className="ml-auto text-white hover:bg-white/20">
                    <Info className="size-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="mt-0 space-y-4">
              {/* Diagnostic Tools */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium text-primary">Camera Diagnostic Tools</h4>
                  <Button variant="ghost" size="icon-sm">
                    <Info className="size-3 text-muted-foreground" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {diagnosticTools.map((tool, index) => (
                    <Button
                      key={tool}
                      variant="outline"
                      size="sm"
                      disabled={index > 0}
                      className="text-xs border-border"
                    >
                      {tool}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Console Output */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-medium text-foreground">Console Output</h4>
                  <Button variant="ghost" size="icon-sm">
                    <Info className="size-3 text-muted-foreground" />
                  </Button>
                </div>
                <div className="h-48 rounded-lg bg-black p-3 font-mono text-xs text-green-400 overflow-auto">
                  <p className="text-muted-foreground">Run a diagnostic action to see output here.</p>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}
