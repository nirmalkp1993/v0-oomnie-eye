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
  ChevronDown,
  Eye,
  Shield,
  User,
  UsersRound,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type AppTab =
  | 'earth'
  | 'dashboard'
  | 'reports'
  | 'alerts'
  | 'help'
  | 'admin'
  | 'camera'
  | 'settings'
  | 'um-users'
  | 'um-groups'
  | 'um-roles'
  | 'um-role-assignment'

export function isUserManagementTab(tab: AppTab): boolean {
  return tab === 'um-users' || tab === 'um-groups' || tab === 'um-roles' || tab === 'um-role-assignment'
}

interface AppSidebarProps {
  activeTab?: AppTab
  onTabChange?: (tab: AppTab) => void
}

const topMenuItems: { icon: React.ElementType; label: string; tab: AppTab }[] = [
  { icon: Globe, label: 'Earth', tab: 'earth' },
  { icon: LayoutDashboard, label: 'Dashboard', tab: 'dashboard' },
  { icon: FileText, label: 'Reports', tab: 'reports' },
  { icon: AlertTriangle, label: 'Alerts', tab: 'alerts' },
  { icon: HelpCircle, label: 'Help', tab: 'help' },
  { icon: Users, label: 'Admin', tab: 'admin' },
  { icon: Camera, label: 'Camera', tab: 'camera' },
]

const userManagementChildren: { icon: React.ElementType; label: string; tab: AppTab }[] = [
  { icon: User, label: 'Users', tab: 'um-users' },
  { icon: UsersRound, label: 'Groups', tab: 'um-groups' },
  { icon: ShieldCheck, label: 'Roles & Permissions', tab: 'um-roles' },
  { icon: ClipboardList, label: 'Role Assignment', tab: 'um-role-assignment' },
]

function itemClassName(isActive: boolean) {
  return cn(
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/10 text-primary border border-primary/30'
      : 'text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-accent'
  )
}

export function AppSidebar({ activeTab = 'camera', onTabChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [userMgmtOpen, setUserMgmtOpen] = useState(true)
  const umActive = isUserManagementTab(activeTab)

  useEffect(() => {
    if (umActive) setUserMgmtOpen(true)
  }, [umActive])

  const renderTabButton = (tab: AppTab, icon: React.ElementType, label: string, nested?: boolean) => {
    const Icon = icon
    const isActive = activeTab === tab
    const btn = (
      <button
        type="button"
        onClick={() => onTabChange?.(tab)}
        className={cn(itemClassName(isActive), nested && 'py-2 pl-9 pr-3')}
      >
        <Icon className={cn('size-4 shrink-0', isActive && 'text-primary')} />
        {!collapsed && <span className={nested ? 'text-[13px]' : ''}>{label}</span>}
      </button>
    )

    if (collapsed && !nested) {
      return (
        <Tooltip key={label + tab}>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )
    }

    return <div key={label + tab}>{btn}</div>
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 dark-scrollbar',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
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

        <div className="flex justify-end px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="size-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/50"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-2">
          {topMenuItems.map((item) => renderTabButton(item.tab, item.icon, item.label))}

          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onTabChange?.('um-users')}
                  className={cn(
                    itemClassName(umActive),
                    'justify-center px-2',
                    umActive && 'border-primary/30'
                  )}
                >
                  <Shield className={cn('size-5 shrink-0', umActive && 'text-primary')} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">User Management</TooltipContent>
            </Tooltip>
          ) : (
            <Collapsible open={userMgmtOpen} onOpenChange={setUserMgmtOpen}>
              <div className="flex w-full items-stretch gap-0.5">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar-accent/10',
                      umActive && 'text-primary'
                    )}
                    aria-expanded={userMgmtOpen}
                  >
                    <Shield className={cn('size-4 shrink-0', umActive && 'text-primary')} />
                    <span className="min-w-0 flex-1 truncate">User Management</span>
                    <ChevronDown
                      className={cn('size-4 shrink-0 transition-transform', !userMgmtOpen && '-rotate-90')}
                    />
                  </button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-0.5 pt-0.5">
                {userManagementChildren.map((c) => renderTabButton(c.tab, c.icon, c.label, true))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {renderTabButton('settings', Settings, 'Settings')}
        </nav>

        {!collapsed && (
          <div className="border-t border-sidebar-border px-4 py-3">
            <p className="text-xs text-sidebar-muted">Press Ctrl+B to toggle</p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
