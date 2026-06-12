import type { ExplorerListColumnDef } from '@/lib/explorer-list-table/types'

export const USER_LIST_COLUMNS: ExplorerListColumnDef[] = [
  {
    id: 'name',
    label: 'Name',
    headerClassName: 'sticky left-0 z-10 min-w-[160px] bg-card',
  },
  { id: 'email', label: 'Email', headerClassName: 'min-w-[200px]' },
  { id: 'roles', label: 'Roles', headerClassName: 'min-w-[160px]' },
  { id: 'groups', label: 'Groups', headerClassName: 'min-w-[160px]' },
  { id: 'department', label: 'Department', headerClassName: 'min-w-[130px]' },
  { id: 'office', label: 'Office', headerClassName: 'min-w-[120px]' },
  { id: 'lastLogin', label: 'Last Login', headerClassName: 'min-w-[120px]' },
  { id: 'status', label: 'Status', headerClassName: 'min-w-[100px]' },
  {
    id: 'actions',
    label: 'Actions',
    hideable: false,
    filterable: false,
    sortable: false,
    headerClassName: 'sticky right-0 z-10 min-w-[72px] bg-card text-right',
  },
]

export const GROUP_LIST_COLUMNS: ExplorerListColumnDef[] = [
  {
    id: 'name',
    label: 'Group Name',
    headerClassName: 'sticky left-0 z-10 min-w-[160px] bg-card',
  },
  { id: 'description', label: 'Description', headerClassName: 'min-w-[220px]' },
  { id: 'type', label: 'Type', headerClassName: 'min-w-[90px]' },
  { id: 'memberCount', label: 'Members', headerClassName: 'min-w-[90px]' },
  { id: 'inheritedRoles', label: 'Inherited Roles', headerClassName: 'min-w-[160px]' },
  { id: 'scope', label: 'Scope', headerClassName: 'min-w-[180px]' },
  { id: 'status', label: 'Status', headerClassName: 'min-w-[100px]' },
  { id: 'lastUpdated', label: 'Last Updated', headerClassName: 'min-w-[120px]' },
  {
    id: 'actions',
    label: 'Actions',
    hideable: false,
    filterable: false,
    sortable: false,
    headerClassName: 'sticky right-0 z-10 min-w-[72px] bg-card text-right',
  },
]

export const ROLE_LIST_COLUMNS: ExplorerListColumnDef[] = [
  {
    id: 'name',
    label: 'Role Name',
    headerClassName: 'sticky left-0 z-10 min-w-[160px] bg-card',
  },
  { id: 'description', label: 'Description', headerClassName: 'min-w-[220px]' },
  { id: 'userCount', label: 'Users', headerClassName: 'min-w-[80px]' },
  { id: 'groupCount', label: 'Groups', headerClassName: 'min-w-[80px]' },
  { id: 'permissionCount', label: 'Permissions', headerClassName: 'min-w-[110px]' },
  { id: 'dataScope', label: 'Data Scope', headerClassName: 'min-w-[140px]' },
  { id: 'status', label: 'Status', headerClassName: 'min-w-[100px]' },
  { id: 'lastUpdated', label: 'Last Updated', headerClassName: 'min-w-[120px]' },
  {
    id: 'actions',
    label: 'Actions',
    hideable: false,
    filterable: false,
    sortable: false,
    headerClassName: 'sticky right-0 z-10 min-w-[72px] bg-card text-right',
  },
]
