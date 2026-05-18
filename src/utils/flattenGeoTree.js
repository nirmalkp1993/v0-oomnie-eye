/**
 * Flattens a hierarchical geo tree into searchable entries.
 *
 * @param {import('@/src/mock-data/mockGeoData').GeoTreeNode} node
 * @param {string[]} [pathNames]
 * @param {string[]} [pathIds]
 * @returns {Array<{
 *   id: string
 *   name: string
 *   type: string
 *   fullPath: string
 *   pathIds: string[]
 * }>}
 */
export function flattenGeoTree(node, pathNames = [], pathIds = []) {
  const names = [...pathNames, node.name]
  const ids = [...pathIds, node.id]
  const fullPath = names.join(' > ')

  /** @type {ReturnType<typeof flattenGeoTree>} */
  const entries = [
    {
      id: node.id,
      name: node.name,
      type: node.type,
      fullPath,
      pathIds: ids,
    },
  ]

  if (node.children?.length) {
    for (const child of node.children) {
      entries.push(...flattenGeoTree(child, names, ids))
    }
  }

  return entries
}

/**
 * Filters flat geo entries by name or full path (case-insensitive).
 *
 * @param {ReturnType<typeof flattenGeoTree>} entries
 * @param {string} query
 * @param {number} [limit]
 */
export function filterGeoEntries(entries, query, limit = 80) {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const matches = entries.filter(
    (entry) => entry.name.toLowerCase().includes(q) || entry.fullPath.toLowerCase().includes(q)
  )

  return matches.slice(0, limit)
}
