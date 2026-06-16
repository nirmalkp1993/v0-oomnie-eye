"use client";

import { useCallback } from "react";
import { Typography } from "@mui/material";
import { Shield } from "lucide-react";
import { EarthDialogSectionCard } from "@/src/components/modals/dialog-section-card";
import { EARTH_DIALOG_SECTION_ACCENTS } from "@/src/components/modals/earth-dialog-constants";
import { RolePermissionMatrixTable } from "@/src/components/user-management/roles/role-permission-matrix-table";
import {
  countGrantedMatrixCells,
  type RoleMatrixScope,
  type UserRoleMatrixAction,
  type UserRoleMatrixGrants,
} from "@/src/constants/user-role-permission-matrix";

export function RolePermissionMatrixEditor({
  grants,
  onChange,
  disabled = false,
}: {
  grants: UserRoleMatrixGrants;
  onChange: (next: UserRoleMatrixGrants) => void;
  disabled?: boolean;
}) {
  const grantedCount = countGrantedMatrixCells(grants);

  const handleScopeChange = useCallback(
    (
      moduleId: string,
      action: UserRoleMatrixAction,
      scope: RoleMatrixScope,
    ) => {
      if (disabled) return;
      onChange({
        ...grants,
        [moduleId]: {
          ...grants[moduleId],
          [action]: scope,
        },
      });
    },
    [disabled, grants, onChange],
  );

  return (
    <EarthDialogSectionCard
      title="Permission"
      icon={Shield}
      tooltip="Module-level access scopes for this role"
      accentColor={EARTH_DIALOG_SECTION_ACCENTS.info}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {grantedCount} granted cell{grantedCount === 1 ? "" : "s"}
      </Typography>
      <RolePermissionMatrixTable
        grants={grants}
        readOnly={disabled}
        maxHeight={360}
        onScopeChange={handleScopeChange}
      />
    </EarthDialogSectionCard>
  );
}
