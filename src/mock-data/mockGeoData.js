/** @typedef {'world' | 'continent' | 'country' | 'state' | 'city'} GeoLocationType */

/**
 * @typedef {Object} GeoTreeNode
 * @property {string} id
 * @property {string} name
 * @property {GeoLocationType} type
 * @property {GeoTreeNode[]} [children]
 */

/** @type {GeoTreeNode} */
export const MOCK_GEO_DATA = {
  id: 'world',
  name: 'World',
  type: 'world',
  children: [
    {
      id: 'asia',
      name: 'Asia',
      type: 'continent',
      children: [
        {
          id: 'india',
          name: 'India',
          type: 'country',
          children: [
            {
              id: 'rajasthan',
              name: 'Rajasthan',
              type: 'state',
              children: [
                { id: 'jaipur', name: 'Jaipur', type: 'city' },
                { id: 'jodhpur', name: 'Jodhpur', type: 'city' },
                { id: 'udaipur', name: 'Udaipur', type: 'city' },
              ],
            },
            {
              id: 'maharashtra',
              name: 'Maharashtra',
              type: 'state',
              children: [
                { id: 'mumbai', name: 'Mumbai', type: 'city' },
                { id: 'pune', name: 'Pune', type: 'city' },
              ],
            },
            { id: 'delhi', name: 'Delhi', type: 'city' },
          ],
        },
        {
          id: 'japan',
          name: 'Japan',
          type: 'country',
          children: [
            { id: 'tokyo', name: 'Tokyo', type: 'city' },
            { id: 'osaka', name: 'Osaka', type: 'city' },
          ],
        },
        {
          id: 'uae',
          name: 'UAE',
          type: 'country',
          children: [{ id: 'dubai', name: 'Dubai', type: 'city' }],
        },
      ],
    },
    {
      id: 'europe',
      name: 'Europe',
      type: 'continent',
      children: [
        {
          id: 'germany',
          name: 'Germany',
          type: 'country',
          children: [
            { id: 'berlin', name: 'Berlin', type: 'city' },
            { id: 'munich', name: 'Munich', type: 'city' },
          ],
        },
        {
          id: 'france',
          name: 'France',
          type: 'country',
          children: [{ id: 'paris', name: 'Paris', type: 'city' }],
        },
        {
          id: 'uk',
          name: 'UK',
          type: 'country',
          children: [{ id: 'london', name: 'London', type: 'city' }],
        },
      ],
    },
    {
      id: 'north-america',
      name: 'North America',
      type: 'continent',
      children: [
        {
          id: 'usa',
          name: 'USA',
          type: 'country',
          children: [
            {
              id: 'california',
              name: 'California',
              type: 'state',
              children: [
                { id: 'los-angeles', name: 'Los Angeles', type: 'city' },
                { id: 'san-francisco', name: 'San Francisco', type: 'city' },
              ],
            },
            { id: 'new-york', name: 'New York', type: 'city' },
          ],
        },
        {
          id: 'canada',
          name: 'Canada',
          type: 'country',
          children: [{ id: 'toronto', name: 'Toronto', type: 'city' }],
        },
      ],
    },
  ],
}
