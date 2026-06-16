import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

/** Default territories. */
export const TERRITORY_HIERARCHY_TREE: HierarchyTreeNode[] = [
  {
    id: 'terr-americas',
    name: 'Americas',
    children: [
      { id: 'terr-america', name: 'America' },
      { id: 'terr-latam', name: 'Latin America' },
    ],
  },
  {
    id: 'terr-emea',
    name: 'EMEA',
    children: [
      { id: 'terr-europe', name: 'Europe' },
      { id: 'terr-middle-east', name: 'Middle East' },
    ],
  },
  {
    id: 'terr-apac',
    name: 'APAC',
    children: [
      { id: 'terr-asia', name: 'Asia' },
      { id: 'terr-oceania', name: 'Oceania' },
    ],
  },
]
