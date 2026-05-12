'use client'

import { Search, Home, MapPin, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePinStore } from '@/lib/pin-store'
import { cn } from '@/lib/utils'

export function EarthToolbar() {
  const { isAddingPin, setIsAddingPin } = usePinStore()

  const tools = [
    { icon: Search, label: 'Search', onClick: () => console.log('[v0] Search clicked') },
    { icon: Home, label: 'Home', onClick: () => console.log('[v0] Home clicked') },
    { icon: MapPin, label: 'Add Location Pin', onClick: () => console.log('[v0] Add Location Pin clicked') },
    {
      icon: Camera,
      label: 'Add Camera Placemarkdddd',
      onClick: () => {
        console.log('[v0] Camera button clicked, isAddingPin:', !isAddingPin)
        setIsAddingPin(!isAddingPin)
      },
      active: isAddingPin
    },
  ]

  return (
    <TooltipProvider>
      <div
        className="absolute left-4 top-4 z-[1000] flex flex-col gap-1 rounded-lg border border-border/60 bg-card p-1.5 shadow-xl"
        style={{ pointerEvents: 'auto' }}
      >
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
                    tool.active && 'bg-primary/20 text-primary border border-primary/50'
                  )}
                >
                  <Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="z-[1001]">
                {tool.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
