'use client'

import { useEffect, useState } from 'react'

export function useDialogEditMode(open: boolean, isCreate: boolean, startEditing = false) {
  const [isEditing, setIsEditing] = useState(isCreate)

  useEffect(() => {
    if (!open) {
      setIsEditing(false)
      return
    }
    setIsEditing(isCreate || startEditing)
  }, [open, isCreate, startEditing])

  const readOnly = !isCreate && !isEditing

  return { isEditing, setIsEditing, readOnly }
}
