'use client'

import { Search, Home, MapPin, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePinStore } from '@/lib/pin-store'
import { cn } from '@/lib/utils'

export function EarthToolbar() {
  const { isAddingPin, setIsAddingPin } = usePinStore()

  const tools = [
    { icon: Search, label: 'Search', onClick: () => {} },
    { icon: Home, label: 'Home', onClick: () => {} },
    { icon: MapPin, label: 'Add Location Pin', onClick: () => {} },
    { 
      icon: Camera, 
      label: 'Add Camera Placemark', 
      onClick: () => setIsAddingPin(!isAddingPin),
      active: isAddingPin 
    },
  ]

  return (
    <TooltipProvider>
      <div className="absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-lg border border-border/50 bg-card/95 p-1.5 shadow-lg backdrop-blur-sm">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Tooltip key={tool.label}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={tool.onClick}
                  className={cn(
                    'size-9 text-muted-foreground hover:bg-muted hover:text-foreground',
                    tool.active && 'bg-primary/10 text-primary border border-primary/30'
                  )}
                >
                  <Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {tool.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
