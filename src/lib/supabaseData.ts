import { supabase } from './supabase'
import { useAppStore, type Property, type Room, type Booking, type Guest, type User, type Invoice, type Payment } from '@/store/useAppStore'

const DEMO_PROPERTY_ID = '00000000-0000-0000-0000-000000000001'

export const dataService = {
  async getProperties(): Promise<Property[]> {
    if (!supabase) return this.getDemoProperties()
    const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
    if (error || !data?.length) return this.getDemoProperties()
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
    if (!supabase) return this.getDemoBookings()
    let query = supabase.from('bookings').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error || !data?.length) return this.getDemoBookings()
    return (data || []).map(this.mapBookingFromDb)
  },

  async getGuests(propertyId?: string): Promise<Guest[]> {
    if (!supabase) return this.getDemoGuests()
    let query = supabase.from('guests').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error || !data?.length) return this.getDemoGuests()
    return (data || []).map(this.mapGuestFromDb)
  },

  async getStaff(propertyId?: string): Promise<User[]> {
    if (!supabase) return this.getDemoStaff()
    let query = supabase.from('users').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('name')
    if (error || !data?.length) return this.getDemoStaff()
    return (data || []).map(this.mapUserFromDb)
  },

  async getInvoices(propertyId?: string): Promise<Invoice[]> {
    if (!supabase) return this.getDemoInvoices()
    let query = supabase.from('invoices').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error || !data?.length) return this.getDemoInvoices()
    return data as any
  },

  async getPayments(propertyId?: string): Promise<Payment[]> {
    if (!supabase) return this.getDemoPayments()
    let query = supabase.from('payments').select('*')
    if (propertyId) query = query.eq('property_id', propertyId)
    const { data, error } = await query.order('processed_at', { ascending: false })
    if (error || !data?.length) return this.getDemoPayments()
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
      image: row.image_url,
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
      propertyName: row.property_name || 'Safari Lodge',
      roomId: row.room_id,
      roomNumber: row.room_number,
      roomType: row.room_type,
      checkIn: row.check_in,
      checkOut: row.check_out,
      nights: row.nights || 1,
      guests: row.guests || 1,
      status: row.status,
      paymentStatus: row.payment_status,
      amount: row.amount,
      ratePerNight: row.rate_per_night,
      depositPaid: row.deposit_paid,
      balanceDue: row.balance_due,
      source: row.source,
      specialRequests: row.special_requests,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
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
      companyName: row.company_name,
      createdAt: row.created_at,
      lastVisit: row.last_visit
    }
  },

  mapUserFromDb(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      department: row.department,
      avatar: row.avatar_url,
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