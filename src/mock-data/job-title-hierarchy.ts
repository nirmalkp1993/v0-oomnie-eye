import type { HierarchyTreeNode } from '@/src/lib/nested-tree-path-options'

/** Job title tree for user directory assignment. */
export const JOB_TITLE_HIERARCHY_TREE: HierarchyTreeNode[] = [
  {
    id: 'title-leadership',
    name: 'Leadership',
    children: [
      { id: 'title-executive', name: 'Executive' },
      { id: 'title-director', name: 'Director' },
      { id: 'title-director-operations', name: 'Director of Operations' },
    ],
  },
  {
    id: 'title-management',
    name: 'Management',
    children: [
      { id: 'title-manager', name: 'Manager' },
      { id: 'title-team-lead', name: 'Team Lead' },
      { id: 'title-operations-manager', name: 'Operations Manager' },
    ],
  },
  {
    id: 'title-individual-contributors',
    name: 'Individual Contributors',
    children: [
      { id: 'title-analyst', name: 'Analyst' },
      { id: 'title-financial-analyst', name: 'Financial Analyst' },
      { id: 'title-engineer', name: 'Engineer' },
      { id: 'title-specialist', name: 'Specialist' },
    ],
  },
]
