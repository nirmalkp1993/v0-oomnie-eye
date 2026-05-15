export interface GeoTreeNode {
  id: string
  label: string
  children?: GeoTreeNode[]
}

export const GEO_TREE_ROOT: GeoTreeNode = {
  id: 'world',
  label: 'World',
  children: [
    {
      id: 'asia',
      label: 'Asia',
      children: [
        {
          id: 'india',
          label: 'India',
          children: [
            { id: 'jaipur', label: 'Jaipur' },
            { id: 'udaipur', label: 'Udaipur' },
            { id: 'delhi', label: 'Delhi' },
            { id: 'mumbai', label: 'Mumbai' },
          ],
        },
      ],
    },
    { id: 'europe', label: 'Europe' },
    { id: 'africa', label: 'Africa' },
    { id: 'north-america', label: 'North America' },
  ],
}

export function flattenGeoIds(node: GeoTreeNode, acc: string[] = []): string[] {
  acc.push(node.id)
  if (node.children) {
    for (const c of node.children) flattenGeoIds(c, acc)
  }
  return acc
}
