import type { OfficeAddress } from '@/src/types/office'

export function normalizeOfficeName(name: string): string {
  return name.trim()
}

export function formatOfficeAddress(address: OfficeAddress): string {
  const parts: string[] = []

  const line = address.addressLine.trim()
  if (line) parts.push(line)

  const city = address.city.trim()
  const state = address.state.trim()
  const pincode = address.pincode.trim()

  const cityStatePin = [
    city,
    [state, pincode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ')

  if (cityStatePin) parts.push(cityStatePin)

  const country = address.country.trim()
  if (country) parts.push(country)

  return parts.join(', ')
}

export function formatOfficeLabel(officeName: string, address: OfficeAddress): string {
  const name = normalizeOfficeName(officeName)
  const addr = formatOfficeAddress(address)
  if (name && addr) return `${name}, ${addr}`
  return name || addr
}

export function isOfficeAddressComplete(address: OfficeAddress): boolean {
  return (
    Boolean(address.addressLine.trim()) &&
    Boolean(address.city.trim()) &&
    Boolean(address.state.trim()) &&
    Boolean(address.pincode.trim()) &&
    Boolean(address.country.trim())
  )
}

export function isOfficeNameComplete(name: string): boolean {
  return Boolean(normalizeOfficeName(name))
}

export function officeAddressesEqual(a: OfficeAddress, b: OfficeAddress): boolean {
  return (
    a.addressLine.trim() === b.addressLine.trim() &&
    a.city.trim() === b.city.trim() &&
    a.state.trim() === b.state.trim() &&
    a.pincode.trim() === b.pincode.trim() &&
    a.country.trim() === b.country.trim()
  )
}

export function normalizeOfficeAddress(address: OfficeAddress): OfficeAddress {
  return {
    addressLine: address.addressLine.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    pincode: address.pincode.trim(),
    country: address.country.trim(),
  }
}
