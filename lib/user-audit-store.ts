'use client'

import { create } from 'zustand'
import {
  buildInitialUserAuditMap,
  buildSeedEntriesForUser,
  mergeUserAuditMaps,
} from '@/src/mock-data/user-audit'
import type { UserAuditEntry, UserListItem } from '@/src/types/user-management'

function sortAuditEntries(entries: UserAuditEntry[]): UserAuditEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))
}

interface UserAuditStore {
  entriesByUserId: Record<string, UserAuditEntry[]>
  hydrated: boolean
  hydrate: () => void
  hydrateFromUsers: (users: UserListItem[]) => void
  ensureUserLogs: (user: UserListItem) => void
  getEntries: (userId: string) => UserAuditEntry[]
  append: (
    userId: string,
    entry: Omit<UserAuditEntry, 'id' | 'date'> & { date?: string },
  ) => void
  clearUser: (userId: string) => void
}

export const useUserAuditStore = create<UserAuditStore>((set, get) => ({
  entriesByUserId: {},
  hydrated: false,

  hydrate: () => {
    get().hydrateFromUsers([])
  },

  hydrateFromUsers: (users) => {
    const seeded = users.length > 0 ? buildInitialUserAuditMap(users) : buildInitialUserAuditMap()

    set((state) => ({
      entriesByUserId: mergeUserAuditMaps(seeded, state.entriesByUserId),
      hydrated: true,
    }))
  },

  ensureUserLogs: (user) => {
    set((state) => {
      const existing = state.entriesByUserId[user.id]
      if (existing?.length) {
        return state
      }

      return {
        ...state,
        entriesByUserId: {
          ...state.entriesByUserId,
          [user.id]: buildSeedEntriesForUser(user),
        },
        hydrated: true,
      }
    })
  },

  getEntries: (userId) => sortAuditEntries(get().entriesByUserId[userId] ?? []),

  append: (userId, entry) => {
    const nextEntry: UserAuditEntry = {
      id: `audit-${crypto.randomUUID()}`,
      date: entry.date ?? new Date().toISOString(),
      action: entry.action,
      context: entry.context,
      category: entry.category,
    }

    set((state) => ({
      entriesByUserId: {
        ...state.entriesByUserId,
        [userId]: sortAuditEntries([...(state.entriesByUserId[userId] ?? []), nextEntry]),
      },
      hydrated: true,
    }))
  },

  clearUser: (userId) => {
    set((state) => {
      const next = { ...state.entriesByUserId }
      delete next[userId]
      return { entriesByUserId: next }
    })
  },
}))
