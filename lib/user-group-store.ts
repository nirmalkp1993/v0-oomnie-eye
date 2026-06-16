'use client'

import { create } from 'zustand'
import {
  collectSubtreeGroupIds,
  getUserGroupTableTree,
  type UserGroupTableNode,
} from '@/src/lib/user-management/user-group-tree.utils'
import { MOCK_GROUPS } from '@/src/mock-data/groups'
import type { GroupListItem } from '@/src/types/user-management'

function buildScopeLabel(memberCount: number): string {
  return memberCount === 1 ? '1 manually selected' : `${memberCount} manually selected`
}

interface UserGroupStore {
  groups: GroupListItem[]
  selectedGroupId: string | null
  listGroupExpanded: Record<string, boolean>
  searchQuery: string

  setSelectedGroupId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setGroups: (groups: GroupListItem[]) => void
  upsertGroup: (group: GroupListItem) => void
  removeGroup: (id: string) => void
  addUsersToGroup: (groupId: string, userIds: string[]) => void
  removeUsersFromGroup: (groupId: string, userIds: string[]) => void
  toggleListGroupExpanded: (id: string) => void
  expandAllListGroups: () => void
  collapseAllListGroups: () => void
  getGroupTree: () => UserGroupTableNode[]
}

export const useUserGroupStore = create<UserGroupStore>((set, get) => ({
  groups: MOCK_GROUPS.map((group) => ({ ...group })),
  selectedGroupId: null,
  listGroupExpanded: {},
  searchQuery: '',

  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setGroups: (groups) => set({ groups }),

  upsertGroup: (group) =>
    set((state) => {
      const index = state.groups.findIndex((item) => item.id === group.id)
      if (index >= 0) {
        const next = [...state.groups]
        next[index] = group
        return { groups: next }
      }
      return { groups: [...state.groups, group] }
    }),

  removeGroup: (id) =>
    set((state) => {
      const removeIds = new Set(collectSubtreeGroupIds(state.groups, id))
      return {
        groups: state.groups.filter((group) => !removeIds.has(group.id)),
        selectedGroupId:
          state.selectedGroupId && removeIds.has(state.selectedGroupId)
            ? null
            : state.selectedGroupId,
      }
    }),

  addUsersToGroup: (groupId, userIds) =>
    set((state) => ({
      groups: state.groups.map((group) => {
        if (group.id !== groupId || group.type !== 'static') return group
        const ids = new Set(group.memberUserIds ?? [])
        userIds.forEach((userId) => ids.add(userId))
        const memberUserIds = [...ids]
        return {
          ...group,
          memberUserIds,
          memberCount: memberUserIds.length,
          scope: buildScopeLabel(memberUserIds.length),
          lastUpdated: new Date().toISOString().slice(0, 10),
        }
      }),
    })),

  removeUsersFromGroup: (groupId, userIds) =>
    set((state) => ({
      groups: state.groups.map((group) => {
        if (group.id !== groupId || group.type !== 'static') return group
        const remove = new Set(userIds)
        const memberUserIds = (group.memberUserIds ?? []).filter((userId) => !remove.has(userId))
        return {
          ...group,
          memberUserIds,
          memberCount: memberUserIds.length,
          scope: buildScopeLabel(memberUserIds.length),
          lastUpdated: new Date().toISOString().slice(0, 10),
        }
      }),
    })),

  toggleListGroupExpanded: (id) =>
    set((state) => ({
      listGroupExpanded: {
        ...state.listGroupExpanded,
        [id]: !(state.listGroupExpanded[id] ?? true),
      },
    })),

  expandAllListGroups: () =>
    set((state) => ({
      listGroupExpanded: Object.fromEntries(state.groups.map((group) => [group.id, true])),
    })),

  collapseAllListGroups: () =>
    set((state) => ({
      listGroupExpanded: Object.fromEntries(state.groups.map((group) => [group.id, false])),
    })),

  getGroupTree: () => getUserGroupTableTree(get().groups, get().searchQuery),
}))
