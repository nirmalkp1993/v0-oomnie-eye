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
  createSeedBitrixGrants,
  createSeedBooleanGrants,
  getInitialGridRoles,
  removeRoleFromBooleanGrants,
  removeRoleFromScopeGrants,
  setBitrixGrant,
  setBooleanGrant,
} from '@/src/lib/user-management/bitrix-permissions.utils'
import type { BitrixAccessGrants, BitrixBooleanGrants } from '@/src/types/permissions-page'
import type { ScopeGrantValue } from '@/src/types/permissions-page'
import type { RoleListItem } from '@/src/types/user-management'

interface BitrixPermissionsContextValue {
  gridRoles: RoleListItem[]
  scopeGrants: BitrixAccessGrants
  booleanGrants: BitrixBooleanGrants
  addGridRole: (role: RoleListItem) => void
  updateGridRole: (role: RoleListItem) => void
  removeGridRole: (roleId: string) => void
  patchScopeGrant: (
    moduleId: string,
    action: string,
    roleId: string,
    value: ScopeGrantValue,
  ) => void
  patchBooleanGrant: (moduleId: string, permId: string, roleId: string, value: boolean) => void
  setScopeGrants: (grants: BitrixAccessGrants) => void
  setBooleanGrants: (grants: BitrixBooleanGrants) => void
}

const BitrixPermissionsContext = createContext<BitrixPermissionsContextValue | null>(null)

export function BitrixPermissionsProvider({ children }: { children: ReactNode }) {
  const [gridRoles, setGridRoles] = useState<RoleListItem[]>(getInitialGridRoles)
  const [scopeGrants, setScopeGrantsState] = useState(createSeedBitrixGrants)
  const [booleanGrants, setBooleanGrantsState] = useState(createSeedBooleanGrants)

  const addGridRole = useCallback((role: RoleListItem) => {
    setGridRoles((prev) => {
      if (prev.some((r) => r.id === role.id)) return prev
      return [...prev, role]
    })
    setScopeGrantsState((prev) => appendRoleToScopeGrants(prev, role.id, 'deny'))
    setBooleanGrantsState((prev) => appendRoleToBooleanGrants(prev, role.id, false))
  }, [])

  const updateGridRole = useCallback((role: RoleListItem) => {
    setGridRoles((prev) => prev.map((r) => (r.id === role.id ? { ...role, id: r.id } : r)))
  }, [])

  const removeGridRole = useCallback((roleId: string) => {
    setGridRoles((prev) => prev.filter((r) => r.id !== roleId))
    setScopeGrantsState((prev) => removeRoleFromScopeGrants(prev, roleId))
    setBooleanGrantsState((prev) => removeRoleFromBooleanGrants(prev, roleId))
  }, [])

  const patchScopeGrant = useCallback(
    (moduleId: string, action: string, roleId: string, value: ScopeGrantValue) => {
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

  const value = useMemo(
    () => ({
      gridRoles,
      scopeGrants,
      booleanGrants,
      addGridRole,
      updateGridRole,
      removeGridRole,
      patchScopeGrant,
      patchBooleanGrant,
      setScopeGrants,
      setBooleanGrants,
    }),
    [
      gridRoles,
      scopeGrants,
      booleanGrants,
      addGridRole,
      updateGridRole,
      removeGridRole,
      patchScopeGrant,
      patchBooleanGrant,
      setScopeGrants,
      setBooleanGrants,
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
