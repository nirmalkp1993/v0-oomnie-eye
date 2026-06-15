import type { GroupListItem } from '@/src/types/user-management'

export interface UserGroupTableNode {
  group: GroupListItem
  children: UserGroupTableNode[]
}

export function groupParentIds(group: GroupListItem): string[] {
  return group.parentGroupIds ?? []
}

function subtreeHasSearchMatch(
  group: GroupListItem,
  allGroups: GroupListItem[],
  query: string,
  visited: Set<string>,
): boolean {
  if (visited.has(group.id)) return false
  visited.add(group.id)
  const q = query.toLowerCase()
  if (group.name.toLowerCase().includes(q)) return true
  if (group.description.toLowerCase().includes(q)) return true
  return allGroups
    .filter((item) => groupParentIds(item).includes(group.id))
    .some((child) => subtreeHasSearchMatch(child, allGroups, query, visited))
}

export function buildUserGroupTreeNode(
  group: GroupListItem,
  allGroups: GroupListItem[],
  queryTrim: string,
  ancestorPath: Set<string>,
): UserGroupTableNode | null {
  if (ancestorPath.has(group.id)) return null

  if (queryTrim.length > 0 && !subtreeHasSearchMatch(group, allGroups, queryTrim, new Set())) {
    return null
  }

  const childGroups = allGroups
    .filter((item) => groupParentIds(item).includes(group.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  const nextPath = new Set(ancestorPath).add(group.id)
  const children = childGroups
    .map((child) => buildUserGroupTreeNode(child, allGroups, queryTrim, nextPath))
    .filter((node): node is UserGroupTableNode => node !== null)

  return { group, children }
}

export function getUserGroupTableTree(
  groups: GroupListItem[],
  searchQuery = '',
): UserGroupTableNode[] {
  const queryTrim = searchQuery.trim()
  const roots = groups
    .filter((group) => groupParentIds(group).length === 0)
    .sort((a, b) => a.name.localeCompare(b.name))

  return roots
    .map((root) => buildUserGroupTreeNode(root, groups, queryTrim, new Set()))
    .filter((node): node is UserGroupTableNode => node !== null)
}

export function findUserGroupTableNode(
  nodes: UserGroupTableNode[],
  groupId: string,
): UserGroupTableNode | null {
  for (const node of nodes) {
    if (node.group.id === groupId) return node
    const found = findUserGroupTableNode(node.children, groupId)
    if (found) return found
  }
  return null
}

export function collectSubtreeGroupIds(groups: GroupListItem[], rootId: string): string[] {
  const ids: string[] = [rootId]
  const walk = (parentId: string) => {
    for (const group of groups) {
      if (groupParentIds(group).includes(parentId) && !ids.includes(group.id)) {
        ids.push(group.id)
        walk(group.id)
      }
    }
  }
  walk(rootId)
  return ids
}

export function countMembersInGroupSubtree(
  groupId: string,
  groups: GroupListItem[],
): number {
  const subtreeIds = new Set(collectSubtreeGroupIds(groups, groupId))
  const memberIds = new Set<string>()
  for (const group of groups) {
    if (!subtreeIds.has(group.id)) continue
    for (const userId of group.memberUserIds ?? []) {
      memberIds.add(userId)
    }
  }
  return memberIds.size
}

export function getDirectChildGroups(
  groups: GroupListItem[],
  parentId: string,
): GroupListItem[] {
  return groups
    .filter((group) => groupParentIds(group).includes(parentId))
    .sort((a, b) => a.name.localeCompare(b.name))
}
