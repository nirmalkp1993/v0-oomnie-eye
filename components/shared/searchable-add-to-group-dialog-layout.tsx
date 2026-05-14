'use client'

import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Search } from 'lucide-react'

export interface SearchableAddToGroupDialogLayoutProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  titleIcon: ReactNode
  description: ReactNode
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchPlaceholder: string
  searchAriaLabel: string
  summaryLine: ReactNode
  /** Number of items currently matching the search (for disabling “Select matching”). */
  matchingCount: number
  allFilteredSelected: boolean
  hasSelection: boolean
  onSelectAllMatching: () => void
  onClearSelection: () => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitDisabled: boolean
  submitButtonLabel: ReactNode
  footerHint: ReactNode
  /** Full content inside the scroll area (list or empty state). */
  scrollBody: ReactNode
}

export function SearchableAddToGroupDialogLayout({
  open,
  onOpenChange,
  title,
  titleIcon,
  description,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder,
  searchAriaLabel,
  summaryLine,
  matchingCount,
  allFilteredSelected,
  hasSelection,
  onSelectAllMatching,
  onClearSelection,
  onSubmit,
  onCancel,
  submitDisabled,
  submitButtonLabel,
  footerHint,
  scrollBody,
}: SearchableAddToGroupDialogLayoutProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden border-border bg-card p-0 shadow-xl sm:max-w-xl">
        <div className="space-y-2 px-6 pt-6">
          <DialogHeader className="gap-3 space-y-0 text-left">
            <DialogTitle className="flex items-center gap-3 pr-8 text-xl font-semibold tracking-tight text-foreground">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                {titleIcon}
              </span>
              <span className="leading-tight">{title}</span>
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <Separator className="my-5 bg-border" />

        <form onSubmit={onSubmit} className="flex flex-col">
          <div className="space-y-3 px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => onSearchQueryChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  autoFocus
                  className="h-10 border-border bg-muted/30 pl-9 text-foreground placeholder:text-muted-foreground focus-visible:bg-background"
                  aria-label={searchAriaLabel}
                />
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={matchingCount === 0 || allFilteredSelected}
                  onClick={onSelectAllMatching}
                  className="border-border text-xs font-medium"
                >
                  Select matching
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={!hasSelection}
                  onClick={onClearSelection}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{summaryLine}</p>
          </div>

          <div className="mt-3 px-6 pb-1">
            <ScrollArea className="h-[min(320px,calc(100vh-22rem))] rounded-xl border border-border bg-muted/15 shadow-inner">
              <div className="p-1.5">{scrollBody}</div>
            </ScrollArea>
          </div>

          <Separator className="mt-5 bg-border" />

          <DialogFooter className="flex-row items-center justify-between gap-3 bg-muted/25 px-6 py-4 sm:justify-between">
            <span className="text-xs text-muted-foreground">{footerHint}</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel} className="min-w-[5.5rem] border-border">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitDisabled}
                className="min-w-[7rem] bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                {submitButtonLabel}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
