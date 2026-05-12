'use client'

import { 
  Globe, 
  LayoutDashboard, 
  FileText, 
  AlertTriangle, 
  HelpCircle, 
  Users, 
  Camera, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const menuItems = [
  { icon: Globe, label: 'Earth', active: false },
  { icon: LayoutDashboard, label: 'Dashboard', active: false },
  { icon: FileText, label: 'Reports', active: false },
  { icon: AlertTriangle, label: 'Alerts', active: false },
  { icon: HelpCircle, label: 'Help', active: false },
  { icon: Users, label: 'Admin', active: false },
  { icon: Camera, label: 'Camera', active: true },
  { icon: Settings, label: 'Settings', active: false },
]

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 dark-scrollbar',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
          <div className="flex size-9 items-center justify-center rounded-full border-2 border-primary">
            <Eye className="size-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary">OomniEye</span>
              <span className="text-[10px] uppercase tracking-wider text-sidebar-muted">
                Next-Gen Command & Control
              </span>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <div className="flex justify-end px-2 py-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/50"
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const button = (
              <button
                key={item.label}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  item.active
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent'
                )}
              >
                <Icon className={cn('size-5 shrink-0', item.active && 'text-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            }

            return button
          })}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-sidebar-border px-4 py-3">
            <p className="text-xs text-sidebar-muted">
              Press Ctrl+B to toggle
            </p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
