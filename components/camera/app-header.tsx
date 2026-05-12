'use client'

import { Sun, Moon, Settings, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function AppHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-sidebar-border bg-header px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-header-foreground">Camera Management</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-sidebar-muted hover:text-header-foreground hover:bg-sidebar-border/50">
          <Sun className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-sidebar-muted hover:text-header-foreground hover:bg-sidebar-border/50">
          <Moon className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-sidebar-muted hover:text-header-foreground hover:bg-sidebar-border/50">
          <Settings className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-sidebar-muted hover:text-header-foreground hover:bg-sidebar-border/50">
          <Bell className="size-5" />
          <Badge className="absolute -top-1 -right-1 size-5 justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
            2
          </Badge>
        </Button>
        <Button variant="ghost" size="icon" className="text-sidebar-muted hover:text-header-foreground hover:bg-sidebar-border/50">
          <User className="size-5" />
        </Button>
      </div>
    </header>
  )
}
