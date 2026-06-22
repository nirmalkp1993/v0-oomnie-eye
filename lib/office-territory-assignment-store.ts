'use client'

import { create } from 'zustand'
import { MOCK_OFFICE_TERRITORY_ASSIGNMENTS } from '@/src/mock-data/office-territory-assignments'

interface OfficeTerritoryAssignmentStore {
  assignments: Record<string, string>

  assignToTerritory: (territoryId: string, officeIds: string[]) => void
  removeFromTerritory: (officeIds: string[]) => void
  getTerritoryIdForOffice: (officeId: string) => string | undefined
}

export const useOfficeTerritoryAssignmentStore = create<OfficeTerritoryAssignmentStore>(
  (set, get) => ({
    assignments: { ...MOCK_OFFICE_TERRITORY_ASSIGNMENTS },

    assignToTerritory: (territoryId, officeIds) =>
      set((state) => {
        const next = { ...state.assignments }
        for (const officeId of officeIds) {
          next[officeId] = territoryId
        }
        return { assignments: next }
      }),

    removeFromTerritory: (officeIds) =>
      set((state) => {
        const next = { ...state.assignments }
        for (const officeId of officeIds) {
          delete next[officeId]
        }
        return { assignments: next }
      }),

    getTerritoryIdForOffice: (officeId) => get().assignments[officeId],
  }),
)
