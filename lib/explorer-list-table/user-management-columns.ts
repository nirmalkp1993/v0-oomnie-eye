import type { ExplorerListColumnDef } from '@/lib/explorer-list-table/types'

export const USER_LIST_COLUMNS: ExplorerListColumnDef[] = [
  {
    id: 'userName',
    label: 'User Name',
    headerClassName: 'sticky left-0 z-10 min-w-[160px] bg-card',
  },
  { id: 'email', label: 'Email', headerClassName: 'min-w-[200px]' },
  { id: 'age', label: 'Age', headerClassName: 'min-w-[72px]' },
  { id: 'mobileNumber', label: 'Mobile Number', headerClassName: 'min-w-[140px]' },
  { id: 'role', label: 'Role', headerClassName: 'min-w-[130px]' },
  { id: 'group', label: 'Group', headerClassName: 'min-w-[140px]' },
  { id: 'location', label: 'Location', headerClassName: 'min-w-[140px]' },
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
  { id: 'groupId', label: 'Group ID', headerClassName: 'min-w-[120px]' },
  {
    id: 'groupName',
    label: 'Group Name',
    headerClassName: 'sticky left-0 z-10 min-w-[160px] bg-card',
  },
  { id: 'description', label: 'Description', headerClassName: 'min-w-[220px]' },
  { id: 'assignedUsersCount', label: 'Assigned Users Count', headerClassName: 'min-w-[120px]' },
  { id: 'createdDate', label: 'Created Date', headerClassName: 'min-w-[130px]' },
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
    id: 'roleName',
    label: 'Role Name',
    headerClassName: 'sticky left-0 z-10 min-w-[160px] bg-card',
  },
  { id: 'description', label: 'Description', headerClassName: 'min-w-[220px]' },
  { id: 'userCount', label: 'User Count', headerClassName: 'min-w-[100px]' },
  { id: 'createdDate', label: 'Created Date', headerClassName: 'min-w-[130px]' },
  {
    id: 'actions',
    label: 'Actions',
    hideable: false,
    filterable: false,
    sortable: false,
    headerClassName: 'sticky right-0 z-10 min-w-[72px] bg-card text-right',
  },
]
