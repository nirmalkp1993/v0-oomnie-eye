import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

/** Organizational department tree for permission scoping. */
export const DEPARTMENT_HIERARCHY_TREE: HierarchyTreeNode[] = [
  {
    id: 'dept-company',
    name: 'Company',
    children: [
      {
        id: 'dept-sales',
        name: 'Sales',
        children: [
          {
            id: 'dept-sales-emea',
            name: 'EMEA',
            children: [{ id: 'dept-sales-emea-test', name: 'test' }],
          },
          { id: 'dept-sales-americas', name: 'Americas' },
        ],
      },
      { id: 'dept-hr', name: 'Human Resources' },
      {
        id: 'dept-finance',
        name: 'Finance',
        children: [{ id: 'dept-finance-ap', name: 'Accounts Payable' }],
      },
      {
        id: 'dept-engineering',
        name: 'Engineering',
        children: [
          { id: 'dept-eng-product', name: 'Product' },
          { id: 'dept-eng-platform', name: 'Platform' },
        ],
      },
    ],
  },
]
