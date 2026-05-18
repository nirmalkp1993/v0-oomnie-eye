'use client'

import type { ElementType, ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export const EARTH_DIALOG_TAB_LIST_CLASS =
  'h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0'

export const EARTH_DIALOG_TAB_TRIGGER_CLASS =
  'relative rounded-none border-b-2 border-transparent px-4 py-3 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none'

export interface DialogEarthTabConfig {
  value: string
  label: string
  icon: ElementType<{ className?: string }>
}

interface DialogEarthTabsProps {
  value: string
  onValueChange: (value: string) => void
  tabs: DialogEarthTabConfig[]
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function DialogEarthTabs({
  value,
  onValueChange,
  tabs,
  children,
  className,
  contentClassName,
}: DialogEarthTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn('-mx-6 -mt-4 -mb-4 flex flex-col gap-0', className)}
    >
      <div className="border-b border-border">
        <TabsList className={EARTH_DIALOG_TAB_LIST_CLASS}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger key={tab.value} value={tab.value} className={EARTH_DIALOG_TAB_TRIGGER_CLASS}>
                <Icon className="mr-2 size-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>
      <div className={cn('px-6 py-4', contentClassName)}>{children}</div>
    </Tabs>
  )
}

export { TabsContent }
