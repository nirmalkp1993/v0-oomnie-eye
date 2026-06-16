import { USER_MANAGEMENT_FORM_FIELDS, USERS_FORM_ID } from '@/src/constants/field-permissions'
import type {
  FieldPermissionFlag,
  FieldPermissionFlags,
  FieldPreviewStatus,
  FormFieldDefinition,
} from '@/src/types/field-permissions'

export function filterFormFields(
  fields: FormFieldDefinition[],
  search: string,
): FormFieldDefinition[] {
  const q = search.trim().toLowerCase();
  if (!q) return fields;
  return fields.filter(
    (f) =>
      f.label.toLowerCase().includes(q) ||
      f.key.toLowerCase().includes(q) ||
      f.type.toLowerCase().includes(q),
  );
}

export function toggleFieldFlag(
  grants: Record<string, FieldPermissionFlags>,
  fieldId: string,
  flag: FieldPermissionFlag,
): Record<string, FieldPermissionFlags> {
  const current = grants[fieldId];
  if (!current) return grants;
  return {
    ...grants,
    [fieldId]: { ...current, [flag]: !current[flag] },
  };
}

export function resolvePreviewStatus(flags: FieldPermissionFlags): FieldPreviewStatus {
  if (!flags.visible) return "hidden";
  if (flags.masked) return "masked";
  if (flags.readOnly) return "readOnly";
  return "editable";
}

export function canExport(flags: FieldPermissionFlags): boolean {
  return flags.visible && flags.exportable && !flags.denyExport;
}

export function canPrint(flags: FieldPermissionFlags): boolean {
  return flags.visible && flags.printable && !flags.denyPrint;
}

export function getFieldsForForm(formId: string): FormFieldDefinition[] {
  if (formId === USERS_FORM_ID) {
    return USER_MANAGEMENT_FORM_FIELDS
  }
  return USER_MANAGEMENT_FORM_FIELDS
}
