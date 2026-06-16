import type { PermissionMatrixModule } from '@/src/types/permissions-page'

export interface AppModuleNode {
  id: string
  title: string
  description: string
  appTab?: string
  isGroupHeader?: boolean
  children?: AppModuleNode[]
}

export const APP_MODULE_TREE: AppModuleNode[] = [
  {
    id: 'earth',
    title: 'Earth',
    description: 'Earth map and global view',
    appTab: 'earth',
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Operations dashboard',
    appTab: 'dashboard',
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Reports and analytics',
    appTab: 'reports',
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: 'Alerts and notifications',
    appTab: 'alerts',
  },
  {
    id: 'camera',
    title: 'Camera',
    description: 'Camera management',
    isGroupHeader: true,
    children: [
      {
        id: 'camera_devices',
        title: 'Camera',
        description: 'Camera devices',
        appTab: 'camera',
      },
      {
        id: 'camera_groups',
        title: 'Camera Group',
        description: 'Camera groups',
        appTab: 'camera-groups',
      },
      {
        id: 'camera_recording',
        title: 'Camera Recording',
        description: 'Camera recordings',
        appTab: 'camera-recording',
      },
    ],
  },
  {
    id: 'user_management',
    title: 'User Management',
    description: 'Users, groups, roles, and permissions',
    isGroupHeader: true,
    children: [
      {
        id: 'um_users',
        title: 'Users',
        description: 'User accounts',
        appTab: 'um-users',
      },
      {
        id: 'um_groups',
        title: 'Groups',
        description: 'User groups',
        appTab: 'um-groups',
      },
      {
        id: 'um_roles',
        title: 'Roles',
        description: 'Role definitions',
        appTab: 'um-roles',
      },
      {
        id: 'um_permissions',
        title: 'Permissions',
        description: 'Access permissions',
        appTab: 'um-permissions',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Application settings',
    appTab: 'settings',
  },
]

const DEFAULT_EXPANDED_GROUP_IDS = ['camera', 'user_management'] as const

export const DEFAULT_EXPANDED_GROUP_IDS_SET = new Set<string>(DEFAULT_EXPANDED_GROUP_IDS)

function nodeToModule(node: AppModuleNode, depth: number, parentId?: string): PermissionMatrixModule {
  return {
    id: node.id,
    name: node.title,
    displayName: node.title,
    description: node.description,
    resourceType: 'platform',
    category: 'platform',
    isGroupHeader: node.isGroupHeader,
    parentId,
    depth,
    appTab: node.appTab,
  }
}

export function flattenAppModuleTree(
  tree: AppModuleNode[] = APP_MODULE_TREE,
  depth = 0,
  parentId?: string,
): PermissionMatrixModule[] {
  const result: PermissionMatrixModule[] = []
  for (const node of tree) {
    result.push(nodeToModule(node, depth, parentId))
    if (node.children?.length) {
      result.push(...flattenAppModuleTree(node.children, depth + 1, node.id))
    }
  }
  return result
}

export function getAppPermissionLeafModules(
  tree: AppModuleNode[] = APP_MODULE_TREE,
): PermissionMatrixModule[] {
  const leaves: PermissionMatrixModule[] = []
  function walk(nodes: AppModuleNode[], depth: number, parentId?: string) {
    for (const node of nodes) {
      if (node.isGroupHeader && node.children?.length) {
        walk(node.children, depth + 1, node.id)
      } else if (!node.isGroupHeader) {
        leaves.push(nodeToModule(node, depth, parentId))
      }
    }
  }
  walk(tree, 0)
  return leaves
}

export function getAppModuleLeafTitles(): string[] {
  return getAppPermissionLeafModules().map((m) => m.displayName ?? m.name)
}

export function filterAppModules(
  modules: PermissionMatrixModule[],
  query: string,
): PermissionMatrixModule[] {
  const q = query.trim().toLowerCase()
  if (!q) return modules

  const matchingIds = new Set<string>()
  for (const mod of modules) {
    const title = (mod.displayName ?? mod.name).toLowerCase()
    if (title.includes(q) || mod.id.includes(q) || mod.description.toLowerCase().includes(q)) {
      matchingIds.add(mod.id)
      if (mod.parentId) matchingIds.add(mod.parentId)
    }
  }

  for (const mod of modules) {
    if (!mod.parentId) continue
    if (matchingIds.has(mod.id)) matchingIds.add(mod.parentId)
  }

  return modules.filter((mod) => {
    if (mod.isGroupHeader) {
      return modules.some((child) => child.parentId === mod.id && matchingIds.has(child.id))
    }
    return matchingIds.has(mod.id)
  })
}

export function getVisibleGridModules(
  modules: PermissionMatrixModule[],
  expandedGroupIds: ReadonlySet<string>,
): PermissionMatrixModule[] {
  return modules.filter((mod) => {
    if (mod.isGroupHeader) return true
    if (!mod.parentId) return true
    return expandedGroupIds.has(mod.parentId)
  })
}
