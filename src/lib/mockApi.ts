import type {
  User, Booking, Guest, Room, Property, Invoice, Payment,
  Expense, InventoryItem, Ticket, RfidTag, AttendanceRecord
} from '@/store/useAppStore';

/**
 * Mock API Service
 * Used for development and testing without backend connectivity
 * Falls back to Supabase in production
 */

let mockDelay = 300; // Simulate network delay

// Mock data generators
export const generateMockBooking = (overrides?: Partial<Booking>): Booking => ({
  id: `booking-${Date.now()}`,
  guestId: `guest-${Math.random().toString(36).substr(2, 9)}`,
  guestName: `Guest ${Math.floor(Math.random() * 1000)}`,
  guestEmail: `guest${Math.random().toString(36).substr(2, 5)}@example.com`,
  guestPhone: '+27 82 000 0000',
  guestSegment: 'New',
  propertyId: 'property-1',
  propertyName: 'Nexus Grand Hotel',
  roomId: `room-${Math.floor(Math.random() * 100)}`,
  roomNumber: `${Math.floor(Math.random() * 3) + 1}${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
  roomType: 'Standard Suite',
  checkIn: new Date().toISOString(),
  checkOut: new Date(Date.now() + 86400000).toISOString(),
  nights: 1,
  guests: 2,
  status: 'pending' as const,
  paymentStatus: 'pending' as const,
  amount: 1500,
  ratePerNight: 1500,
  source: 'Direct',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const generateMockGuest = (overrides?: Partial<Guest>): Guest => ({
  id: `guest-${Date.now()}`,
  name: `Guest ${Math.floor(Math.random() * 10000)}`,
  email: `guest${Math.random().toString(36).substr(2, 5)}@example.com`,
  phone: '+27 82 000 0000',
  idNumber: `ID${Math.random().toString(36).substr(2, 8)}`,
  nationality: 'South African',
  segment: 'New',
  totalStays: 0,
  loyaltyPoints: 0,
  preferences: [],
  notes: '',
  createdAt: new Date().toISOString(),
  lastVisit: new Date().toISOString(),
  ...overrides,
});

export const generateMockRoom = (overrides?: Partial<Room>): Room => ({
  id: `room-${Date.now()}`,
  propertyId: 'property-1',
  number: String(Math.floor(Math.random() * 300)),
  type: 'Standard Suite',
  floor: Math.floor(Math.random() * 10),
  status: 'available' as const,
  price: 1500,
  description: 'Comfortable room with city view',
  amenities: ['WiFi', 'TV', 'AC'],
  image: 'https://via.placeholder.com/300x200',
  maxOccupancy: 2,
  bedType: 'Queen',
  ...overrides,
});

export const generateMockUser = (overrides?: Partial<User>): User => ({
  id: `user-${Date.now()}`,
  name: `Staff ${Math.floor(Math.random() * 100)}`,
  email: `staff${Math.random().toString(36).substr(2, 5)}@nexus.com`,
  role: 'Staff',
  department: 'General',
  phone: '+27 82 000 0000',
  hireDate: new Date().toISOString().split('T')[0],
  status: 'active' as const,
  ...overrides,
});

// Mock API Service
export const mockApiService = {
  /**
   * Set artificial delay for development
   */
  setDelay(ms: number) {
    mockDelay = ms;
  },

  /**
   * Simulate network delay
   */
  async delay() {
    return new Promise((resolve) => setTimeout(resolve, mockDelay));
  },

  /**
   * Mock booking endpoints
   */
  bookings: {
    async getAll(propertyId: string) {
      await mockApiService.delay();
      return Array.from({ length: 10 }, (_, i) =>
        generateMockBooking({
          id: `booking-${i}`,
          propertyId,
          guestId: `guest-${i}`,
          roomId: `room-${i}`,
        })
      );
    },

    async create(booking: Partial<Booking>) {
      await mockApiService.delay();
      return generateMockBooking(booking as Booking);
    },

    async update(id: string, updates: Partial<Booking>) {
      await mockApiService.delay();
      return generateMockBooking({ id, ...updates });
    },

    async delete(id: string) {
      await mockApiService.delay();
      return { success: true };
    },

    async getByDateRange(propertyId: string, startDate: string, endDate: string) {
      await mockApiService.delay();
      return Array.from({ length: 5 }, (_, i) =>
        generateMockBooking({
          id: `booking-range-${i}`,
          propertyId,
          checkIn: startDate,
          checkOut: endDate,
        })
      );
    },
  },

  /**
   * Mock guest endpoints
   */
  guests: {
    async getAll(propertyId: string) {
      await mockApiService.delay();
      return Array.from({ length: 20 }, (_, i) =>
        generateMockGuest({
          id: `guest-${i}`,
        })
      );
    },

    async search(query: string) {
      await mockApiService.delay();
      return Array.from({ length: 5 }, (_, i) =>
        generateMockGuest({
          id: `guest-search-${i}`,
          name: `${query} Guest ${i}`,
        })
      );
    },

    async create(guest: Partial<Guest>) {
      await mockApiService.delay();
      return generateMockGuest(guest as Guest);
    },

    async update(id: string, updates: Partial<Guest>) {
      await mockApiService.delay();
      return generateMockGuest({ id, ...updates });
    },
  },

  /**
   * Mock room endpoints
   */
  rooms: {
    async getAll(propertyId: string) {
      await mockApiService.delay();
      return Array.from({ length: 50 }, (_, i) =>
        generateMockRoom({
          id: `room-${i}`,
          propertyId,
          number: String(i + 1).padStart(3, '0'),
        })
      );
    },

    async getByStatus(propertyId: string, status: string) {
      await mockApiService.delay();
      return Array.from({ length: 10 }, (_, i) =>
        generateMockRoom({
          id: `room-status-${i}`,
          propertyId,
          status: status as any,
        })
      );
    },

    async updateStatus(id: string, status: string) {
      await mockApiService.delay();
      return generateMockRoom({ id, status: status as any });
    },
  },

  /**
   * Mock user/staff endpoints
   */
  users: {
    async getAll(propertyId: string) {
      await mockApiService.delay();
      return Array.from({ length: 15 }, (_, i) =>
        generateMockUser({
          id: `user-${i}`,
          name: ['Sarah Johnson', 'Mike Chen', 'Emma Williams', 'James Brown', 'Lisa Anderson'][i % 5],
          role: ['Manager', 'Supervisor', 'Staff', 'Manager', 'Finance Manager'][i % 5],
        })
      );
    },

    async create(user: Partial<User>) {
      await mockApiService.delay();
      return generateMockUser(user as User);
    },
  },

  /**
   * Mock statistics endpoints
   */
  stats: {
    async getOccupancy(propertyId: string) {
      await mockApiService.delay();
      return {
        occupied: Math.floor(Math.random() * 50),
        available: Math.floor(Math.random() * 30),
        cleaning: Math.floor(Math.random() * 10),
        maintenance: Math.floor(Math.random() * 5),
      };
    },

    async getRevenue(propertyId: string, days: number = 30) {
      await mockApiService.delay();
      return {
        total: Math.random() * 1000000,
        paid: Math.random() * 800000,
        pending: Math.random() * 200000,
      };
    },

    async getDashboard(propertyId: string) {
      await mockApiService.delay();
      return {
        occupancy: await mockApiService.stats.getOccupancy(propertyId),
        revenue: await mockApiService.stats.getRevenue(propertyId),
        guestCount: Math.floor(Math.random() * 500),
        staffCount: Math.floor(Math.random() * 50),
      };
    },
  },

  /**
   * Mock file operations
   */
  files: {
    async upload(file: File) {
      await mockApiService.delay();
      return {
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      };
    },

    async delete(url: string) {
      await mockApiService.delay();
      return { success: true };
    },
  },
};

// Demo mode utilities
let demoModeEnabled = false;

export const setDemoMode = (enabled: boolean) => {
  demoModeEnabled = enabled;
  if (enabled) {
    mockDelay = 100; // Fast responses in demo mode
  } else {
    mockDelay = 300; // Simulated latency in normal mode
  }
};

export const isDemoMode = (): boolean => demoModeEnabled;

export default mockApiService;
