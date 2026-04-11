import { supabase } from './supabase'
import { useAppStore, type Property, type Room, type Booking, type Guest, type User, type Invoice, type Payment, type Ticket } from '@/store/useAppStore'

const DEMO_PROPERTY_ID = '00000000-0000-0000-0000-000000000001'

export const dataService = {
  async getProperties(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error || !data?.length) {
      console.warn('Using demo properties')
      return this.getDemoProperties()
    }
    
    return data || []
  },

  async getRooms(propertyId?: string): Promise<Room[]> {
    let query = supabase.from('rooms').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('number')
    
    if (error || !data?.length) {
      console.warn('Using demo rooms')
      return this.getDemoRooms()
    }
    
    return (data || []).map(this.mapRoomFromDb)
  },

  async getBookings(propertyId?: string): Promise<Booking[]> {
    let query = supabase.from('bookings').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error || !data?.length) {
      console.warn('Using demo bookings')
      return this.getDemoBookings() as any
    }
    
    const bookings = (data || []).map(b => this.mapBookingFromDb(b))
    return bookings as unknown as Booking[]
  },

  async getGuests(propertyId?: string): Promise<Guest[]> {
    let query = supabase.from('guests').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error || !data?.length) {
      console.warn('Using demo guests')
      return this.getDemoGuests() as any
    }
    
    const guests = (data || []).map(g => this.mapGuestFromDb(g))
    return guests as unknown as Guest[]
  },

  async getStaff(propertyId?: string): Promise<User[]> {
    let query = supabase.from('users').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('name')
    
    if (error || !data?.length) {
      console.warn('Using demo staff')
      return this.getDemoStaff() as any
    }
    
    const staff = (data || []).map(u => this.mapUserFromDb(u))
    return staff as unknown as User[]
  },

  async getRooms(propertyId?: string): Promise<Room[]> {
    let query = supabase.from('rooms').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('number')
    
    if (error) {
      console.warn('Supabase fetch failed, using demo data:', error.message)
      return this.getDemoRooms()
    }
    
    return (data || []).map(this.mapRoomFromDb)
  },

  async getBookings(propertyId?: string): Promise<Booking[]> {
    let query = supabase.from('bookings').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.warn('Supabase fetch failed, using demo data:', error.message)
      return this.getDemoBookings() as any
    }
    
    const bookings = (data || []).map(b => this.mapBookingFromDb(b))
    return bookings as any
  },

  async getGuests(propertyId?: string): Promise<Guest[]> {
    let query = supabase.from('guests').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) {
      console.warn('Supabase fetch failed, using demo data:', error.message)
      return this.getDemoGuests() as any
    }
    
    const guests = (data || []).map(g => this.mapGuestFromDb(g))
    return guests as any
  },

  async getStaff(propertyId?: string): Promise<User[]> {
    let query = supabase.from('users').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('name')
    
    if (error) {
      console.warn('Supabase fetch failed, using demo data:', error.message)
      return this.getDemoStaff()
    }
    
    return (data || []).map(this.mapUserFromDb)
  },

  async getInvoices(propertyId?: string): Promise<Invoice[]> {
    let query = supabase.from('invoices').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) return []
    return (data || []).map(this.mapInvoiceFromDb)
  },

  async getPayments(propertyId?: string): Promise<Payment[]> {
    let query = supabase.from('payments').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) return []
    return (data || []).map(this.mapPaymentFromDb)
  },

  async getTickets(propertyId?: string): Promise<Ticket[]> {
    let query = supabase.from('tickets').select('*')
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) return []
    return (data || []).map(this.mapTicketFromDb)
  },

  mapRoomFromDb(room: Record<string, unknown>): Room {
    return {
      id: room.id as string,
      propertyId: room.property_id as string,
      number: room.number as string,
      type: room.type as string,
      floor: room.floor as number,
      status: (room.status as string) || 'available',
      price: room.price as number,
      description: room.description as string || '',
      amenities: (room.amenities as string[]) || [],
      image: room.image_url as string || '',
      maxOccupancy: room.max_occupancy as number,
      lastCleaned: room.last_cleaned as string,
      bedType: room.bed_type as string,
      size: room.size as number,
      view: room.view as string,
    }
  },

  mapBookingFromDb(booking: Record<string, unknown>): Booking {
    return {
      id: booking.id as string,
      guestId: booking.guest_id as string,
      guestName: booking.guest_name as string,
      guestEmail: booking.guest_email as string,
      guestPhone: booking.guest_phone as string,
      guestSegment: (booking.guest_segment as string) || 'New',
      propertyId: booking.property_id as string,
      propertyName: booking.property_name as string,
      roomId: booking.room_id as string,
      roomNumber: booking.room_number as string,
      roomType: booking.room_type as string,
      checkIn: booking.check_in as string,
      checkOut: booking.check_out as string,
      nights: booking.nights as number,
      guests: booking.guests as number,
      status: (booking.status as string) || 'pending',
      paymentStatus: (booking.payment_status as string) || 'pending',
      amount: booking.amount as number,
      ratePerNight: booking.rate_per_night as number,
      depositPaid: booking.deposit_paid as number,
      balanceDue: booking.balance_due as number,
      source: booking.source as string,
      specialRequests: booking.special_requests as string,
      notes: booking.notes as string,
      createdAt: booking.created_at as string,
    } as unknown as Booking
  },

  mapGuestFromDb(guest: Record<string, unknown>): Guest {
    return {
      id: guest.id as string,
      name: guest.name as string,
      email: guest.email as string,
      phone: guest.phone as string,
      idNumber: guest.id_number as string,
      nationality: guest.nationality as string,
      segment: (guest.segment as string) || 'New',
      totalStays: guest.total_stays as number,
      loyaltyPoints: guest.loyalty_points as number,
      preferences: (guest.preferences as string[]) || [],
      notes: guest.notes as string || '',
      createdAt: guest.created_at as string,
      lastVisit: guest.last_visit as string,
      address: guest.address as string,
      dateOfBirth: guest.date_of_birth as string,
      passportNumber: guest.passport_number as string,
      emergencyContact: guest.emergency_contact as string,
      emergencyPhone: guest.emergency_phone as string,
      allergies: (guest.allergies as string[]) || [],
      vipLevel: guest.vip_level as string,
      companyName: guest.company_name as string,
    } as unknown as Guest
  },

  mapUserFromDb(user: Record<string, unknown>): User {
    return {
      id: user.id as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as string,
      department: user.department as string,
      avatar: user.avatar_url as string,
      phone: user.phone as string,
      hireDate: user.hire_date as string,
      status: user.status as string,
      address: user.address as string,
      emergencyContact: user.emergency_contact as string,
      emergencyPhone: user.emergency_phone as string,
      certifications: user.certifications as string[] || [],
      notes: user.notes as string,
    }
  },

  mapInvoiceFromDb(invoice: Record<string, unknown>): Invoice {
    return {
      id: invoice.id as string,
      invoiceNumber: invoice.invoice_number as string,
      bookingId: invoice.booking_id as string,
      guestId: invoice.guest_id as string,
      guestName: invoice.guest_name as string,
      guestEmail: invoice.guest_email as string,
      propertyId: invoice.property_id as string,
      amount: invoice.amount as number,
      taxAmount: invoice.tax_amount as number,
      totalAmount: invoice.total_amount as number,
      status: (invoice.status as string) || 'pending',
      dueDate: invoice.due_date as string,
      paidDate: invoice.paid_date as string,
      createdAt: invoice.created_at as string,
    } as unknown as Invoice
  },

  mapPaymentFromDb(payment: Record<string, unknown>): Payment {
    return {
      id: payment.id as string,
      paymentNumber: payment.payment_number as string,
      invoiceId: payment.invoice_id as string,
      bookingId: payment.booking_id as string,
      guestId: payment.guest_id as string,
      guestName: payment.guest_name as string,
      propertyId: payment.property_id as string,
      amount: payment.amount as number,
      method: payment.method as string,
      status: (payment.status as string) || 'pending',
      reference: payment.reference as string,
      transactionId: payment.transaction_id as string,
      processedBy: payment.processed_by as string,
      processedAt: payment.processed_at as string,
      createdAt: payment.created_at as string,
    } as unknown as Payment
  },

  mapTicketFromDb(ticket: Record<string, unknown>): Ticket {
    return {
      id: ticket.id as string,
      title: ticket.title as string,
      description: ticket.description as string,
      status: (ticket.status as string) || 'open',
      priority: (ticket.priority as string) || 'medium',
      category: (ticket.category as string) || 'other',
      propertyId: ticket.property_id as string,
      assignedTo: ticket.assigned_to as string,
      createdBy: ticket.created_by as string,
      createdAt: ticket.created_at as string,
      updatedAt: ticket.updated_at as string,
    } as unknown as Ticket
  },

  getDemoProperties(): Property[] {
    return [
      {
        id: DEMO_PROPERTY_ID,
        name: 'Nexus Grand Hotel',
        address: '123 Main Street, Sandton, Johannesburg',
        totalRooms: 150,
        occupiedRooms: 87,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1566073771259-6a850549994a?w=800',
        status: 'operational',
        phone: '+27 11 000 0000',
        email: 'info@nexushotel.com',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'],
        description: 'Luxury 5-star hotel in the heart of Sandton',
      },
    ]
  },

  getDemoRooms(): Room[] {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `room-${i + 1}`,
      propertyId: DEMO_PROPERTY_ID,
      number: String(i + 101),
      type: ['Standard', 'Deluxe', 'Suite', 'Presidential'][i % 4],
      floor: Math.floor(i / 10) + 1,
      status: (['available', 'occupied', 'cleaning', 'maintenance'] as const)[i % 4],
      price: 1200 + (i % 4) * 800,
      description: 'Comfortable room with modern amenities',
      amenities: ['WiFi', 'TV', 'Air Conditioning'],
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
      maxOccupancy: 2,
    }))
  },

  getDemoBookings(): Booking[] {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `booking-${i + 1}`,
      guestId: `guest-${i + 1}`,
      guestName: [`John Smith`, 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown'][i % 5],
      guestEmail: `guest${i + 1}@example.com`,
      guestPhone: '+27 82 000 000' + i,
      guestSegment: 'New',
      propertyId: DEMO_PROPERTY_ID,
      propertyName: 'Nexus Grand Hotel',
      roomId: `room-${(i % 20) + 1}`,
      roomNumber: String(101 + (i % 20)),
      roomType: 'Standard',
      checkIn: new Date(Date.now() - i * 86400000).toISOString(),
      checkOut: new Date(Date.now() + (3 - i) * 86400000).toISOString(),
      nights: Math.floor(Math.random() * 7) + 1,
      guests: Math.floor(Math.random() * 2) + 1,
      status: 'pending',
      paymentStatus: 'pending',
      amount: 1500 + i * 500,
      source: 'Direct',
      createdAt: new Date(Date.now() - i * 172800000).toISOString(),
    })) as any
  },

  getDemoGuests(): Guest[] {
    return Array.from({ length: 15 }, (_, i) => ({
      id: `guest-${i + 1}`,
      name: ['John Smith', 'Jane Doe', 'Mike Johnson', 'Sarah Wilson', 'Tom Brown', 'Emily Davis', 'Chris Miller'][i % 7],
      email: `guest${i + 1}@example.com`,
      phone: '+27 82 000 000' + i,
      idNumber: `ID${100000 + i}`,
      nationality: 'South African',
      segment: 'New',
      totalStays: i,
      loyaltyPoints: i * 100,
      preferences: [],
      notes: '',
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      lastVisit: new Date(Date.now() - i * 43200000).toISOString(),
    })) as any
  },

  getDemoStaff(): User[] {
    return [
      { id: 'staff-1', name: 'Alice Johnson', email: 'alice@hotel.com', role: 'Manager', department: 'Front Desk', phone: '+27 82 111 1111', status: 'active' },
      { id: 'staff-2', name: 'Bob Smith', email: 'bob@hotel.com', role: 'Front Desk', department: 'Front Desk', phone: '+27 82 222 2222', status: 'active' },
      { id: 'staff-3', name: 'Carol White', email: 'carol@hotel.com', role: 'Housekeeping', department: 'Housekeeping', phone: '+27 82 333 3333', status: 'active' },
    ]
  },
}

export default dataService