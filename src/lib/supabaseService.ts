import { fetchApi } from './backendApi'
import type { User, Booking, Guest, Room, Property, Invoice, Payment, Expense, InventoryItem, Ticket, AttendanceRecord, MaintenanceTicket } from '@/store/useAppStore'

const DEMO_PROPERTY_ID = '00000000-0000-0000-0000-000000000001'

// ============================================
// USERS API (ASP.NET)
// ============================================
export const usersService = {
  async getAll(propertyId?: string): Promise<User[]> {
    try {
      const url = propertyId ? `/api/staff?propertyId=${propertyId}` : '/api/staff'
      const data = await fetchApi<User[]>(url)
      return data || []
    } catch (e) {
      console.warn('Using demo staff:', e)
      return getDemoStaff()
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const data = await fetchApi<User>(`/api/staff/${id}`)
      return data
    } catch (e) {
      return null
    }
  },

  async create(user: Partial<User>): Promise<User> {
    const data = await fetchApi<User>('/api/staff', { method: 'POST', body: JSON.stringify(user) })
    return data
  },

  async update(id: string, user: Partial<User>): Promise<User> {
    const data = await fetchApi<User>(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(user) })
    return data
  },

  async delete(id: string): Promise<void> {
    await fetchApi(`/api/staff/${id}`, { method: 'DELETE' })
  }
}

// ============================================
// BOOKINGS API (ASP.NET)
// ============================================
export const bookingsService = {
  async getAll(propertyId?: string): Promise<Booking[]> {
    try {
      const url = propertyId ? `/api/bookings?propertyId=${propertyId}` : '/api/bookings'
      const data = await fetchApi<Booking[]>(url)
      return data || []
    } catch (e) {
      console.warn('Using demo bookings:', e)
      return getDemoBookings()
    }
  },

  async getById(id: string): Promise<Booking | null> {
    try {
      const data = await fetchApi<Booking>(`/api/bookings/${id}`)
      return data
    } catch (e) {
      return null
    }
  },

  async create(booking: Partial<Booking>): Promise<Booking> {
    const data = await fetchApi<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(booking) })
    return data
  },

  async update(id: string, booking: Partial<Booking>): Promise<Booking> {
    const data = await fetchApi<Booking>(`/api/bookings/${id}`, { method: 'PUT', body: JSON.stringify(booking) })
    return data
  },

  async cancel(id: string, reason: string): Promise<void> {
    await fetchApi(`/api/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) })
  },

  async checkIn(id: string, userId: string): Promise<void> {
    await fetchApi(`/api/bookings/${id}/check-in`, { method: 'POST', body: JSON.stringify({ userId }) })
  },

  async checkOut(id: string, userId: string): Promise<void> {
    await fetchApi(`/api/bookings/${id}/check-out`, { method: 'POST', body: JSON.stringify({ userId }) })
  }
}

// ============================================
// GUESTS API (ASP.NET)
// ============================================
export const guestsService = {
  async getAll(propertyId?: string): Promise<Guest[]> {
    try {
      const url = propertyId ? `/api/guests?propertyId=${propertyId}` : '/api/guests'
      const data = await fetchApi<Guest[]>(url)
      return data || []
    } catch (e) {
      console.warn('Using demo guests:', e)
      return getDemoGuests()
    }
  },

  async getById(id: string): Promise<Guest | null> {
    try {
      const data = await fetchApi<Guest>(`/api/guests/${id}`)
      return data
    } catch (e) {
      return null
    }
  },

  async create(guest: Partial<Guest>): Promise<Guest> {
    const data = await fetchApi<Guest>('/api/guests', { method: 'POST', body: JSON.stringify(guest) })
    return data
  },

  async update(id: string, guest: Partial<Guest>): Promise<Guest> {
    const data = await fetchApi<Guest>(`/api/guests/${id}`, { method: 'PUT', body: JSON.stringify(guest) })
    return data
  },

  async search(query: string): Promise<Guest[]> {
    const data = await fetchApi<Guest[]>(`/api/guests/search?q=${encodeURIComponent(query)}`)
    return data || []
  }
}

// ============================================
// ROOMS API (ASP.NET)
// ============================================
export const roomsService = {
  async getAll(propertyId?: string): Promise<Room[]> {
    try {
      const url = propertyId ? `/api/rooms/property/${propertyId}` : '/api/rooms'
      const data = await fetchApi<Room[]>(url)
      return data || []
    } catch (e) {
      console.warn('Using demo rooms:', e)
      return getDemoRooms()
    }
  },

  async getById(id: string): Promise<Room | null> {
    try {
      const data = await fetchApi<Room>(`/api/rooms/${id}`)
      return data
    } catch (e) {
      return null
    }
  },

  async create(room: Partial<Room>): Promise<Room> {
    const data = await fetchApi<Room>('/api/rooms', { method: 'POST', body: JSON.stringify(room) })
    return data
  },

  async update(id: string, room: Partial<Room>): Promise<Room> {
    const data = await fetchApi<Room>(`/api/rooms/${id}`, { method: 'PUT', body: JSON.stringify(room) })
    return data
  },

  async updateStatus(id: string, status: string): Promise<void> {
    await fetchApi(`/api/rooms/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
  },

  async updateHousekeeping(id: string, status: string): Promise<void> {
    await fetchApi(`/api/rooms/${id}/housekeeping-status`, { method: 'PUT', body: JSON.stringify({ status }) })
  }
}

// ============================================
// PROPERTIES API (ASP.NET)
// ============================================
export const propertiesService = {
  async getAll(): Promise<Property[]> {
    try {
      const data = await fetchApi<Property[]>('/api/properties')
      return data || []
    } catch (e) {
      console.warn('Using demo properties:', e)
      return getDemoProperties()
    }
  },

  async getById(id: string): Promise<Property | null> {
    try {
      const data = await fetchApi<Property>(`/api/properties/${id}`)
      return data
    } catch (e) {
      return null
    }
  },

  async create(property: Partial<Property>): Promise<Property> {
    const data = await fetchApi<Property>('/api/properties', { method: 'POST', body: JSON.stringify(property) })
    return data
  },

  async update(id: string, property: Partial<Property>): Promise<Property> {
    const data = await fetchApi<Property>(`/api/properties/${id}`, { method: 'PUT', body: JSON.stringify(property) })
    return data
  }
}

// ============================================
// INVOICES API (ASP.NET)
// ============================================
export const invoicesService = {
  async getAll(propertyId?: string): Promise<Invoice[]> {
    try {
      const url = propertyId ? `/api/invoices?propertyId=${propertyId}` : '/api/invoices'
      const data = await fetchApi<Invoice[]>(url)
      return data || []
    } catch (e) {
      return []
    }
  },

  async getById(id: string): Promise<Invoice | null> {
    try {
      const data = await fetchApi<Invoice>(`/api/invoices/${id}`)
      return data
    } catch (e) {
      return null
    }
  },

  async create(invoice: Partial<Invoice>): Promise<Invoice> {
    const data = await fetchApi<Invoice>('/api/invoices', { method: 'POST', body: JSON.stringify(invoice) })
    return data
  }
}

// ============================================
// PAYMENTS API (ASP.NET)
// ============================================
export const paymentsService = {
  async getAll(propertyId?: string): Promise<Payment[]> {
    try {
      const url = propertyId ? `/api/payments?propertyId=${propertyId}` : '/api/payments'
      const data = await fetchApi<Payment[]>(url)
      return data || []
    } catch (e) {
      return []
    }
  },

  async create(payment: Partial<Payment>): Promise<Payment> {
    const data = await fetchApi<Payment>('/api/payments', { method: 'POST', body: JSON.stringify(payment) })
    return data
  }
}

// ============================================
// EXPENSES API (ASP.NET)
// ============================================
export const expensesService = {
  async getAll(propertyId?: string): Promise<Expense[]> {
    try {
      const url = propertyId ? `/api/expenses?propertyId=${propertyId}` : '/api/expenses'
      const data = await fetchApi<Expense[]>(url)
      return data || []
    } catch (e) {
      return []
    }
  }
}

// ============================================
// INVENTORY API (ASP.NET)
// ============================================
export const inventoryService = {
  async getAll(propertyId?: string): Promise<InventoryItem[]> {
    try {
      const url = propertyId ? `/api/inventory?propertyId=${propertyId}` : '/api/inventory'
      const data = await fetchApi<InventoryItem[]>(url)
      return data || []
    } catch (e) {
      return []
    }
  }
}

// ============================================
// TICKETS API (ASP.NET)
// ============================================
export const ticketsService = {
  async getAll(propertyId?: string): Promise<Ticket[]> {
    try {
      const url = propertyId ? `/api/tickets?propertyId=${propertyId}` : '/api/tickets'
      const data = await fetchApi<Ticket[]>(url)
      return data || []
    } catch (e) {
      return []
    }
  },

  async create(ticket: Partial<Ticket>): Promise<Ticket> {
    const data = await fetchApi<Ticket>('/api/tickets', { method: 'POST', body: JSON.stringify(ticket) })
    return data
  }
}

// ============================================
// ATTENDANCE API (ASP.NET)
// ============================================
export const attendanceService = {
  async getAll(propertyId?: string): Promise<AttendanceRecord[]> {
    try {
      const url = propertyId ? `/api/attendance?propertyId=${propertyId}` : '/api/attendance'
      const data = await fetchApi<AttendanceRecord[]>(url)
      return data || []
    } catch (e) {
      return []
    }
  }
}

// ============================================
// MAINTENANCE API (ASP.NET)
// ============================================
export const maintenanceService = {
  async getAll(propertyId?: string): Promise<MaintenanceTicket[]> {
    try {
      const url = propertyId ? `/api/maintenance?propertyId=${propertyId}` : '/api/maintenance'
      const data = await fetchApi<MaintenanceTicket[]>(url)
      return data || []
    } catch (e) {
      return []
    }
  }
}

// ============================================
// DEMO DATA FALLBACK
// ============================================
function getDemoProperties(): Property[] {
  return [{ id: DEMO_PROPERTY_ID, name: 'Safari Lodge', address: '123 Safari Way', totalRooms: 25, occupiedRooms: 18, rating: 4.5, status: 'operational' }]
}

function getDemoRooms(): Room[] {
  return [
    { id: '1', propertyId: DEMO_PROPERTY_ID, number: '101', type: 'Standard', floor: 1, status: 'available', price: 150, description: 'Standard Room', amenities: [], image: '', maxOccupancy: 2 },
    { id: '2', propertyId: DEMO_PROPERTY_ID, number: '102', type: 'Deluxe', floor: 1, status: 'occupied', price: 250, description: 'Deluxe Room', amenities: [], image: '', maxOccupancy: 3 }
  ]
}

function getDemoBookings(): Booking[] {
  return [
    { id: '1', guestId: 'g1', guestName: 'John Doe', guestEmail: 'john@example.com', guestPhone: '+1234567890', guestSegment: 'VIP', propertyId: DEMO_PROPERTY_ID, propertyName: 'Safari Lodge', roomId: '1', roomNumber: '101', roomType: 'Standard', checkIn: '2026-04-20', checkOut: '2026-04-25', nights: 5, guests: 2, status: 'confirmed', paymentStatus: 'paid', amount: 750, source: 'direct', createdAt: '2026-04-15' }
  ]
}

function getDemoGuests(): Guest[] {
  return [
    { id: 'g1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', idNumber: 'ID123456', nationality: 'US', segment: 'VIP', totalStays: 5, loyaltyPoints: 500, preferences: [], notes: '', companyName: '', createdAt: '2025-01-01', lastVisit: '2026-03-15' }
  ]
}

function getDemoStaff(): User[] {
  return [
    { id: 's1', name: 'Jane Smith', email: 'jane@hotel.com', role: 'Manager', department: 'Front Desk', avatar: '', phone: '+1234567890', hireDate: '2024-01-15', status: 'active', address: '', emergencyContact: '', emergencyPhone: '', certifications: [], notes: '' }
  ]
}