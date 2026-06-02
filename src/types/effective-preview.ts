export interface EffectivePermissionRow {
  id: string;
  resource: string;
  resourceType: string;
  module: string;
  action: string;
}

export interface EffectivePreviewUser {
  id: string;
  name: string;
  roles: string[];
  permissions: EffectivePermissionRow[];
}
