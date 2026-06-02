export type FieldPermissionFlag =
  | "visible"
  | "readOnly"
  | "masked"
  | "required"
  | "exportable"
  | "printable"
  | "denyExport"
  | "denyPrint";

export type FieldPreviewPerspective = "admin" | "team_lead" | "operations_manager";

export type FieldPreviewStatus = "editable" | "readOnly" | "masked" | "hidden";

export interface FormFieldDefinition {
  id: string;
  label: string;
  key: string;
  type: string;
}

export interface FieldPermissionFlags {
  visible: boolean;
  readOnly: boolean;
  masked: boolean;
  required: boolean;
  exportable: boolean;
  printable: boolean;
  denyExport: boolean;
  denyPrint: boolean;
}

export type FieldPermissionGrants = Record<string, FieldPermissionFlags>;
