'use client'

import { Eye, Pencil } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  RolePermissionsEditDialog,
  RolePermissionsViewDialog,
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
  const [viewDialogRole, setViewDialogRole] = useState<DialogRole | null>(null)
  const [editDialogRole, setEditDialogRole] = useState<DialogRole | null>(null)
  const [roleMatrices] = useState(buildRoleMatrices)
  const [assignmentOverrides, setAssignmentOverrides] = useState<AssignmentPermissionOverrides>({})

  const filteredUsers = useMemo(() => {
    const q = userQ.trim().toLowerCase()
    return MOCK_USERS.filter((u) => !q || u.userName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [userQ])

  const filteredGroups = useMemo(() => {
    const q = groupQ.trim().toLowerCase()
    return MOCK_GROUPS.filter((g) => !q || g.groupName.toLowerCase().includes(q) || g.groupId.toLowerCase().includes(q))
  }, [groupQ])

  const toggle = (set: Set<string>, id: string) => {
    const n = new Set(set)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    return n
  }

  const openViewDialog = (role: DialogRole) => setViewDialogRole(role)

  const openEditDialog = (role: DialogRole) => {
    if (selectedUsers.size === 0 && selectedGroups.size === 0) {
      showMessage('Select at least one user or group to edit permissions.', 'info')
      return
    }
    setEditDialogRole(role)
  }

  const assign = () => {
    const r = MOCK_ROLES.find((x) => x.id === roleId)?.roleName ?? 'Role'
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search…"
          className="mt-3 border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:border-primary"
        />
      </div>
      <div className="max-h-[420px] flex-1 overflow-y-auto p-2">{body}</div>
    </div>
  )

  const dialogRoleMatrix = (id: string) => roleMatrices[id]

  return (
    <UserManagementPageShell
      title="Role assignment"
      description="Select users and groups, pick a role, then assign in one coordinated action."
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
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
                  id={`u-${u.id}`}
                  checked={selectedUsers.has(u.id)}
                  onCheckedChange={() => setSelectedUsers((s) => toggle(s, u.id))}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{u.userName}</p>
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
                  id={`g-${g.id}`}
                  checked={selectedGroups.has(g.id)}
                  onCheckedChange={() => setSelectedGroups((s) => toggle(s, g.id))}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{g.groupName}</p>
                  <p className="truncate text-xs text-muted-foreground">{g.groupId}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-lg border border-border bg-card shadow-sm">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-foreground">Role selection</h2>
            <div className="mt-3 space-y-2">
              <Label htmlFor="role-select" className="text-xs text-muted-foreground">
                Role
              </Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger id="role-select" className="w-full border-border bg-input">
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_ROLES.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.roleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Or select a role card below</p>
            <div className="mt-2 flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
              {MOCK_ROLES.map((r) => {
                const isSelected = roleId === r.id
                const dialogRole = { id: r.id, name: r.roleName }
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
                        <p className="text-sm font-semibold text-foreground">{r.roleName}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                      </button>
                      <div className="flex shrink-0 border-l border-border/60">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="View permissions"
                          aria-label="View permissions"
                          onClick={() => openViewDialog(dialogRole)}
                          className="h-full min-h-[52px] w-10 rounded-none text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Edit permissions for selection"
                          aria-label="Edit permissions for selection"
                          onClick={() => openEditDialog(dialogRole)}
                          className="h-full min-h-[52px] w-10 rounded-none border-l border-border/60 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {viewDialogRole && dialogRoleMatrix(viewDialogRole.id) && (
        <RolePermissionsViewDialog
          open
          onOpenChange={(open) => !open && setViewDialogRole(null)}
          roleName={viewDialogRole.name}
          roleMatrix={dialogRoleMatrix(viewDialogRole.id)}
          selectedUserIds={selectedUsers}
          selectedGroupIds={selectedGroups}
          overrides={assignmentOverrides}
          onEditRequest={() => {
            const role = viewDialogRole
            setViewDialogRole(null)
            if (role) setEditDialogRole(role)
          }}
        />
      )}

      {editDialogRole && dialogRoleMatrix(editDialogRole.id) && (
        <RolePermissionsEditDialog
          open
          onOpenChange={(open) => !open && setEditDialogRole(null)}
          roleName={editDialogRole.name}
          roleMatrix={dialogRoleMatrix(editDialogRole.id)}
          selectedUserIds={selectedUsers}
          selectedGroupIds={selectedGroups}
          overrides={assignmentOverrides}
          onOverridesChange={setAssignmentOverrides}
          onNotify={showMessage}
        />
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          className="border-border"
          onClick={() => {
            setSelectedUsers(new Set())
            setSelectedGroups(new Set())
            setRoleId(MOCK_ROLES[0]?.id ?? '')
            setViewDialogRole(null)
            setEditDialogRole(null)
            setAssignmentOverrides({})
            showMessage('Selection reset', 'info')
          }}
        >
          Reset
        </Button>
        <Button variant="outline" className="border-border" onClick={() => showMessage('Cancelled', 'info')}>
          Cancel
        </Button>
        <Button onClick={assign}>Assign Role</Button>
      </div>
    </UserManagementPageShell>
  )
}
