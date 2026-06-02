'use client'

import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState, type ReactNode } from 'react'
import { getEnterpriseSettingsCardSx } from '@/src/components/enterprise'
import {
  RolePermissionsEditDialog,
  type AssignmentPermissionOverrides,
} from '@/src/components/user-management/role-permissions-dialogs'
import { UserManagementPageShell } from '@/src/components/user-management/user-management-page-shell'
import {
  clonePermissionMatrix,
  createEmptyPermissionMatrix,
  type PermissionMatrix,
} from '@/src/constants/permissions-matrix'
import { useAdminSnackbar } from '@/src/hooks/use-admin-snackbar'
import { MOCK_GROUPS } from '@/src/mock-data/groups'
import { MOCK_ROLE_PERMISSIONS, MOCK_ROLES } from '@/src/mock-data/roles'
import { MOCK_USERS } from '@/src/mock-data/users'
import { cn } from '@/lib/utils'

function buildRoleMatrices(): Record<string, PermissionMatrix> {
  const m: Record<string, PermissionMatrix> = {}
  for (const r of MOCK_ROLES) {
    m[r.id] = MOCK_ROLE_PERMISSIONS[r.id]
      ? clonePermissionMatrix(MOCK_ROLE_PERMISSIONS[r.id])
      : createEmptyPermissionMatrix()
  }
  return m
}

type DialogRole = { id: string; name: string }

export function RoleAssignmentPage() {
  const { showMessage } = useAdminSnackbar()
  const [userQ, setUserQ] = useState('')
  const [groupQ, setGroupQ] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [roleId, setRoleId] = useState<string>(MOCK_ROLES[0]?.id ?? '')
  const [permissionsDialogRole, setPermissionsDialogRole] = useState<DialogRole | null>(null)
  const [roleMatrices] = useState(buildRoleMatrices)
  const [assignmentOverrides, setAssignmentOverrides] = useState<AssignmentPermissionOverrides>({})

  const filteredUsers = useMemo(() => {
    const q = userQ.trim().toLowerCase()
    return MOCK_USERS.filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [userQ])

  const filteredGroups = useMemo(() => {
    const q = groupQ.trim().toLowerCase()
    return MOCK_GROUPS.filter((g) => !q || g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q))
  }, [groupQ])

  const toggle = (set: Set<string>, id: string) => {
    const n = new Set(set)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    return n
  }

  const openPermissionsDialog = (role: DialogRole) => setPermissionsDialogRole(role)

  const assign = () => {
    const r = MOCK_ROLES.find((x) => x.id === roleId)?.name ?? 'Role'
    const overrideCount =
      [...selectedUsers].filter((id) => assignmentOverrides[`u:${id}`]).length +
      [...selectedGroups].filter((id) => assignmentOverrides[`g:${id}`]).length
    const overrideNote =
      overrideCount > 0 ? ` ${overrideCount} target(s) include custom permission overrides.` : ''
    showMessage(
      `Assigned “${r}” to ${selectedUsers.size} user(s) and ${selectedGroups.size} group(s) (mock workflow).${overrideNote}`,
      'success'
    )
  }

  const panelCard = (title: string, search: string, onSearch: (v: string) => void, body: ReactNode) => (
    <Paper
      elevation={0}
      sx={(theme) => ({
        display: 'flex',
        minHeight: 0,
        minWidth: 0,
        flex: 1,
        flexDirection: 'column',
        overflow: 'hidden',
        ...getEnterpriseSettingsCardSx(theme),
      })}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search…"
          sx={{ mt: 1.5 }}
        />
      </Box>
      <Box sx={{ maxHeight: 420, flex: 1, overflowY: 'auto', p: 1 }}>{body}</Box>
    </Paper>
  )

  const dialogRoleMatrix = (id: string) => roleMatrices[id]

  return (
    <UserManagementPageShell
      title="Role assignment"
      description="Select users and groups, pick a role, then assign in one coordinated action."
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, alignItems: 'stretch' }}>
        {panelCard(
          'Users',
          userQ,
          setUserQ,
          <div className="flex flex-col gap-0.5">
            {filteredUsers.map((u) => (
              <label
                key={u.id}
                htmlFor={`u-${u.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/80"
              >
                <Checkbox
                  checked={selectedUsers.has(u.id)}
                  onChange={() => setSelectedUsers((s) => toggle(s, u.id))}
                  size="small"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{u.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {panelCard(
          'Groups',
          groupQ,
          setGroupQ,
          <div className="flex flex-col gap-0.5">
            {filteredGroups.map((g) => (
              <label
                key={g.id}
                htmlFor={`g-${g.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-muted/80"
              >
                <Checkbox
                  checked={selectedGroups.has(g.id)}
                  onChange={() => setSelectedGroups((s) => toggle(s, g.id))}
                  size="small"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{g.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{g.id}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        <Paper
          elevation={0}
          sx={(theme) => ({
            display: 'flex',
            minHeight: 0,
            minWidth: 0,
            flex: 1,
            flexDirection: 'column',
            ...getEnterpriseSettingsCardSx(theme),
          })}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Role selection
            </Typography>
            <FormControl size="small" fullWidth sx={{ mt: 1.5 }}>
              <InputLabel id="role-assignment-select-label">Role</InputLabel>
              <Select
                labelId="role-assignment-select-label"
                label="Role"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
              >
                {MOCK_ROLES.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
              Or select a role card below
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', maxHeight: 320, flexDirection: 'column', gap: 1, overflowY: 'auto', pr: 0.5 }}>
              {MOCK_ROLES.map((r) => {
                const isSelected = roleId === r.id
                const dialogRole = { id: r.id, name: r.name }
                return (
                  <div
                    key={r.id}
                    className={cn(
                      'overflow-hidden rounded-md border transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-background'
                    )}
                  >
                    <div className="flex items-stretch">
                      <button
                        type="button"
                        onClick={() => setRoleId(r.id)}
                        className={cn(
                          'min-w-0 flex-1 p-3 text-left transition-colors',
                          !isSelected && 'hover:bg-muted/50'
                        )}
                      >
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                      </button>
                      <div className="flex shrink-0 border-l border-border/60">
                        <Button
                          type="button"
                          variant="text"
                          title="View and edit permissions"
                          aria-label="View and edit permissions"
                          onClick={() => openPermissionsDialog(dialogRole)}
                          sx={{ minHeight: 52, width: 40, borderRadius: 0, color: 'text.secondary' }}
                        >
                          <ShieldOutlinedIcon fontSize="small" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </Box>
          </Box>
        </Paper>
      </Box>

      {permissionsDialogRole && dialogRoleMatrix(permissionsDialogRole.id) && (
        <RolePermissionsEditDialog
          open
          onOpenChange={(open) => !open && setPermissionsDialogRole(null)}
          roleName={permissionsDialogRole.name}
          roleMatrix={dialogRoleMatrix(permissionsDialogRole.id)}
          selectedUserIds={selectedUsers}
          selectedGroupIds={selectedGroups}
          overrides={assignmentOverrides}
          onOverridesChange={setAssignmentOverrides}
          onNotify={showMessage}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={() => {
            setSelectedUsers(new Set())
            setSelectedGroups(new Set())
            setRoleId(MOCK_ROLES[0]?.id ?? '')
            setPermissionsDialogRole(null)
            setAssignmentOverrides({})
            showMessage('Selection reset', 'info')
          }}
        >
          Reset
        </Button>
        <Button variant="outlined" onClick={() => showMessage('Cancelled', 'info')}>
          Cancel
        </Button>
        <Button variant="contained" onClick={assign}>
          Assign Role
        </Button>
      </Box>
    </UserManagementPageShell>
  )
}
