'use client'

import { Bell, Menu, Moon, Settings, Sun, User, X } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  sidebarExpanded?: boolean
  onSidebarToggle?: () => void
}

export function AppHeader({ sidebarExpanded = true, onSidebarToggle }: AppHeaderProps) {
  const sidebarToggleLabel = sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'

  return (
    <header className="chrome-header font-chrome relative z-[1300] flex h-16 shrink-0 items-center bg-[#000000] px-4 text-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        data-sidebar-menu-toggle
        onClick={onSidebarToggle}
        aria-label={sidebarToggleLabel}
        aria-expanded={sidebarExpanded}
        className="mr-2 size-10 text-chrome-icon-inactive hover:bg-white/8 hover:text-chrome-foreground"
      >
        <span
          className={cn(
            'flex items-center justify-center transition-transform duration-200',
            sidebarExpanded && 'rotate-90'
          )}
        >
          {sidebarExpanded ? <X className="size-5" /> : <Menu className="size-5" />}
        </span>
      </Button>

      <div className="flex items-center gap-3">
        <Image
          src="/icon.svg"
          alt="OomniEye Logo"
          width={50}
          height={50}
          className="h-[50px] w-auto object-contain"
          priority
        />
        <div className="flex flex-col items-start leading-none">
          <span className="text-2xl font-light leading-tight text-chrome-icon-active">OomniEye</span>
          <span className="mt-0.5 text-[0.65rem] uppercase tracking-[0.05em] text-chrome-muted">
            Next-Gen Command & Control
          </span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-chrome-icon-inactive hover:bg-white/8 hover:text-chrome-foreground"
          aria-label="Light theme"
        >
          <Sun className="size-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-chrome-icon-inactive hover:bg-white/8 hover:text-chrome-foreground"
          aria-label="Dark theme"
        >
          <Moon className="size-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-chrome-icon-inactive hover:bg-white/8 hover:text-chrome-foreground"
          aria-label="Settings"
        >
          <Settings className="size-5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative text-chrome-icon-inactive hover:bg-white/8 hover:text-chrome-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <Badge className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-0 bg-chrome-icon-active p-0 text-[10px] font-medium text-black">
            2
          </Badge>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="p-0.5 text-chrome-icon-inactive hover:bg-white/8 hover:text-chrome-foreground"
          aria-label="Account"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[#29b6f6] text-chrome-foreground">
            <User className="size-5" />
          </span>
        </Button>
      </div>
    </header>
  )
}
