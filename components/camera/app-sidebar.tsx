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

const SIDEBAR_WIDTH_EXPANDED = 240
const SIDEBAR_WIDTH_COLLAPSED = 64

interface AppSidebarProps {
  activeTab?: AppTab
  onTabChange?: (tab: AppTab) => void
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
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

function itemClassName(isActive: boolean, collapsed: boolean) {
  return cn(
    'flex w-full items-center rounded-lg text-sm font-normal transition-colors',
    collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3',
    isActive
      ? 'bg-white/[0.08] text-chrome-icon-active'
      : 'text-chrome-foreground hover:bg-white/[0.05]'
  )
}

export function AppSidebar({
  activeTab = 'camera',
  onTabChange,
  expanded: expandedProp,
  onExpandedChange,
}: AppSidebarProps) {
  const [internalExpanded, setInternalExpanded] = useState(true)
  const expanded = expandedProp ?? internalExpanded
  const setExpanded = (value: boolean) => {
    onExpandedChange?.(value)
    if (expandedProp === undefined) setInternalExpanded(value)
  }

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
        className={cn(
          itemClassName(isActive, !expanded),
          nested && expanded && 'py-2 pl-9 pr-3',
          nested && !expanded && 'hidden'
        )}
      >
        <Icon
          className={cn(
            'shrink-0',
            expanded ? 'size-6' : 'size-6',
            isActive ? 'text-chrome-icon-active' : 'text-chrome-icon-inactive'
          )}
        />
        {expanded && <span className={cn('text-sm', nested && 'text-[13px]')}>{label}</span>}
      </button>
    )

    if (!expanded && !nested) {
      return (
        <Tooltip key={label + tab}>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right" className="font-chrome">
            {label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return <div key={label + tab}>{btn}</div>
  }

  return (
    <TooltipProvider>
      <aside
        id="app-sidebar"
        data-app-sidebar-root
        style={{ width: expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED }}
        className={cn(
          'font-chrome flex h-full shrink-0 flex-col border-r-0 bg-chrome text-chrome-foreground transition-[width] duration-300 ease-out dark-scrollbar',
          'overflow-x-hidden overflow-y-auto'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex min-h-10 shrink-0 items-center justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="size-8 text-chrome-icon-inactive hover:bg-white/[0.08] hover:text-chrome-icon-active"
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-1">
          {topMenuItems.map((item) => renderTabButton(item.tab, item.icon, item.label))}

          {!expanded ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onTabChange?.('um-users')}
                  className={cn(itemClassName(umActive, true))}
                >
                  <Shield
                    className={cn(
                      'size-6 shrink-0',
                      umActive ? 'text-chrome-icon-active' : 'text-chrome-icon-inactive'
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-chrome">
                User Management
              </TooltipContent>
            </Tooltip>
          ) : (
            <Collapsible open={userMgmtOpen} onOpenChange={setUserMgmtOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm font-medium transition-colors',
                    umActive
                      ? 'text-chrome-icon-active'
                      : 'text-chrome-foreground hover:bg-white/[0.05]'
                  )}
                  aria-expanded={userMgmtOpen}
                >
                  <Shield
                    className={cn(
                      'size-5 shrink-0',
                      umActive ? 'text-chrome-icon-active' : 'text-chrome-icon-inactive'
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">User Management</span>
                  <ChevronDown
                    className={cn('size-4 shrink-0 text-chrome-icon-inactive', !userMgmtOpen && '-rotate-90')}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 pt-0.5">
                {userManagementChildren.map((c) => renderTabButton(c.tab, c.icon, c.label, true))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {renderTabButton('settings', Settings, 'Settings')}
        </nav>

        {expanded && (
          <div className="shrink-0 bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-chrome-muted">Press Ctrl+B to toggle</p>
          </div>
        )}
      </aside>
    </TooltipProvider>
  )
}
