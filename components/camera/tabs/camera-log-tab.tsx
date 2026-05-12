'use client'

import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Trash2, 
  PlayCircle, 
  Wifi, 
  Power, 
  FileText, 
  User, 
  Settings,
  Terminal,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle
} from 'lucide-react'

const diagnosticTools = [
  { id: 'clear', label: 'Clear logs', icon: Trash2 },
  { id: 'ffmpeg', label: 'Test FFmpeg', icon: PlayCircle },
  { id: 'ping', label: 'Ping Camera', icon: Wifi },
  { id: 'reboot', label: 'Camera Reboot', icon: Power },
  { id: 'log', label: 'Camera Log', icon: FileText },
  { id: 'profile', label: 'Camera Profile', icon: User },
  { id: 'control', label: 'Camera Control', icon: Settings },
]

export function CameraLogTab() {
  const { selectedCamera, getCameraLogs, clearLogs, addLog } = useCameraStore()
  const [isRunning, setIsRunning] = useState(false)

  const logs = getCameraLogs(selectedCamera?.id || '')

  const handleDiagnostic = (toolId: string) => {
    setIsRunning(true)
    
    if (toolId === 'clear') {
      clearLogs()
      setIsRunning(false)
      return
    }

    // Simulate diagnostic command
    const messages: Record<string, { level: 'info' | 'success' | 'warning' | 'error'; message: string }> = {
      ffmpeg: { level: 'success', message: 'FFmpeg test completed - All codecs available' },
      ping: { level: 'success', message: `Ping to ${selectedCamera?.ip} successful - RTT: 12ms` },
      reboot: { level: 'warning', message: 'Camera reboot initiated - Please wait 30 seconds' },
      log: { level: 'info', message: 'Fetching camera logs...' },
      profile: { level: 'info', message: 'Loading camera profile...' },
      control: { level: 'info', message: 'Opening camera control interface...' },
    }

    setTimeout(() => {
      const result = messages[toolId]
      if (result) {
        addLog({
          level: result.level,
          message: result.message,
          source: toolId,
        })
      }
      setIsRunning(false)
    }, 500)
  }

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info className="size-4 text-primary" />
      case 'success':
        return <CheckCircle className="size-4 text-live" />
      case 'warning':
        return <AlertTriangle className="size-4 text-accent" />
      case 'error':
        return <XCircle className="size-4 text-destructive" />
      default:
        return <Info className="size-4 text-muted-foreground" />
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-primary'
      case 'success':
        return 'text-live'
      case 'warning':
        return 'text-accent'
      case 'error':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  if (!selectedCamera) return null

  return (
    <div className="space-y-6">
      {/* Diagnostic Tools */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-accent">
            <Terminal className="size-5" />
            Camera Diagnostic Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {diagnosticTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Button
                  key={tool.id}
                  variant="outline"
                  onClick={() => handleDiagnostic(tool.id)}
                  disabled={isRunning}
                  className="border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                >
                  <Icon className="mr-2 size-4" />
                  {tool.label}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Console Output */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-accent">
            <Terminal className="size-5" />
            Console Output
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 w-full rounded-b-lg bg-black p-4 font-mono text-sm">
            {logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <span>No logs available. Run a diagnostic command above.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-muted-foreground text-xs shrink-0">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>
                    {getLogIcon(log.level)}
                    <span className={getLogColor(log.level)}>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Wifi className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Network Status</p>
                <p className="font-semibold text-live">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <PlayCircle className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">FFmpeg Status</p>
                <p className="font-semibold text-live">Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Power className="size-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="font-semibold text-foreground">12h 34m 56s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
