import {
  User, Booking, Guest, Room, Property, Invoice, Payment,
  InventoryItem, MaintenanceTicket, AttendanceRecord, Shift, RfidTag
} from '@/store/useAppStore';

/**
 * DATA SEEDER
 * Generates production-like test data for QA and development
 * Supports scenarios: 1000+ bookings, 500+ guests, 200+ rooms
 */

const FIRST_NAMES = [
  'Sarah', 'Mike', 'Emma', 'James', 'Lisa', 'David', 'Amy', 'Robert',
  'John', 'Jennifer', 'Michael', 'Jessica', 'Daniel', 'Patricia', 'Matthew',
  'Linda', 'Anthony', 'Barbara', 'Mark', 'Susan',
];

const LAST_NAMES = [
  'Johnson', 'Chen', 'Williams', 'Brown', 'Anderson', 'Martinez', 'Taylor',
  'Kim', 'Jones', 'Miller', 'Davis', 'Rodriguez', 'Lopez', 'Gonzalez',
  'Wilson', 'Garcia', 'Harris', 'Thomas', 'Lee', 'Walker',
];

const NATIONALITIES = [
  'South African', 'American', 'British', 'German', 'French', 'Spanish',
  'Italian', 'Dutch', 'Swedish', 'Australian', 'Canadian', 'Indian',
  'Chinese', 'Japanese', 'Brazilian', 'Mexican', 'Nigerian', 'Kenyan',
];

const ROOM_TYPES = [
  'Standard Room', 'Deluxe Room', 'Executive Suite', 'Presidential Suite',
  'Ocean View', 'Garden View', 'City View', 'Mountain View',
  'Family Room', 'Penthouse', 'Beachfront Villa', 'Private Suite',
];

const AMENITIES = [
  'WiFi', 'TV', 'AC', 'Mini Bar', 'Room Service', 'Balcony',
  'Jacuzzi', 'Butler Service', 'Private Pool', 'Fireplace',
  'Hot Tub', 'Sauna', 'Gym Access', 'Concierge', 'Kitchenette',
];

const DEPARTMENTS = [
  'Management', 'Front Desk', 'Housekeeping', 'Maintenance',
  'Finance', 'Kitchen', 'Security', 'Concierge', 'HR', 'IT',
];

const ROLES = [
  'Administrator', 'Manager', 'Supervisor', 'Front Desk',
  'Housekeeping', 'Maintenance', 'Chef', 'Security Officer',
  'Finance Manager', 'HR Manager', 'Concierge',
];

const BOOKING_SOURCES = ['Direct', 'Booking.com', 'Expedia', 'Agoda', 'Google Hotels', 'Walk-in', 'Phone'];
const GUEST_SEGMENTS = ['VIP', 'Frequent', 'New', 'Corporate'];
const PAYMENT_METHODS = ['cash', 'card', 'eft', 'wire_transfer', 'mobile_money', 'voucher'];

// ============================================
// HELPER FUNCTIONS
// ============================================

const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomName = (): string => `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;

const randomEmail = (name: string): string =>
  `${name.toLowerCase().replace(/\s/g, '.')}@example.com`;

const randomPhone = (): string =>
  `+27 ${String(Math.floor(Math.random() * 90) + 10).padStart(2, '0')} ${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')} ${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

const randomDate = (daysAgo: number = 30, future: boolean = false): Date => {
  const now = new Date();
  const offset = future
    ? Math.floor(Math.random() * daysAgo)
    : -Math.floor(Math.random() * daysAgo);
  return new Date(now.getTime() + offset * 86400000);
};

const randomAmount = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

// ============================================
// DATA GENERATORS
// ============================================

export const dataSeeder = {
  /**
   * Generate properties (hotels)
   */
  generateProperties(count: number = 4): Property[] {
    const properties: Property[] = [
      {
        id: 'prop-1',
        name: 'Nexus Grand Hotel',
        address: '123 Main Street, Sandton, Johannesburg',
        totalRooms: 200,
        occupiedRooms: Math.floor(Math.random() * 150),
        rating: 4.8,
        image: 'https://via.placeholder.com/400x300?text=Grand+Hotel',
        status: 'operational',
        phone: '+27 11 123 4567',
        email: 'grand@nexus.com',
        manager: 'Sarah Johnson',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Bar', 'Conference Rooms'],
        description: '5-star luxury hotel with world-class amenities',
      },
      {
        id: 'prop-2',
        name: 'Nexus Beach Resort',
        address: '45 Marine Drive, Durban',
        totalRooms: 120,
        occupiedRooms: Math.floor(Math.random() * 90),
        rating: 4.6,
        image: 'https://via.placeholder.com/400x300?text=Beach+Resort',
        status: 'operational',
        phone: '+27 31 234 5678',
        email: 'beach@nexus.com',
        manager: 'Mike Chen',
        checkInTime: '15:00',
        checkOutTime: '10:00',
        amenities: ['WiFi', 'Beach Access', 'Pool', 'Water Sports', 'Restaurant'],
        description: 'Beachfront luxury resort with water activities',
      },
      {
        id: 'prop-3',
        name: 'Nexus City Lodge',
        address: '78 Church Street, Cape Town',
        totalRooms: 80,
        occupiedRooms: Math.floor(Math.random() * 60),
        rating: 4.5,
        image: 'https://via.placeholder.com/400x300?text=City+Lodge',
        status: 'operational',
        phone: '+27 21 345 6789',
        email: 'city@nexus.com',
        manager: 'Lisa Anderson',
        checkInTime: '14:00',
        checkOutTime: '11:00',
        amenities: ['WiFi', 'Business Center', 'Gym', 'Restaurant'],
        description: 'Boutique city hotel in vibrant downtown',
      },
    ];

    return properties.slice(0, count);
  },

  /**
   * Generate staff/users with realistic data
   */
  generateStaff(propertyId: string, count: number = 50): User[] {
    const staff: User[] = [];
    for (let i = 0; i < count; i++) {
      const name = randomName();
      staff.push({
        id: `user-${propertyId}-${i}`,
        name,
        email: randomEmail(name),
        role: randomItem(ROLES),
        department: randomItem(DEPARTMENTS),
        phone: randomPhone(),
        hireDate: randomDate(365).toISOString().split('T')[0],
        status: randomItem(['active', 'active', 'active', 'inactive', 'on_leave']),
        address: `${randomAmount(1, 999)} Street, City`,
        emergencyContact: randomName(),
        emergencyPhone: randomPhone(),
      });
    }
    return staff;
  },

  /**
   * Generate rooms with realistic distribution
   */
  generateRooms(propertyId: string, count: number = 200): Room[] {
    const rooms: Room[] = [];
    const statuses = ['available', 'occupied', 'cleaning', 'maintenance', 'reserved'];

    for (let i = 1; i <= count; i++) {
      const floor = Math.floor(i / 20) + 1;
      const roomNumber = String(floor).padStart(2, '0') + String((i % 20) + 1).padStart(2, '0');

      rooms.push({
        id: `room-${propertyId}-${i}`,
        propertyId,
        number: roomNumber,
        type: randomItem(ROOM_TYPES),
        floor,
        status: randomItem(statuses),
        price: randomAmount(1000, 8000),
        description: 'Comfortable and well-appointed room',
        amenities: [randomItem(AMENITIES)].filter(Boolean),
        image: 'https://via.placeholder.com/300x200?text=Hotel+Room',
        maxOccupancy: randomItem([2, 2, 2, 3, 4]),
        lastCleaned: randomDate(2).toISOString(),
        lastInspected: randomDate(7).toISOString(),
        bedType: randomItem(['Single', 'Double', 'Queen', 'King']),
        size: randomAmount(25, 120),
        view: randomItem(['City', 'Garden', 'Ocean', 'Mountain']),
      });
    }
    return rooms;
  },

  /**
   * Generate guests with realistic distribution
   */
  generateGuests(propertyId: string, count: number = 500): Guest[] {
    const guests: Guest[] = [];

    for (let i = 0; i < count; i++) {
      const name = randomName();
      guests.push({
        id: `guest-${propertyId}-${i}`,
        name,
        email: randomEmail(name),
        phone: randomPhone(),
        idNumber: `ID${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        nationality: randomItem(NATIONALITIES),
        segment: i < count * 0.05 ? 'VIP' : i < count * 0.15 ? 'Frequent' : i < count * 0.4 ? 'Corporate' : 'New',
        totalStays: i < count * 0.15 ? randomAmount(3, 50) : 0,
        loyaltyPoints: i < count * 0.15 ? randomAmount(100, 10000) : 0,
        preferences: i < count * 0.3 ? [randomItem(AMENITIES), randomItem(AMENITIES)] : [],
        notes: '',
        createdAt: randomDate(180).toISOString(),
        lastVisit: i < count * 0.15 ? randomDate(30).toISOString() : null,
        address: `${randomAmount(1, 999)} Guest Street, City`,
        dateOfBirth: randomDate(20000, false).toISOString().split('T')[0],
        passportNumber: `PP${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        emergencyContact: randomName(),
        emergencyPhone: randomPhone(),
        allergies: Math.random() > 0.9 ? ['Nuts', 'Dairy', 'Shellfish'] : [],
        vipLevel: i < count * 0.05 ? randomItem(['platinum', 'diamond']) : undefined,
        companyName: Math.random() > 0.7 ? `Company ${i}` : undefined,
      });
    }
    return guests;
  },

  /**
   * Generate bookings with realistic patterns
   */
  generateBookings(propertyId: string, guests: Guest[], rooms: Room[], count: number = 1000): Booking[] {
    const bookings: Booking[] = [];

    for (let i = 0; i < count; i++) {
      const guest = randomItem(guests);
      const room = randomItem(rooms);
      const checkIn = randomDate(90, true);
      const nights = randomAmount(1, 7);
      const checkOut = new Date(checkIn.getTime() + nights * 86400000);
      const amount = room.price * nights;

      bookings.push({
        id: `booking-${propertyId}-${i}`,
        guestId: guest.id,
        guestName: guest.name,
        guestEmail: guest.email,
        guestPhone: guest.phone,
        guestSegment: guest.segment,
        propertyId,
        propertyName: '',
        roomId: room.id,
        roomNumber: room.number,
        roomType: room.type,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        nights,
        guests: randomAmount(1, room.maxOccupancy),
        adults: randomAmount(1, 3),
        children: randomAmount(0, 2),
        status: i < count * 0.4 ? 'confirmed' : i < count * 0.65 ? 'checked-in' : i < count * 0.9 ? 'checked-out' : 'pending',
        paymentStatus: i < count * 0.85 ? 'paid' : i < count * 0.95 ? 'partial' : 'pending',
        amount,
        ratePerNight: room.price,
        depositPaid: amount * 0.2,
        balanceDue: amount * 0.8,
        source: randomItem(BOOKING_SOURCES),
        specialRequests: Math.random() > 0.7 ? 'Early check-in preferred' : '',
        notes: Math.random() > 0.8 ? 'VIP guest - extra service' : '',
        createdAt: randomDate(90).toISOString(),
      });
    }
    return bookings;
  },

  /**
   * Generate invoices matching bookings
   */
  generateInvoices(propertyId: string, bookings: Booking[], count: number): any[] {
    const invoices: any[] = [];

    for (let i = 0; i < Math.min(count, bookings.length); i++) {
      const booking = bookings[i];

      invoices.push({
        id: `invoice-${propertyId}-${i}`,
        invoiceNumber: `INV-${String(i).padStart(6, '0')}`,
        type: 'booking',
        bookingId: booking.id,
        guestId: booking.guestId,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        propertyId,
        items: [
          {
            description: `${booking.nights} nights at ${booking.roomType}`,
            quantity: 1,
            unitPrice: booking.amount,
            taxRate: 0.15,
            amount: booking.amount,
          },
        ],
        subtotal: booking.amount,
        taxAmount: booking.amount * 0.15,
        discountAmount: 0,
        total: booking.amount * 1.15,
        currency: 'ZAR',
        status: booking.paymentStatus === 'paid' ? 'paid' : 'pending',
        issueDate: booking.createdAt,
        dueDate: booking.checkIn,
        createdAt: booking.createdAt,
        createdBy: 'system',
      });
    }
    return invoices;
  },

  /**
   * Generate payments for bookings
   */
  generatePayments(propertyId: string, bookings: Booking[], guests: Guest[]): Payment[] {
    const payments: Payment[] = [];

    const paidBookings = bookings.filter((b) => b.paymentStatus === 'paid' || b.paymentStatus === 'partial');

    for (let i = 0; i < paidBookings.length; i++) {
      const booking = paidBookings[i];
      const guest = guests.find((g) => g.id === booking.guestId);

      payments.push({
        id: `payment-${propertyId}-${i}`,
        paymentNumber: `PAY-${String(i).padStart(6, '0')}`,
        bookingId: booking.id,
        guestId: booking.guestId,
        guestName: guest?.name || booking.guestName,
        propertyId,
        amount: booking.paymentStatus === 'partial' ? booking.depositPaid : booking.amount,
        currency: 'ZAR',
        method: randomItem(PAYMENT_METHODS),
        status: 'completed',
        reference: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        transactionId: `TXN-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        processedBy: 'cashier',
        processedAt: booking.createdAt,
        createdAt: booking.createdAt,
      });
    }
    return payments;
  },

  /**
   * Generate maintenance tickets
   */
  generateMaintenanceTickets(propertyId: string, rooms: Room[], count: number = 100): MaintenanceTicket[] {
    const tickets: MaintenanceTicket[] = [];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const statuses = ['pending', 'in_progress', 'completed', 'scheduled'];

    for (let i = 0; i < count; i++) {
      const createdAt = randomDate(90);
      tickets.push({
        id: `maint-${propertyId}-${i}`,
        roomId: Math.random() > 0.3 ? randomItem(rooms).id : undefined,
        title: randomItem([
          'AC Unit Repair',
          'Bathroom Faucet Leak',
          'Light Fixture Replacement',
          'Door Lock Repair',
          'Plumbing Issue',
          'Electrical Problem',
          'Paint Touch-up',
          'Deep Cleaning',
        ]),
        description: 'Maintenance required',
        priority: randomItem(priorities),
        status: randomItem(statuses),
        createdAt: createdAt.toISOString(),
        completedAt: randomDate(90).toISOString(),
        propertyId,
        estimatedCost: randomAmount(500, 5000),
        actualCost: Math.random() > 0.7 ? randomAmount(500, 5000) : undefined,
      });
    }
    return tickets;
  },

  /**
   * Generate attendance records
   */
  generateAttendance(propertyId: string, staff: User[], daysBack: number = 30): AttendanceRecord[] {
    const records: AttendanceRecord[] = [];

    for (let day = 0; day < daysBack; day++) {
      for (const employee of staff) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        const dateStr = date.toISOString().split('T')[0];

        const checkIn = new Date(`${dateStr}T08:00:00`);
        const checkOut = new Date(`${dateStr}T17:00:00`);

        records.push({
          id: `att-${employee.id}-${day}`,
          userId: employee.id,
          userName: employee.name,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          date: dateStr,
          status: randomItem(['present', 'present', 'present', 'late', 'absent', 'on_leave']),
          hoursWorked: 8,
          overtime: 0,
        });
      }
    }
    return records;
  },

  /**
   * Generate RFID tags for staff
   */
  generateRfidTags(staff: User[]): RfidTag[] {
    return staff.map((employee) => ({
      id: `rfid-${employee.id}`,
      tagNumber: `TAG-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      userId: employee.id,
      userName: employee.name,
      status: randomItem(['active', 'active', 'active', 'inactive']),
      accessLevel: employee.role,
      createdAt: new Date().toISOString(),
      lastUsed: randomDate(7).toISOString(),
    }));
  },

  /**
   * Generate inventory items
   */
  generateInventory(propertyId: string, count: number = 100): InventoryItem[] {
    const inventory: InventoryItem[] = [];
    const categories = ['Linens', 'Toiletries', 'Kitchen', 'Cleaning', 'Maintenance', 'F&B'];

    for (let i = 0; i < count; i++) {
      inventory.push({
        id: `inv-${propertyId}-${i}`,
        name: `Item ${i}`,
        category: randomItem(categories),
        quantity: randomAmount(10, 500),
        unit: randomItem(['pieces', 'sets', 'bottles', 'kg', 'liters', 'boxes']),
        reorderLevel: randomAmount(5, 50),
        price: randomAmount(10, 1000),
        supplier: `Supplier ${Math.floor(i / 10)}`,
        sku: `SKU-${String(i).padStart(6, '0')}`,
        lastRestocked: randomDate(30).toISOString(),
        expiryDate: randomDate(90, true).toISOString().split('T')[0],
        location: `Store ${Math.floor(i / 25)}`,
        minOrderQuantity: randomAmount(5, 50),
      });
    }
    return inventory;
  },

  /**
   * Generate shifts for staff
   */
  generateShifts(propertyId: string, staff: User[], daysAhead: number = 60): Shift[] {
    const shifts: Shift[] = [];
    const shiftTypes = [
      { start: '06:00', end: '14:00' },
      { start: '14:00', end: '22:00' },
      { start: '22:00', end: '06:00' },
    ];

    for (let day = 0; day < daysAhead; day++) {
      for (const employee of staff.slice(0, Math.min(20, staff.length))) {
        const date = new Date();
        date.setDate(date.getDate() + day);
        const dateStr = date.toISOString().split('T')[0];
        const shift = randomItem(shiftTypes);

        shifts.push({
          id: `shift-${employee.id}-${day}`,
          userId: employee.id,
          userName: employee.name,
          startTime: shift.start,
          endTime: shift.end,
          date: dateStr,
          role: employee.role,
          status: randomItem(['scheduled', 'completed', 'cancelled']),
          department: employee.department,
        });
      }
    }
    return shifts;
  },

  /**
   * Generate complete dataset
   */
  async generateCompleteDataset(options?: {
    properties?: number;
    staffPerProperty?: number;
    roomsPerProperty?: number;
    guestsPerProperty?: number;
    bookingsPerProperty?: number;
  }) {
    const {
      properties: propCount = 3,
      staffPerProperty = 50,
      roomsPerProperty = 200,
      guestsPerProperty = 500,
      bookingsPerProperty = 1000,
    } = options || {};

    const properties = this.generateProperties(propCount);

    const allData = {
      properties,
      users: [] as User[],
      rooms: [] as Room[],
      guests: [] as Guest[],
      bookings: [] as Booking[],
      invoices: [] as any[],
      payments: [] as Payment[],
      maintenanceTickets: [] as MaintenanceTicket[],
      attendance: [] as AttendanceRecord[],
      rfidTags: [] as RfidTag[],
      inventory: [] as InventoryItem[],
      shifts: [] as Shift[],
    };

    for (const prop of properties) {
      const staff = this.generateStaff(prop.id, staffPerProperty);
      const rooms = this.generateRooms(prop.id, roomsPerProperty);
      const guests = this.generateGuests(prop.id, guestsPerProperty);
      const bookings = this.generateBookings(prop.id, guests, rooms, bookingsPerProperty);

      allData.users.push(...staff);
      allData.rooms.push(...rooms);
      allData.guests.push(...guests);
      allData.bookings.push(...bookings);
      allData.invoices.push(...this.generateInvoices(prop.id, bookings, Math.floor(bookingsPerProperty * 0.8)));
      allData.payments.push(...this.generatePayments(prop.id, bookings, guests));
      allData.maintenanceTickets.push(...this.generateMaintenanceTickets(prop.id, rooms, 100));
      allData.attendance.push(...this.generateAttendance(prop.id, staff, 30));
      allData.rfidTags.push(...this.generateRfidTags(staff));
      allData.inventory.push(...this.generateInventory(prop.id, 100));
      allData.shifts.push(...this.generateShifts(prop.id, staff, 60));
    }

    return allData;
  },
};

// Exported functions for demo controls
export const seedDatabase = () => {
  // This would seed the database with test data
  // For now, it's a stub since we're using real Supabase
  console.log('Seeding database with test data...');
};

export const resetDatabase = () => {
  // This would reset the database to initial state
  // For now, it's a stub since we're using real Supabase
  console.log('Resetting database to initial state...');
};

export default dataSeeder;
