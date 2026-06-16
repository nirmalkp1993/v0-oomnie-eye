'use client'

import { create } from 'zustand'
import { useUserDirectoryStore } from '@/lib/user-directory-store'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { UserListItem } from '@/src/types/user-management'

const STORAGE_KEY = 'oomnie-eye:impersonated-user-id'

function resolveUser(userId: string): UserListItem | null {
  const directoryUsers = useUserDirectoryStore.getState().users
  const user =
    directoryUsers.find((item) => item.id === userId) ??
    MOCK_USERS.find((item) => item.id === userId)
  return user ? { ...user } : null
}

interface ImpersonationStore {
  impersonatedUserId: string | null
  impersonatedUser: UserListItem | null
  startImpersonation: (userId: string) => boolean
  clearImpersonation: () => void
  hydrate: () => void
}

export const useImpersonationStore = create<ImpersonationStore>((set) => ({
  impersonatedUserId: null,
  impersonatedUser: null,
  startImpersonation: (userId) => {
    const user = resolveUser(userId)
    if (!user) return false
    sessionStorage.setItem(STORAGE_KEY, userId)
    set({ impersonatedUserId: userId, impersonatedUser: user })
    return true
  },
  clearImpersonation: () => {
    sessionStorage.removeItem(STORAGE_KEY)
    set({ impersonatedUserId: null, impersonatedUser: null })
  },
  hydrate: () => {
    const userId = sessionStorage.getItem(STORAGE_KEY)
    if (!userId) {
      set({ impersonatedUserId: null, impersonatedUser: null })
      return
    }
    const user = resolveUser(userId)
    if (!user) {
      sessionStorage.removeItem(STORAGE_KEY)
      set({ impersonatedUserId: null, impersonatedUser: null })
      return
    }
    set({ impersonatedUserId: userId, impersonatedUser: user })
  },
}))
