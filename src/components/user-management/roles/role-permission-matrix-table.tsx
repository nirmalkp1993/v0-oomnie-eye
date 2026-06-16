"use client";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { getEnterpriseSettingsCardSx } from "@/src/components/enterprise";
import {
  USER_ROLE_MATRIX_COLUMNS,
  USER_ROLE_MATRIX_MODULES,
  getCellScope,
  isUserRoleMatrixActionApplicable,
  type RoleMatrixScope,
  type UserRoleMatrixAction,
  type UserRoleMatrixGrants,
} from "@/src/constants/user-role-permission-matrix";
import { RolePermissionMatrixCell } from "@/src/components/user-management/roles/role-permission-matrix-cell";

const moduleHeaderSx = {
  py: 1.75,
  px: 2.5,
  fontWeight: 600,
  fontSize: "0.8125rem",
  color: "text.secondary",
  borderBottom: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  width: "28%",
} as const;

const actionHeaderSx = {
  ...moduleHeaderSx,
  width: `${72 / USER_ROLE_MATRIX_COLUMNS.length}%`,
  textAlign: "left",
} as const;

const moduleBodySx = {
  py: 2,
  px: 2.5,
  verticalAlign: "top",
  borderBottom: "1px solid",
  borderColor: "divider",
} as const;

const actionBodySx = {
  ...moduleBodySx,
  textAlign: "left",
} as const;

export function RolePermissionMatrixTable({
  grants,
  readOnly = true,
  maxHeight = 420,
  onScopeChange,
}: {
  grants: UserRoleMatrixGrants;
  readOnly?: boolean;
  maxHeight?: number;
  onScopeChange?: (
    moduleId: string,
    action: UserRoleMatrixAction,
    scope: RoleMatrixScope,
  ) => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        overflow: "hidden",
        minWidth: 0,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      <TableContainer sx={{ maxHeight, overflowY: "auto" }}>
        <Table
          stickyHeader
          size="small"
          aria-label="Role permission matrix"
          sx={{ tableLayout: "fixed", width: "100%" }}
        >
          <TableHead>
            <TableRow hover={false}>
              <TableCell sx={moduleHeaderSx}>Module</TableCell>
              {USER_ROLE_MATRIX_COLUMNS.map((column) => (
                <TableCell key={column.key} sx={actionHeaderSx}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {USER_ROLE_MATRIX_MODULES.map((module) => (
              <TableRow key={module.id} hover={false}>
                <TableCell sx={moduleBodySx}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      lineHeight: 1.4,
                    }}
                  >
                    {module.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.25, lineHeight: 1.4 }}
                  >
                    {module.description}
                  </Typography>
                </TableCell>
                {USER_ROLE_MATRIX_COLUMNS.map((column) => {
                  const applicable = isUserRoleMatrixActionApplicable(
                    module.id,
                    column.key,
                  );
                  const scope = getCellScope(grants, module.id, column.key);
                  return (
                    <TableCell key={column.key} sx={actionBodySx}>
                      <RolePermissionMatrixCell
                        scope={scope}
                        applicable={applicable}
                        actionLabel={column.label}
                        moduleName={module.name}
                        readOnly={readOnly}
                        onChange={(next) =>
                          onScopeChange?.(module.id, column.key, next)
                        }
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
