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
  cloneBitrixGrants,
  cloneBooleanGrants,
  createSeedBitrixGrants,
  createSeedBooleanGrants,
  setBitrixGrant,
  setBooleanGrant,
} from '@/src/lib/user-management/bitrix-permissions.utils'
import type { BitrixAccessGrants, BitrixBooleanGrants } from '@/src/types/permissions-page'
import type { ScopeGrantValue } from '@/src/types/permissions-page'

interface BitrixPermissionsContextValue {
  scopeGrants: BitrixAccessGrants
  booleanGrants: BitrixBooleanGrants
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
  const [scopeGrants, setScopeGrantsState] = useState(createSeedBitrixGrants)
  const [booleanGrants, setBooleanGrantsState] = useState(createSeedBooleanGrants)

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
      scopeGrants,
      booleanGrants,
      patchScopeGrant,
      patchBooleanGrant,
      setScopeGrants,
      setBooleanGrants,
    }),
    [
      scopeGrants,
      booleanGrants,
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
