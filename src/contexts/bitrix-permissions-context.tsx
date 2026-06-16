'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  appendRoleToBooleanGrants,
  appendRoleToScopeGrants,
  cloneBitrixGrants,
  cloneBooleanGrants,
  copyRoleScopeGrants,
  createSeedBitrixGrants,
  createSeedBooleanGrants,
  getInitialGridRoles,
  removeRoleFromBooleanGrants,
  removeRoleFromScopeGrants,
  setAllRoleScopeGrants,
  setBitrixGrant,
  setBooleanGrant,
} from '@/src/lib/user-management/bitrix-permissions.utils'
import type {
  BitrixAccessGrants,
  BitrixBooleanGrants,
  RoleMemberSelection,
  ScopeGrantSelection,
  ScopeGrantValue,
} from '@/src/types/permissions-page'
import type { RoleListItem } from '@/src/types/user-management'

interface BitrixPermissionsContextValue {
  gridRoles: RoleListItem[]
  scopeGrants: BitrixAccessGrants
  booleanGrants: BitrixBooleanGrants
  roleMemberAssignments: Record<string, RoleMemberSelection>
  addGridRole: (role: RoleListItem) => void
  updateGridRole: (role: RoleListItem) => void
  removeGridRole: (roleId: string) => void
  patchScopeGrant: (
    moduleId: string,
    action: string,
    roleId: string,
    value: ScopeGrantSelection,
  ) => void
  patchBooleanGrant: (moduleId: string, permId: string, roleId: string, value: boolean) => void
  setScopeGrants: (grants: BitrixAccessGrants) => void
  setBooleanGrants: (grants: BitrixBooleanGrants) => void
  bulkSetRoleScopeGrants: (roleId: string, scope: ScopeGrantValue) => void
  cloneGridRole: (source: RoleListItem) => RoleListItem
  getRoleMemberSelection: (roleId: string) => RoleMemberSelection
  setRoleMemberSelection: (roleId: string, selection: RoleMemberSelection) => void
}

const BitrixPermissionsContext = createContext<BitrixPermissionsContextValue | null>(null)

const EMPTY_ROLE_MEMBER_SELECTION: RoleMemberSelection = {
  userIds: [],
  groupIds: [],
  departmentIds: [],
}

function cloneRoleMemberSelection(selection?: RoleMemberSelection): RoleMemberSelection {
  if (!selection) return { ...EMPTY_ROLE_MEMBER_SELECTION }
  return {
    userIds: [...selection.userIds],
    groupIds: [...selection.groupIds],
    departmentIds: [...selection.departmentIds],
  }
}

function createInitialRoleMemberAssignments(roles: RoleListItem[]): Record<string, RoleMemberSelection> {
  const next: Record<string, RoleMemberSelection> = {}
  for (const role of roles) {
    next[role.id] = cloneRoleMemberSelection()
  }
  return next
}

export function BitrixPermissionsProvider({ children }: { children: ReactNode }) {
  const [gridRoles, setGridRoles] = useState<RoleListItem[]>(getInitialGridRoles)
  const [scopeGrants, setScopeGrantsState] = useState(createSeedBitrixGrants)
  const [booleanGrants, setBooleanGrantsState] = useState(createSeedBooleanGrants)
  const [roleMemberAssignments, setRoleMemberAssignments] = useState<Record<string, RoleMemberSelection>>(
    () => createInitialRoleMemberAssignments(getInitialGridRoles()),
  )

  const addGridRole = useCallback((role: RoleListItem) => {
    setGridRoles((prev) => {
      if (prev.some((r) => r.id === role.id)) return prev
      return [...prev, role]
    })
    setRoleMemberAssignments((prev) => {
      if (prev[role.id]) return prev
      return { ...prev, [role.id]: cloneRoleMemberSelection() }
    })
    setScopeGrantsState((prev) => appendRoleToScopeGrants(prev, role.id, 'deny'))
    setBooleanGrantsState((prev) => appendRoleToBooleanGrants(prev, role.id, false))
  }, [])

  const updateGridRole = useCallback((role: RoleListItem) => {
    setGridRoles((prev) => prev.map((r) => (r.id === role.id ? { ...role, id: r.id } : r)))
  }, [])

  const removeGridRole = useCallback((roleId: string) => {
    setGridRoles((prev) => prev.filter((r) => r.id !== roleId))
    setRoleMemberAssignments((prev) => {
      const { [roleId]: _removed, ...rest } = prev
      return rest
    })
    setScopeGrantsState((prev) => removeRoleFromScopeGrants(prev, roleId))
    setBooleanGrantsState((prev) => removeRoleFromBooleanGrants(prev, roleId))
  }, [])

  const patchScopeGrant = useCallback(
    (moduleId: string, action: string, roleId: string, value: ScopeGrantSelection) => {
      setScopeGrantsState((prev) => setBitrixGrant(prev, moduleId, action, roleId, value))
    },
    [],
  )

  const patchBooleanGrant = useCallback(
    (moduleId: string, permId: string, roleId: string, value: boolean) => {
      setBooleanGrantsState((prev) => setBooleanGrant(prev, moduleId, permId, roleId, value))
    },
    [],
  )

  const setScopeGrants = useCallback((grants: BitrixAccessGrants) => {
    setScopeGrantsState(cloneBitrixGrants(grants))
  }, [])

  const setBooleanGrants = useCallback((grants: BitrixBooleanGrants) => {
    setBooleanGrantsState(cloneBooleanGrants(grants))
  }, [])

  const bulkSetRoleScopeGrants = useCallback((roleId: string, scope: ScopeGrantValue) => {
    setScopeGrantsState((prev) => setAllRoleScopeGrants(prev, roleId, scope))
  }, [])

  const cloneGridRole = useCallback((source: RoleListItem): RoleListItem => {
    const clone: RoleListItem = {
      ...source,
      id: `role-${Date.now()}`,
      name: `${source.name} (copy)`,
      badges: source.badges.filter((b) => b !== 'system'),
      userCount: 0,
      groupCount: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
    }
    setGridRoles((prev) => [...prev, clone])
    setScopeGrantsState((prev) =>
      copyRoleScopeGrants(appendRoleToScopeGrants(prev, clone.id, 'deny'), source.id, clone.id),
    )
    setBooleanGrantsState((prev) => appendRoleToBooleanGrants(prev, clone.id, false))
    setRoleMemberAssignments((prev) => ({
      ...prev,
      [clone.id]: cloneRoleMemberSelection(),
    }))
    return clone
  }, [])

  const getRoleMemberSelection = useCallback(
    (roleId: string): RoleMemberSelection => cloneRoleMemberSelection(roleMemberAssignments[roleId]),
    [roleMemberAssignments],
  )

  const setRoleMemberSelection = useCallback((roleId: string, selection: RoleMemberSelection) => {
    const nextSelection = cloneRoleMemberSelection(selection)
    setRoleMemberAssignments((prev) => ({
      ...prev,
      [roleId]: nextSelection,
    }))
    setGridRoles((prev) =>
      prev.map((role) =>
        role.id === roleId
          ? {
              ...role,
              userCount: nextSelection.userIds.length,
              groupCount: nextSelection.groupIds.length,
            }
          : role,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({
      gridRoles,
      scopeGrants,
      booleanGrants,
      roleMemberAssignments,
      addGridRole,
      updateGridRole,
      removeGridRole,
      patchScopeGrant,
      patchBooleanGrant,
      setScopeGrants,
      setBooleanGrants,
      bulkSetRoleScopeGrants,
      cloneGridRole,
      getRoleMemberSelection,
      setRoleMemberSelection,
    }),
    [
      gridRoles,
      scopeGrants,
      booleanGrants,
      roleMemberAssignments,
      addGridRole,
      updateGridRole,
      removeGridRole,
      patchScopeGrant,
      patchBooleanGrant,
      setScopeGrants,
      setBooleanGrants,
      bulkSetRoleScopeGrants,
      cloneGridRole,
      getRoleMemberSelection,
      setRoleMemberSelection,
    ],
  )

  return (
    <BitrixPermissionsContext.Provider value={value}>{children}</BitrixPermissionsContext.Provider>
  )
}

export function useBitrixPermissions(): BitrixPermissionsContextValue {
  const ctx = useContext(BitrixPermissionsContext)
  if (!ctx) {
    throw new Error('useBitrixPermissions must be used within BitrixPermissionsProvider')
  }
  return ctx
}
