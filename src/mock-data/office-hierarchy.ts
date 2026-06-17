import { formatOfficeLabel, normalizeOfficeAddress } from '@/src/lib/office-address.utils'
import type { OfficeAddress, OfficeTreeNode } from '@/src/types/office'

function officeNode(
  id: string,
  officeName: string,
  address: OfficeAddress,
  children?: OfficeTreeNode[],
): OfficeTreeNode {
  const normalized = normalizeOfficeAddress(address)
  const normalizedName = officeName.trim()
  return {
    id,
    name: formatOfficeLabel(normalizedName, normalized),
    officeName: normalizedName || undefined,
    address: normalized,
    children,
  }
}

const KADEL_LABS_BRANCHES: OfficeTreeNode[] = [
  officeNode('office-udaipur', 'Kadel Labs', {
    addressLine: 'Singhvi Square, IT Park, Madri',
    city: 'Udaipur',
    state: 'Rajasthan',
    pincode: '313001',
    country: 'India',
  }),
  officeNode('office-jaipur', 'Kadel Labs Corporate Office', {
    addressLine: 'Corporate Office',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
    country: 'India',
  }),
  officeNode('office-ahmedabad', 'Kadel Labs Technology Center', {
    addressLine: 'Technology Center',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380001',
    country: 'India',
  }),
  officeNode('office-pune', 'Kadel Labs Innovation Center', {
    addressLine: 'Innovation Center',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    country: 'India',
  }),
  officeNode('office-bengaluru', 'Kadel Labs Development Hub', {
    addressLine: 'Development Hub',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    country: 'India',
  }),
  officeNode('office-hyderabad', 'Kadel Labs Digital Solutions Center', {
    addressLine: 'Digital Solutions Center',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    country: 'India',
  }),
  officeNode('office-chennai', 'Kadel Labs Engineering Office', {
    addressLine: 'Engineering Office',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    country: 'India',
  }),
  officeNode('office-gurugram', 'Kadel Labs Research & Development Center', {
    addressLine: 'Research & Development Center',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122001',
    country: 'India',
  }),
  officeNode('office-noida', 'Kadel Labs Business Operations Center', {
    addressLine: 'Business Operations Center',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    country: 'India',
  }),
  officeNode('office-indore', 'Kadel Labs Technology Hub', {
    addressLine: 'Technology Hub',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    country: 'India',
  }),
  officeNode('office-mumbai', 'Kadel Labs Corporate Branch', {
    addressLine: 'Corporate Branch',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
  }),
  officeNode('office-kochi', 'Kadel Labs Innovation Lab', {
    addressLine: 'Innovation Lab',
    city: 'Kochi',
    state: 'Kerala',
    pincode: '682001',
    country: 'India',
  }),
  officeNode('office-chandigarh', 'Kadel Labs Software Development Center', {
    addressLine: 'Software Development Center',
    city: 'Chandigarh',
    state: 'Chandigarh',
    pincode: '160001',
    country: 'India',
  }),
]

/** Kadel Labs parent with branch offices nested underneath. */
export const OFFICE_HIERARCHY_TREE: OfficeTreeNode[] = [
  officeNode(
    'office-kadel-labs',
    'Kadel Labs',
    {
      addressLine: 'Corporate Headquarters',
      city: 'Udaipur',
      state: 'Rajasthan',
      pincode: '313001',
      country: 'India',
    },
    KADEL_LABS_BRANCHES,
  ),
]
