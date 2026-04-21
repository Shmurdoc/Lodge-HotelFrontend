import { fetchApi } from './backendApi'
import { useAppStore, type Property, type Room, type Booking, type Guest, type User, type Invoice, type Payment } from '@/store/useAppStore'

const DEMO_PROPERTY_ID = '00000000-0000-0000-0000-000000000001'

export const dataService = {
  async getProperties(): Promise<Property[]> {
    try {
      const { data, error } = await fetchApi('/api/properties')
      if (error) throw error
      return data || []
    } catch (e) {
      console.warn('API error, using demo properties:', e)
      return this.getDemoProperties()
    }
  },

  async getRooms(propertyId?: string): Promise<Room[]> {
    try {
      const url = propertyId ? `/api/rooms/property/${propertyId}` : '/api/rooms'
      const { data, error } = await fetchApi(url)
      if (error) throw error
      return data || []
    } catch (e) {
      console.warn('API error, using demo rooms:', e)
      return this.getDemoRooms()
    }
  },

  async getBookings(propertyId?: string): Promise<Booking[]> {
    try {
      const url = propertyId ? `/api/bookings?propertyId=${propertyId}` : '/api/bookings'
      const { data, error } = await fetchApi(url)
      if (error) throw error
      return data || []
    } catch (e) {
      console.warn('API error, using demo bookings:', e)
      return this.getDemoBookings()
    }
  },

  async getGuests(propertyId?: string): Promise<Guest[]> {
    try {
      const url = propertyId ? `/api/guests?propertyId=${propertyId}` : '/api/guests'
      const { data, error } = await fetchApi(url)
      if (error) throw error
      return data || []
    } catch (e) {
      console.warn('API error, using demo guests:', e)
      return this.getDemoGuests()
    }
  },

  async getStaff(propertyId?: string): Promise<User[]> {
    try {
      const url = propertyId ? `/api/staff?propertyId=${propertyId}` : '/api/staff'
      const { data, error } = await fetchApi(url)
      if (error) throw error
      return data || []
    } catch (e) {
      console.warn('API error, using demo staff:', e)
      return this.getDemoStaff()
    }
  },

  async getInvoices(propertyId?: string): Promise<Invoice[]> {
    try {
      const url = propertyId ? `/api/invoices?propertyId=${propertyId}` : '/api/invoices'
      const { data, error } = await fetchApi(url)
      if (error) throw error
      return data || []
    } catch (e) {
      return []
    }
  },

  async getPayments(propertyId?: string): Promise<Payment[]> {
    try {
      const url = propertyId ? `/api/payments?propertyId=${propertyId}` : '/api/payments'
      const { data, error } = await fetchApi(url)
      if (error) throw error
      return data || []
    } catch (e) {
      return []
    }
  },

  getDemoProperties(): Property[] {
    return [{ id: DEMO_PROPERTY_ID, name: 'Safari Lodge', address: '123 Safari Way', totalRooms: 25, occupiedRooms: 18, rating: 4.5, image: '', status: 'operational', phone: '+1234567890', email: 'info@safarilodge.com', description: 'Demo property' }]
  },

  getDemoRooms(): Room[] {
    return [
      { id: '1', propertyId: DEMO_PROPERTY_ID, number: '101', type: 'Standard', floor: 1, status: 'available', price: 150, description: 'Standard Room', amenities: ['WiFi', 'TV'], image: '', maxOccupancy: 2 },
      { id: '2', propertyId: DEMO_PROPERTY_ID, number: '102', type: 'Deluxe', floor: 1, status: 'occupied', price: 250, description: 'Deluxe Room', amenities: ['WiFi', 'TV', 'Mini Bar'], image: '', maxOccupancy: 3 }
    ]
  },

  getDemoBookings(): Booking[] {
    return [
      { id: '1', guestId: 'g1', guestName: 'John Doe', guestEmail: 'john@example.com', guestPhone: '+1234567890', guestSegment: 'VIP', propertyId: DEMO_PROPERTY_ID, propertyName: 'Safari Lodge', roomId: '1', roomNumber: '101', roomType: 'Standard', checkIn: '2026-04-20', checkOut: '2026-04-25', nights: 5, guests: 2, status: 'confirmed', paymentStatus: 'paid', amount: 750, source: 'direct', createdAt: '2026-04-15' }
    ]
  },

  getDemoGuests(): Guest[] {
    return [
      { id: 'g1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', idNumber: 'ID123456', nationality: 'US', segment: 'VIP', totalStays: 5, loyaltyPoints: 500, preferences: ['Late checkout'], notes: '', companyName: '', createdAt: '2025-01-01', lastVisit: '2026-03-15' }
    ]
  },

  getDemoStaff(): User[] {
    return [
      { id: 's1', name: 'Jane Smith', email: 'jane@hotel.com', role: 'Manager', department: 'Front Desk', avatar: '', phone: '+1234567890', hireDate: '2024-01-15', status: 'active', address: '', emergencyContact: '', emergencyPhone: '', certifications: [], notes: '' }
    ]
  },

  getDemoInvoices(): Invoice[] { return [] },
  getDemoPayments(): Payment[] { return [] }
}