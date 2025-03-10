export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  postalCode?: string
  address?: string
  phone?: string
  status: 'active' | 'suspended' | 'banned'
  roles: string[]
  coinBalance: number
  pointsBalance: number
  pointsLastUpdated?: Date
  createdAt: string
}