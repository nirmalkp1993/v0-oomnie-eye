'use client'

import { useState } from 'react'
import { useCameraStore } from '@/lib/camera-store'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Box, Button } from '@mui/material'
import { PlacemarkSettingsCard } from '@/src/components/earth/placemark-card/placemark-settings-card'
import { EARTH_DIALOG_SECTION_ACCENTS } from '@/src/components/modals/earth-dialog-constants'
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import { cn } from '@/lib/utils'
import {
  Trash2,
  PlayCircle,
  Wifi,
  Power,
  FileText,
  User,
  Settings,
} from 'lucide-react'

const diagnosticTools = [
  { id: 'clear', label: 'Clear Logs', icon: Trash2 },
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

    const messages: Record<
      string,
      {
        level: 'info' | 'success' | 'warning' | 'error'
        message: string
      }
    > = {
      ffmpeg: {
        level: 'success',
        message: 'FFmpeg test completed - All codecs available',
      },
      ping: {
        level: 'success',
        message: `Ping to ${selectedCamera?.ip} successful - RTT: 12ms`,
      },
      reboot: {
        level: 'warning',
        message: 'Camera reboot initiated - Please wait 30 seconds',
      },
      log: {
        level: 'info',
        message: 'Fetching camera logs...',
      },
      profile: {
        level: 'info',
        message: 'Loading camera profile...',
      },
      control: {
        level: 'info',
        message: 'Opening camera control interface...',
      },
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

  const getLogLevelLabel = (level: string) => {
    switch (level) {
      case 'info':
        return 'INFO'
      case 'success':
        return ' OK '
      case 'warning':
        return 'WARN'
      case 'error':
        return ' ERR'
      default:
        return 'LOG '
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-cyan-400'
      case 'success':
        return 'text-green-400'
      case 'warning':
        return 'text-amber-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-zinc-400'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'text-cyan-500/90'
      case 'success':
        return 'text-green-500/90'
      case 'warning':
        return 'text-amber-500/90'
      case 'error':
        return 'text-red-500/90'
      default:
        return 'text-zinc-500'
    }
  }

  if (!selectedCamera) return null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PlacemarkSettingsCard
        title="Camera Diagnostic Tools"
        tooltip="Run diagnostics and maintenance actions for the selected camera"
        headerIcon={<TerminalOutlinedIcon />}
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
      >
        <div className="flex flex-wrap gap-3">
          {diagnosticTools.map((tool) => {
            const Icon = tool.icon

            return (
              <Button
                key={tool.id}
                variant="outlined"
                size="small"
                onClick={() => handleDiagnostic(tool.id)}
                disabled={isRunning}
                startIcon={<Icon className="size-4" />}
              >
                {tool.label}
              </Button>
            )
          })}
        </div>
      </PlacemarkSettingsCard>

      <PlacemarkSettingsCard
        title="Console Output"
        tooltip="Live diagnostic logs and camera system activity"
        headerIcon={<MonitorHeartOutlinedIcon />}
        accentColor={EARTH_DIALOG_SECTION_ACCENTS.primary}
        action={
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-lg border-border/60 bg-background px-3 py-2"
            >
              <Wifi className="mr-2 size-4 text-emerald-400" />
              Network Connected
            </Badge>

            <Badge
              variant="outline"
              className="rounded-lg border-border/60 bg-background px-3 py-2"
            >
              <PlayCircle className="mr-2 size-4 text-sky-400" />
              FFmpeg Ready
            </Badge>

            <Badge
              variant="outline"
              className="rounded-lg border-border/60 bg-background px-3 py-2"
            >
              <Power className="mr-2 size-4 text-amber-400" />
              Uptime 12h 34m
            </Badge>
          </div>
        }
      >
        <div className="overflow-hidden rounded-lg border border-black/50 bg-[#0a0a0a]">
          <div className="flex items-center gap-3 border-b border-white/5 bg-[#161616] px-4 py-2">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
              <span className="size-2.5 rounded-full bg-[#febc2e]" aria-hidden />
              <span className="size-2.5 rounded-full bg-[#28c840]" aria-hidden />
            </div>
            <span className="flex-1 truncate text-center font-mono text-[11px] text-zinc-500">
              {selectedCamera.name}@diagnostics — console
            </span>
            <span className="w-[52px]" aria-hidden />
          </div>

          <ScrollArea className="h-[420px] font-mono text-[13px] leading-6 text-green-400/90 shadow-[inset_0_2px_24px_rgba(0,0,0,0.65)]">
            <div
              className="relative min-h-[420px] bg-[#0a0a0a] px-4 py-3"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.03), rgba(0,255,0,0.02), rgba(0,0,255,0.03))',
                backgroundSize: '100% 2px, 3px 100%',
              }}
            >
              {logs.length === 0 ? (
                <div className="space-y-1 text-zinc-500">
                  <p>
                    <span className="text-green-400/90">camera@</span>
                    <span className="text-cyan-400/90">{selectedCamera.ip}</span>
                    <span className="text-zinc-500">:~$</span>{' '}
                    <span className="text-zinc-400">diagnostics --attach</span>
                  </p>
                  <p className="text-zinc-600">
                    # Waiting for diagnostic output. Run a command above to stream logs here.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="mb-2 text-zinc-600">
                    # Session started — tailing camera diagnostic log ({logs.length}{' '}
                    {logs.length === 1 ? 'entry' : 'entries'})
                  </p>
                  {logs.map((log) => (
                    <p key={log.id} className="whitespace-pre-wrap break-words">
                      <span className="text-zinc-600">
                        [{log.timestamp.toLocaleTimeString()}]
                      </span>{' '}
                      <span className={cn('font-semibold', getLevelColor(log.level))}>
                        [{getLogLevelLabel(log.level)}]
                      </span>{' '}
                      <span className={getLogColor(log.level)}>{log.message}</span>
                    </p>
                  ))}
                </div>
              )}
              <p className="mt-2">
                <span className="text-green-400/90">camera@</span>
                <span className="text-cyan-400/90">{selectedCamera.ip}</span>
                <span className="text-zinc-500">:~$</span>{' '}
                <span
                  className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-green-400/90"
                  aria-hidden
                />
              </p>
            </div>
          </ScrollArea>
        </div>
      </PlacemarkSettingsCard>
    </Box>
  )
}