/**
 * API persistence contract for Bitrix access permissions.
 * Use serializeBitrixPermissions / deserializeBitrixPermissions when wiring backend.
 */
export type { BitrixPermissionsPersistPayload } from '@/src/types/permissions-page'

export {
  serializeBitrixPermissions,
  deserializeBitrixPermissions,
} from '@/src/lib/user-management/bitrix-permissions.utils'

/** Suggested REST endpoints (not implemented — frontend-only prototype). */
export const BITRIX_PERMISSIONS_API = {
  get: '/api/permissions/bitrix',
  put: '/api/permissions/bitrix',
} as const
