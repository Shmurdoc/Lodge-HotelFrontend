import { supabase } from './supabase'
import { useAppStore, type Property, type Room, type Booking, type Guest, type User, type Invoice, type Payment, type Ticket } from '@/store/useAppStore'

const DEMO_PROPERTY_ID = '00000000-0000-0000-0000-000000000001'

export const dataService = {
  async getProperties(): Promise<Property[]> {
    if (!supabase) {
      console.warn('Supabase not configured, using demo properties')
      return this.getDemoProperties()
    }
    const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    if (error || !data?.length) {
      console.warn('Using demo properties')
      return this.getDemoProperties()
    }
    return data || []
  },

  async getRooms(propertyId?: string): Promise<Room[]> {
    if (!supabase) return this.getDemoRooms()
    let query = supabase.from('rooms').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('number')
    if (error || !data?.length) return this.getDemoRooms()
    return (data || []).map(this.mapRoomFromDb)
  },

  async getBookings(propertyId?: string): Promise<Booking[]> {
    if (!supabase) return this.getDemoBookings() as any
    let query = supabase.from('bookings').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error || !data?.length) return this.getDemoBookings() as any
    return (data || []).map(b => this.mapBookingFromDb(b)) as any
  },

  async getGuests(propertyId?: string): Promise<Guest[]> {
    if (!supabase) return this.getDemoGuests() as any
    let query = supabase.from('guests').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error || !data?.length) return this.getDemoGuests() as any
    return (data || []).map(g => this.mapGuestFromDb(g)) as any
  },

  async getStaff(propertyId?: string): Promise<User[]> {
    if (!supabase) return this.getDemoStaff() as any
    let query = supabase.from('users').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('name')
    if (error || !data?.length) return this.getDemoStaff() as any
    return (data || []).map(u => this.mapUserFromDb(u)) as any
  },

  async getInvoices(propertyId?: string): Promise<Invoice[]> {
    if (!supabase) return this.getDemoInvoices() as any
    let query = supabase.from('invoices').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error || !data?.length) return this.getDemoInvoices() as any
    return data as any
  },

  async getPayments(propertyId?: string): Promise<Payment[]> {
    if (!supabase) return this.getDemoPayments() as any
    let query = supabase.from('payments').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('processed_at', { ascending: false })
    if (error || !data?.length) return this.getDemoPayments() as any
    return data as any
  },

  mapRoomFromDb(row: any): Room {
    return {
      id: row.id,
      propertyId: row.property_id,
      number: row.number,
      type: row.type,
      floor: row.floor,
      status: row.status,
      price: row.price,
      description: row.description,
      amenities: row.amenities || [],
      imageUrl: row.image_url,
      maxOccupancy: row.max_occupancy,
      lastCleaned: row.last_cleaned,
      lastInspected: row.last_inspected,
      bedType: row.bed_type,
      size: row.size,
      view: row.view
    }
  },

  mapBookingFromDb(row: any): Booking {
    return {
      id: row.id,
      guestId: row.guest_id,
      guestName: row.guest_name,
      guestEmail: row.guest_email,
      guestPhone: row.guest_phone,
      guestSegment: row.guest_segment,
      propertyId: row.property_id,
      roomId: row.room_id,
      roomNumber: row.room_number,
      roomType: row.room_type,
      checkIn: row.check_in,
      checkOut: row.check_out,
      status: row.status,
      totalAmount: row.total_amount,
      currency: row.currency,
      source: row.source,
      createdAt: row.created_at,
      notes: row.notes
    }
  },

  mapGuestFromDb(row: any): Guest {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      idNumber: row.id_number,
      nationality: row.nationality,
      segment: row.segment,
      totalStays: row.total_stays,
      loyaltyPoints: row.loyalty_points,
      preferences: row.preferences || [],
      notes: row.notes,
      companyName: row.company_name
    }
  },

  mapUserFromDb(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      department: row.department,
      avatarUrl: row.avatar_url,
      phone: row.phone,
      hireDate: row.hire_date,
      status: row.status,
      address: row.address,
      emergencyContact: row.emergency_contact,
      emergencyPhone: row.emergency_phone,
      certifications: row.certifications || [],
      notes: row.notes
    }
  },

  getDemoProperties(): Property[] {
    return [{ id: DEMO_PROPERTY_ID, name: 'Safari Lodge', address: '123 Safari Way', totalRooms: 25, occupiedRooms: 18, rating: 4.5, imageUrl: '', status: 'operational', phone: '+1234567890', email: 'info@safarilodge.com', description: 'Demo property' }]
  },

  getDemoRooms(): Room[] {
    return [
      { id: '1', propertyId: DEMO_PROPERTY_ID, number: '101', type: 'Standard', floor: 1, status: 'available', price: 150, description: 'Standard Room', amenities: ['WiFi', 'TV'], maxOccupancy: 2 },
      { id: '2', propertyId: DEMO_PROPERTY_ID, number: '102', type: 'Deluxe', floor: 1, status: 'occupied', price: 250, description: 'Deluxe Room', amenities: ['WiFi', 'TV', 'Mini Bar'], maxOccupancy: 3 }
    ]
  },

  getDemoBookings(): Booking[] {
    return [
      { id: '1', guestId: 'g1', guestName: 'John Doe', guestEmail: 'john@example.com', guestPhone: '+1234567890', guestSegment: 'VIP', propertyId: DEMO_PROPERTY_ID, roomId: '1', roomNumber: '101', roomType: 'Standard', checkIn: '2026-04-20', checkOut: '2026-04-25', status: 'confirmed', totalAmount: 750, currency: 'USD', source: 'direct', createdAt: '2026-04-15', notes: '' }
    ]
  },

  getDemoGuests(): Guest[] {
    return [
      { id: 'g1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', idNumber: 'ID123456', nationality: 'US', segment: 'VIP', totalStays: 5, loyaltyPoints: 500, preferences: ['Late checkout'], notes: '', companyName: '' }
    ]
  },

  getDemoStaff(): User[] {
    return [
      { id: 's1', name: 'Jane Smith', email: 'jane@hotel.com', role: 'Manager', department: 'Front Desk', avatarUrl: '', phone: '+1234567890', hireDate: '2024-01-15', status: 'active', address: '', emergencyContact: '', emergencyPhone: '', certifications: [], notes: '' }
    ]
  },

  getDemoInvoices(): Invoice[] { return [] },
  getDemoPayments(): Payment[] { return [] }
}

useAppStore.getState().loadInitialData()