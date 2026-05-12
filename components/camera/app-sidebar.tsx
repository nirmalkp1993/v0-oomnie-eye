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

export type AppTab = 'earth' | 'dashboard' | 'reports' | 'alerts' | 'help' | 'admin' | 'camera' | 'settings'

interface AppSidebarProps {
  activeTab?: AppTab
  onTabChange?: (tab: AppTab) => void
}

const menuItems: { icon: React.ElementType; label: string; tab: AppTab }[] = [
  { icon: Globe, label: 'Earth', tab: 'earth' },
  { icon: LayoutDashboard, label: 'Dashboard', tab: 'dashboard' },
  { icon: FileText, label: 'Reports', tab: 'reports' },
  { icon: AlertTriangle, label: 'Alerts', tab: 'alerts' },
  { icon: HelpCircle, label: 'Help', tab: 'help' },
  { icon: Users, label: 'Admin', tab: 'admin' },
  { icon: Camera, label: 'Camera', tab: 'camera' },
  { icon: Settings, label: 'Settings', tab: 'settings' },
]

export function AppSidebar({ activeTab = 'camera', onTabChange }: AppSidebarProps) {
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
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="size-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/50"
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
            const isActive = activeTab === item.tab
            const button = (
              <button
                key={item.label}
                onClick={() => onTabChange?.(item.tab)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent'
                )}
              >
                <Icon className={cn('size-5 shrink-0', isActive && 'text-primary')} />
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
