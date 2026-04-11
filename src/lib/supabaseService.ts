import { supabase } from './supabase';
import type {
  User, Booking, Guest, Room, Property, Invoice, Payment, Expense,
  InventoryItem, Ticket, TicketComment, RfidTag, AttendanceRecord, Shift,
  MaintenanceTicket, ElectricityRecord, Message, AuditLog, RatePlan,
  TaxConfig, AiInsight, Workflow
} from '@/store/useAppStore';

const TABLE_NAMES = {
  users: 'users',
  bookings: 'bookings',
  guests: 'guests',
  rooms: 'rooms',
  properties: 'properties',
  invoices: 'invoices',
  payments: 'payments',
  expenses: 'expenses',
  inventory_items: 'inventory_items',
  tickets: 'tickets',
  ticket_comments: 'ticket_comments',
  rfid_tags: 'rfid_tags',
  attendance_records: 'attendance_records',
  shifts: 'shifts',
  maintenance_tickets: 'maintenance_tickets',
  electricity_records: 'electricity_records',
  messages: 'messages',
  audit_logs: 'audit_logs',
  rate_plans: 'rate_plans',
  tax_configs: 'tax_configs',
  ai_insights: 'ai_insights',
  workflows: 'workflows',
} as const;

// ============================================
// ERROR HANDLING
// ============================================
class SupabaseServiceError extends Error {
  constructor(
    message: string,
    public readonly table: string,
    public readonly operation: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'SupabaseServiceError';
    console.error(`[SupabaseService] ${table}.${operation}:`, message, originalError);
  }
}

// ============================================
// USERS CRUD
// ============================================
export const usersService = {
  async getAll(propertyId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.users)
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapUserFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch users', TABLE_NAMES.users, 'getAll', error);
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.users)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapUserFromDB(data) : null;
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch user', TABLE_NAMES.users, 'getById', error);
    }
  },

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.users)
        .insert([mapUserToDB(user as User)])
        .select()
        .single();

      if (error) throw error;
      return mapUserFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to create user', TABLE_NAMES.users, 'create', error);
    }
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.users)
        .update(mapUserToDB(updates as User))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapUserFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to update user', TABLE_NAMES.users, 'update', error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.users)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new SupabaseServiceError('Failed to delete user', TABLE_NAMES.users, 'delete', error);
    }
  },
};

// ============================================
// BOOKINGS CRUD
// ============================================
export const bookingsService = {
  async getAll(propertyId: string, limit: number = 100, offset: number = 0): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.bookings)
        .select('*')
        .eq('property_id', propertyId)
        .order('check_in', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map(mapBookingFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch bookings', TABLE_NAMES.bookings, 'getAll', error);
    }
  },

  async getByGuestId(guestId: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.bookings)
        .select('*')
        .eq('guest_id', guestId)
        .order('check_in', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapBookingFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch guest bookings', TABLE_NAMES.bookings, 'getByGuestId', error);
    }
  },

  async getByDateRange(propertyId: string, startDate: string, endDate: string): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.bookings)
        .select('*')
        .eq('property_id', propertyId)
        .gte('check_in', startDate)
        .lte('check_out', endDate);

      if (error) throw error;
      return (data || []).map(mapBookingFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch bookings by date', TABLE_NAMES.bookings, 'getByDateRange', error);
    }
  },

  async create(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.bookings)
        .insert([mapBookingToDB(booking as Booking)])
        .select()
        .single();

      if (error) throw error;
      return mapBookingFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to create booking', TABLE_NAMES.bookings, 'create', error);
    }
  },

  async update(id: string, updates: Partial<Booking>): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.bookings)
        .update(mapBookingToDB(updates as Booking))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapBookingFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to update booking', TABLE_NAMES.bookings, 'update', error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.bookings)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new SupabaseServiceError('Failed to delete booking', TABLE_NAMES.bookings, 'delete', error);
    }
  },
};

// ============================================
// GUESTS CRUD
// ============================================
export const guestsService = {
  async getAll(propertyId: string, limit: number = 100, offset: number = 0): Promise<Guest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.guests)
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map(mapGuestFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch guests', TABLE_NAMES.guests, 'getAll', error);
    }
  },

  async search(propertyId: string, query: string): Promise<Guest[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.guests)
        .select('*')
        .eq('property_id', propertyId)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return (data || []).map(mapGuestFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to search guests', TABLE_NAMES.guests, 'search', error);
    }
  },

  async create(guest: Omit<Guest, 'id' | 'createdAt'>): Promise<Guest> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.guests)
        .insert([mapGuestToDB(guest as Guest)])
        .select()
        .single();

      if (error) throw error;
      return mapGuestFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to create guest', TABLE_NAMES.guests, 'create', error);
    }
  },

  async update(id: string, updates: Partial<Guest>): Promise<Guest> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.guests)
        .update(mapGuestToDB(updates as Guest))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapGuestFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to update guest', TABLE_NAMES.guests, 'update', error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.guests)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new SupabaseServiceError('Failed to delete guest', TABLE_NAMES.guests, 'delete', error);
    }
  },
};

// ============================================
// ROOMS CRUD
// ============================================
export const roomsService = {
  async getAll(propertyId: string): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.rooms)
        .select('*')
        .eq('property_id', propertyId)
        .order('number', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapRoomFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch rooms', TABLE_NAMES.rooms, 'getAll', error);
    }
  },

  async getByStatus(propertyId: string, status: string): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.rooms)
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', status);

      if (error) throw error;
      return (data || []).map(mapRoomFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch rooms by status', TABLE_NAMES.rooms, 'getByStatus', error);
    }
  },

  async create(room: Omit<Room, 'id'>): Promise<Room> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.rooms)
        .insert([mapRoomToDB(room as Room)])
        .select()
        .single();

      if (error) throw error;
      return mapRoomFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to create room', TABLE_NAMES.rooms, 'create', error);
    }
  },

  async update(id: string, updates: Partial<Room>): Promise<Room> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.rooms)
        .update(mapRoomToDB(updates as Room))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapRoomFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to update room', TABLE_NAMES.rooms, 'update', error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.rooms)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new SupabaseServiceError('Failed to delete room', TABLE_NAMES.rooms, 'delete', error);
    }
  },
};

// ============================================
// PROPERTIES CRUD
// ============================================
export const propertiesService = {
  async getAll(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.properties)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(mapPropertyFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch properties', TABLE_NAMES.properties, 'getAll', error);
    }
  },

  async getById(id: string): Promise<Property | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.properties)
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? mapPropertyFromDB(data) : null;
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch property', TABLE_NAMES.properties, 'getById', error);
    }
  },

  async create(property: Omit<Property, 'id'>): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.properties)
        .insert([mapPropertyToDB(property as Property)])
        .select()
        .single();

      if (error) throw error;
      return mapPropertyFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to create property', TABLE_NAMES.properties, 'create', error);
    }
  },

  async update(id: string, updates: Partial<Property>): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.properties)
        .update(mapPropertyToDB(updates as Property))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapPropertyFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to update property', TABLE_NAMES.properties, 'update', error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.properties)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new SupabaseServiceError('Failed to delete property', TABLE_NAMES.properties, 'delete', error);
    }
  },
};

// ============================================
// INVOICES CRUD
// ============================================
export const invoicesService = {
  async getAll(propertyId: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.invoices)
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map(mapInvoiceFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch invoices', TABLE_NAMES.invoices, 'getAll', error);
    }
  },

  async getByStatus(propertyId: string, status: string) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.invoices)
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', status);

      if (error) throw error;
      return (data || []).map(mapInvoiceFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch invoices by status', TABLE_NAMES.invoices, 'getByStatus', error);
    }
  },

  async create(invoice: any) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.invoices)
        .insert([mapInvoiceToDB(invoice)])
        .select()
        .single();

      if (error) throw error;
      return mapInvoiceFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to create invoice', TABLE_NAMES.invoices, 'create', error);
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.invoices)
        .update(mapInvoiceToDB(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapInvoiceFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to update invoice', TABLE_NAMES.invoices, 'update', error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.invoices)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw new SupabaseServiceError('Failed to delete invoice', TABLE_NAMES.invoices, 'delete', error);
    }
  },
};

// ============================================
// PAYMENTS CRUD
// ============================================
export const paymentsService = {
  async getAll(propertyId: string, limit: number = 100, offset: number = 0) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.payments)
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map(mapPaymentFromDB);
    } catch (error) {
      throw new SupabaseServiceError('Failed to fetch payments', TABLE_NAMES.payments, 'getAll', error);
    }
  },

  async create(payment: any) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.payments)
        .insert([mapPaymentToDB(payment)])
        .select()
        .single();

      if (error) throw error;
      return mapPaymentFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to create payment', TABLE_NAMES.payments, 'create', error);
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.payments)
        .update(mapPaymentToDB(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapPaymentFromDB(data);
    } catch (error) {
      throw new SupabaseServiceError('Failed to update payment', TABLE_NAMES.payments, 'update', error);
    }
  },
};

// ============================================
// OTHER SERVICES (Simplified)
// ============================================
export const expensesService = {
  async getAll(propertyId: string) {
    const { data, error } = await supabase
      .from(TABLE_NAMES.expenses)
      .select('*')
      .eq('property_id', propertyId)
      .order('date', { ascending: false });

    if (error) throw new SupabaseServiceError('Failed to fetch expenses', TABLE_NAMES.expenses, 'getAll', error);
    return (data || []).map(mapExpenseFromDB);
  },

  async create(expense: any) {
    const { data, error } = await supabase
      .from(TABLE_NAMES.expenses)
      .insert([mapExpenseToDB(expense)])
      .select()
      .single();

    if (error) throw new SupabaseServiceError('Failed to create expense', TABLE_NAMES.expenses, 'create', error);
    return mapExpenseFromDB(data);
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from(TABLE_NAMES.expenses)
      .update(mapExpenseToDB(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) throw new SupabaseServiceError('Failed to update expense', TABLE_NAMES.expenses, 'update', error);
    return mapExpenseFromDB(data);
  },
};

export const inventoryService = {
  async getAll(propertyId: string) {
    const { data, error } = await supabase
      .from(TABLE_NAMES.inventory_items)
      .select('*')
      .eq('property_id', propertyId)
      .order('name', { ascending: true });

    if (error) throw new SupabaseServiceError('Failed to fetch inventory', TABLE_NAMES.inventory_items, 'getAll', error);
    return (data || []).map(mapInventoryFromDB);
  },
};

export const ticketsService = {
  async getAll(propertyId: string) {
    const { data, error } = await supabase
      .from(TABLE_NAMES.tickets)
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw new SupabaseServiceError('Failed to fetch tickets', TABLE_NAMES.tickets, 'getAll', error);
    return (data || []).map(mapTicketFromDB);
  },
};

export const attendanceService = {
  async getAll(propertyId: string) {
    const { data, error } = await supabase
      .from(TABLE_NAMES.attendance_records)
      .select('*')
      .eq('property_id', propertyId)
      .order('date', { ascending: false });

    if (error) throw new SupabaseServiceError('Failed to fetch attendance', TABLE_NAMES.attendance_records, 'getAll', error);
    return (data || []).map(mapAttendanceFromDB);
  },
};

export const maintenanceService = {
  async getAll(propertyId: string) {
    const { data, error } = await supabase
      .from(TABLE_NAMES.maintenance_tickets)
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw new SupabaseServiceError('Failed to fetch maintenance tickets', TABLE_NAMES.maintenance_tickets, 'getAll', error);
    return (data || []).map(mapMaintenanceFromDB);
  },
};

// ============================================
// DB TO APP MAPPERS
// ============================================
const mapUserFromDB = (db: any): User => ({
  id: db.id,
  name: db.name,
  email: db.email,
  role: db.role,
  department: db.department,
  avatar: db.avatar_url,
  phone: db.phone,
  hireDate: db.hire_date,
  status: db.status,
  address: db.address,
  emergencyContact: db.emergency_contact,
  emergencyPhone: db.emergency_phone,
  certifications: db.certifications,
  notes: db.notes,
});

const mapUserToDB = (user: User) => ({
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  avatar_url: user.avatar,
  phone: user.phone,
  hire_date: user.hireDate,
  status: user.status,
  address: user.address,
  emergency_contact: user.emergencyContact,
  emergency_phone: user.emergencyPhone,
  certifications: user.certifications,
  notes: user.notes,
});

const mapBookingFromDB = (db: any): Booking => ({
  id: db.id,
  guestId: db.guest_id,
  guestName: db.guest_name,
  guestEmail: db.guest_email,
  guestPhone: db.guest_phone,
  guestSegment: db.guest_segment,
  propertyId: db.property_id,
  propertyName: '',
  roomId: db.room_id,
  roomNumber: db.room_number,
  roomType: db.room_type,
  checkIn: db.check_in,
  checkOut: db.check_out,
  nights: db.nights,
  guests: db.num_guests,
  adults: db.adults,
  children: db.children,
  status: db.status,
  paymentStatus: db.payment_status,
  amount: db.amount,
  ratePerNight: db.rate_per_night,
  depositPaid: db.deposit_paid,
  balanceDue: db.balance_due,
  source: db.source,
  specialRequests: db.special_requests,
  notes: db.notes,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

const mapBookingToDB = (booking: Booking) => ({
  guest_id: booking.guestId,
  guest_name: booking.guestName,
  guest_email: booking.guestEmail,
  guest_phone: booking.guestPhone,
  guest_segment: booking.guestSegment,
  property_id: booking.propertyId,
  room_id: booking.roomId,
  room_number: booking.roomNumber,
  room_type: booking.roomType,
  check_in: booking.checkIn,
  check_out: booking.checkOut,
  nights: booking.nights,
  num_guests: booking.guests,
  adults: booking.adults,
  children: booking.children,
  status: booking.status,
  payment_status: booking.paymentStatus,
  amount: booking.amount,
  rate_per_night: booking.ratePerNight,
  deposit_paid: booking.depositPaid,
  balance_due: booking.balanceDue,
  source: booking.source,
  special_requests: booking.specialRequests,
  notes: booking.notes,
});

const mapGuestFromDB = (db: any): Guest => ({
  id: db.id,
  name: db.name,
  email: db.email,
  phone: db.phone,
  idNumber: db.id_number,
  nationality: db.nationality,
  segment: db.segment,
  totalStays: db.total_stays,
  loyaltyPoints: db.loyalty_points,
  preferences: db.preferences,
  notes: db.notes,
  createdAt: db.created_at,
  lastVisit: db.last_visit,
  address: db.address,
  dateOfBirth: db.date_of_birth,
  passportNumber: db.passport_number,
  emergencyContact: db.emergency_contact,
  emergencyPhone: db.emergency_phone,
  allergies: db.allergies,
  vipLevel: db.vip_level,
  companyName: db.company_name,
});

const mapGuestToDB = (guest: Guest) => ({
  name: guest.name,
  email: guest.email,
  phone: guest.phone,
  id_number: guest.idNumber,
  nationality: guest.nationality,
  segment: guest.segment,
  total_stays: guest.totalStays,
  loyalty_points: guest.loyaltyPoints,
  preferences: guest.preferences,
  notes: guest.notes,
  address: guest.address,
  date_of_birth: guest.dateOfBirth,
  passport_number: guest.passportNumber,
  emergency_contact: guest.emergencyContact,
  emergency_phone: guest.emergencyPhone,
  allergies: guest.allergies,
  vip_level: guest.vipLevel,
  company_name: guest.companyName,
});

const mapRoomFromDB = (db: any): Room => ({
  id: db.id,
  propertyId: db.property_id,
  number: db.number,
  type: db.type,
  floor: db.floor,
  status: db.status,
  price: db.price,
  description: db.description,
  amenities: db.amenities,
  image: db.image_url,
  maxOccupancy: db.max_occupancy,
  lastCleaned: db.last_cleaned,
  lastInspected: db.last_inspected,
  bedType: db.bed_type,
  size: db.size,
  view: db.view,
});

const mapRoomToDB = (room: Room) => ({
  property_id: room.propertyId,
  number: room.number,
  type: room.type,
  floor: room.floor,
  status: room.status,
  price: room.price,
  description: room.description,
  amenities: room.amenities,
  image_url: room.image,
  max_occupancy: room.maxOccupancy,
  last_cleaned: room.lastCleaned,
  last_inspected: room.lastInspected,
  bed_type: room.bedType,
  size: room.size,
  view: room.view,
});

const mapPropertyFromDB = (db: any): Property => ({
  id: db.id,
  name: db.name,
  address: db.address,
  totalRooms: db.total_rooms,
  occupiedRooms: db.occupied_rooms,
  rating: db.rating,
  image: db.image_url,
  status: db.status,
  phone: db.phone,
  email: db.email,
  manager: db.manager_id,
  checkInTime: db.check_in_time,
  checkOutTime: db.check_out_time,
  amenities: db.amenities,
  description: db.description,
});

const mapPropertyToDB = (property: Property) => ({
  name: property.name,
  address: property.address,
  total_rooms: property.totalRooms,
  occupied_rooms: property.occupiedRooms,
  rating: property.rating,
  image_url: property.image,
  status: property.status,
  phone: property.phone,
  email: property.email,
  manager_id: property.manager,
  check_in_time: property.checkInTime,
  check_out_time: property.checkOutTime,
  amenities: property.amenities,
  description: property.description,
});

const mapInvoiceFromDB = (db: any): Invoice => ({
  id: db.id,
  invoiceNumber: db.invoice_number,
  type: db.type,
  bookingId: db.booking_id,
  guestId: db.guest_id,
  guestName: db.guest_name,
  guestEmail: db.guest_email,
  propertyId: db.property_id,
  items: db.items || [],
  subtotal: db.subtotal,
  taxAmount: db.tax_amount,
  discountAmount: db.discount_amount,
  total: db.total,
  currency: db.currency,
  status: db.status,
  issueDate: db.issue_date,
  dueDate: db.due_date,
  paidDate: db.paid_date,
  paidAmount: db.paid_amount,
  paymentMethod: db.payment_method,
  notes: db.notes,
  createdAt: db.created_at,
  createdBy: db.created_by,
});

const mapInvoiceToDB = (invoice: Invoice) => ({
  invoice_number: invoice.invoiceNumber,
  type: invoice.type,
  booking_id: invoice.bookingId,
  guest_id: invoice.guestId,
  guest_name: invoice.guestName,
  guest_email: invoice.guestEmail,
  property_id: invoice.propertyId,
  items: invoice.items || [],
  subtotal: invoice.subtotal,
  tax_amount: invoice.taxAmount,
  discount_amount: invoice.discountAmount,
  total: invoice.total,
  currency: invoice.currency,
  status: invoice.status,
  issue_date: invoice.issueDate,
  due_date: invoice.dueDate,
  paid_date: invoice.paidDate,
  paid_amount: invoice.paidAmount,
  payment_method: invoice.paymentMethod,
  notes: invoice.notes,
});

const mapPaymentFromDB = (db: any): Payment => ({
  id: db.id,
  paymentNumber: db.payment_number,
  invoiceId: db.invoice_id,
  bookingId: db.booking_id,
  guestId: db.guest_id,
  guestName: db.guest_name,
  propertyId: db.property_id,
  amount: db.amount,
  currency: db.currency,
  method: db.method,
  status: db.status,
  reference: db.reference,
  transactionId: db.transaction_id,
  processedBy: db.processed_by,
  processedAt: db.processed_at,
  createdAt: db.created_at,
});

const mapPaymentToDB = (payment: Payment) => ({
  payment_number: payment.paymentNumber,
  invoice_id: payment.invoiceId,
  booking_id: payment.bookingId,
  guest_id: payment.guestId,
  guest_name: payment.guestName,
  property_id: payment.propertyId,
  amount: payment.amount,
  currency: payment.currency,
  method: payment.method,
  status: payment.status,
  reference: payment.reference,
  transaction_id: payment.transactionId,
  processed_by: payment.processedBy,
  processed_at: payment.processedAt,
});

const mapExpenseFromDB = (db: any): Expense => ({
  id: db.id,
  category: db.category,
  amount: db.amount,
  description: db.description,
  date: db.date,
  status: db.status,
  submittedBy: db.submitted_by,
  receiptUrl: db.receipt_url,
  approvedBy: db.approved_by,
  approvedAt: db.approved_at,
  propertyId: db.property_id,
  vendor: db.vendor,
  paymentMethod: db.payment_method,
  notes: db.notes,
});

const mapExpenseToDB = (expense: Expense) => ({
  category: expense.category,
  amount: expense.amount,
  description: expense.description,
  date: expense.date,
  status: expense.status,
  submitted_by: expense.submittedBy,
  receipt_url: expense.receiptUrl,
  approved_by: expense.approvedBy,
  approved_at: expense.approvedAt,
  property_id: expense.propertyId,
  vendor: expense.vendor,
  payment_method: expense.paymentMethod,
  notes: expense.notes,
});

const mapInventoryFromDB = (db: any): InventoryItem => ({
  id: db.id,
  name: db.name,
  category: db.category,
  quantity: db.quantity,
  unit: db.unit,
  reorderLevel: db.reorder_level,
  price: db.price,
  supplier: db.supplier,
  sku: db.sku,
  lastRestocked: db.last_restocked,
  expiryDate: db.expiry_date,
  location: db.location,
  minOrderQuantity: db.min_order_quantity,
  notes: db.notes,
});

const mapTicketFromDB = (db: any): Ticket => ({
  id: db.id,
  ticketNumber: db.ticket_number,
  title: db.title,
  description: db.description,
  type: db.type,
  category: db.category,
  priority: db.priority,
  status: db.status,
  assigneeId: db.assignee_id,
  assigneeName: '',
  reporterId: db.reporter_id,
  reporterName: '',
  propertyId: db.property_id,
  roomId: db.room_id,
  guestId: db.guest_id,
  guestName: db.guest_name,
  dueDate: db.due_date,
  tags: db.tags || [],
  attachments: [],
  comments: [],
  createdAt: db.created_at,
  updatedAt: db.updated_at,
  resolvedAt: db.resolved_at,
  closedAt: db.closed_at,
});

const mapAttendanceFromDB = (db: any): AttendanceRecord => ({
  id: db.id,
  userId: db.user_id,
  userName: '',
  checkIn: db.check_in,
  checkOut: db.check_out,
  date: db.date,
  status: db.status,
  hoursWorked: db.hours_worked,
  overtime: db.overtime,
  notes: db.notes,
});

const mapMaintenanceFromDB = (db: any): MaintenanceTicket => ({
  id: db.id,
  roomId: db.room_id,
  title: db.title,
  description: db.description,
  priority: db.priority,
  status: db.status,
  assignedTo: db.assigned_to,
  createdAt: db.created_at,
  completedAt: db.completed_at,
  propertyId: db.property_id,
  estimatedCost: db.estimated_cost,
  actualCost: db.actual_cost,
});
