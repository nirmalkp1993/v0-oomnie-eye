'use client'

import { create } from 'zustand'
import { MOCK_USERS } from '@/src/mock-data/users'
import type { UserListItem } from '@/src/types/user-management'

interface UserDirectoryStore {
  users: UserListItem[]
  setUsers: (users: UserListItem[]) => void
}

export const useUserDirectoryStore = create<UserDirectoryStore>((set) => ({
  users: MOCK_USERS.map((user) => ({ ...user })),
  setUsers: (users) => set({ users }),
}))
