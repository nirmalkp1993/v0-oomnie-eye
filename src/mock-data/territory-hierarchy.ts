import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

/** Territory tree for user directory assignment. */
export const TERRITORY_HIERARCHY_TREE: HierarchyTreeNode[] = [
  {
    id: 'terr-global',
    name: 'Global',
    children: [
      {
        id: 'terr-americas',
        name: 'Americas',
        children: [
          { id: 'terr-north-america', name: 'North America' },
          { id: 'terr-south-america', name: 'South America' },
          { id: 'terr-central-americas', name: 'Central' },
        ],
      },
      {
        id: 'terr-emea',
        name: 'EMEA',
        children: [
          { id: 'terr-north', name: 'North' },
          { id: 'terr-south', name: 'South' },
          { id: 'terr-east', name: 'East' },
          { id: 'terr-west', name: 'West' },
        ],
      },
      {
        id: 'terr-apac',
        name: 'APAC',
        children: [
          { id: 'terr-east-asia', name: 'East Asia' },
          { id: 'terr-south-asia', name: 'South Asia' },
          { id: 'terr-oceania', name: 'Oceania' },
        ],
      },
    ],
  },
]
