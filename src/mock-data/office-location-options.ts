export const OFFICE_COUNTRY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Singapore',
] as const

export const OFFICE_STATE_OPTIONS: Record<string, string[]> = {
  India: ['Rajasthan', 'Maharashtra', 'Karnataka', 'Delhi', 'Gujarat', 'Tamil Nadu'],
  'United States': ['California', 'New York', 'Texas', 'Washington', 'Florida'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
  Singapore: ['Central Region', 'East Region', 'North Region', 'West Region'],
}

export const OFFICE_CITY_OPTIONS: Record<string, string[]> = {
  Rajasthan: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer'],
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubballi'],
  Delhi: ['New Delhi', 'South Delhi', 'North Delhi'],
  Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
  California: ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose'],
  'New York': ['New York City', 'Buffalo', 'Albany'],
  Texas: ['Austin', 'Dallas', 'Houston', 'San Antonio'],
  Washington: ['Seattle', 'Spokane', 'Tacoma'],
  Florida: ['Miami', 'Orlando', 'Tampa'],
  England: ['London', 'Manchester', 'Birmingham', 'Leeds'],
  Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen'],
  Wales: ['Cardiff', 'Swansea', 'Newport'],
  'Northern Ireland': ['Belfast', 'Derry', 'Lisburn'],
  Dubai: ['Dubai Marina', 'Business Bay', 'Jumeirah'],
  'Abu Dhabi': ['Al Reem Island', 'Khalifa City', 'Yas Island'],
  Sharjah: ['Al Majaz', 'Al Nahda', 'Muwaileh'],
  'Central Region': ['Downtown Core', 'Orchard', 'Marina Bay'],
  'East Region': ['Tampines', 'Bedok', 'Pasir Ris'],
  'North Region': ['Woodlands', 'Yishun', 'Sembawang'],
  'West Region': ['Jurong East', 'Clementi', 'Bukit Batok'],
}

function withCurrentValue(options: string[], current: string): string[] {
  if (current && !options.includes(current)) {
    return [current, ...options]
  }
  return options
}

export function getOfficeCountryOptions(current = ''): string[] {
  return withCurrentValue([...OFFICE_COUNTRY_OPTIONS], current)
}

export function getOfficeStateOptions(country: string): string[] {
  return OFFICE_STATE_OPTIONS[country] ?? []
}

export function getOfficeCityOptions(state: string): string[] {
  return OFFICE_CITY_OPTIONS[state] ?? []
}

export function getOfficeStateOptionsForCountry(country: string, current = ''): string[] {
  return withCurrentValue(getOfficeStateOptions(country), current)
}

export function getOfficeCityOptionsForState(state: string, current = ''): string[] {
  return withCurrentValue(getOfficeCityOptions(state), current)
}
