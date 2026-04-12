import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  avatar?: string;
  phone?: string;
  hireDate?: string;
  status?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  certifications?: string[];
  notes?: string;
}

export interface Booking {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestSegment: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  adults?: number;
  children?: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  amount: number;
  ratePerNight?: number;
  depositPaid?: number;
  balanceDue?: number;
  source: string;
  specialRequests?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  nationality: string;
  segment: 'VIP' | 'Frequent' | 'New' | 'Corporate';
  totalStays: number;
  loyaltyPoints: number;
  preferences: string[];
  notes: string;
  createdAt: string;
  lastVisit: string;
  address?: string;
  dateOfBirth?: string;
  passportNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  allergies?: string[];
  vipLevel?: 'standard' | 'gold' | 'platinum' | 'diamond';
  companyName?: string;
}

export interface Room {
  id: string;
  propertyId: string;
  number: string;
  type: string;
  floor: number;
  status?: string;
  price: number;
  description: string;
  amenities: string[];
  image: string;
  maxOccupancy?: number;
  lastCleaned?: string;
  lastInspected?: string;
  bedType?: string;
  size?: number; // sq meters
  view?: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  totalRooms: number;
  occupiedRooms?: number;
  rating?: number;
  image?: string;
  status?: 'operational' | 'maintenance' | 'closed';
  phone?: string;
  email?: string;
  manager?: string;
  checkInTime?: string;
  checkOutTime?: string;
  amenities?: string[];
  description?: string;
}

export interface RatePlan {
  id: string;
  name: string;
  roomTypes: string[];
  baseRate: number;
  season: string;
  minStay: number;
  active: boolean;
  restrictions: string[];
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: string;
  icon: string;
  description: string;
  apiKey?: string;
  webhookUrl?: string;
  configuredBy?: string;
  configuredAt?: string;
}

export interface AppSettings {
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  vatRate: number;
  tourismLevy: number;
  darkMode: boolean;
  aiSmartRecommendations: boolean;
  aiAutoResponses: boolean;
  aiPredictiveAnalytics: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  propertyName?: string;
  timezone?: string;
  dateFormat?: string;
  language?: string;
  maintenanceMode?: boolean;
  backupFrequency?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  channelId?: string;
  attachments?: string[];
  type?: 'text' | 'system' | 'alert';
}

export interface RfidTag {
  id: string;
  tagNumber: string;
  userId: string;
  userName: string;
  status: 'active' | 'inactive' | 'lost' | 'blocked';
  accessLevel: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  status: 'present' | 'late' | 'absent' | 'on_leave';
  hoursWorked?: number;
  overtime?: number;
  notes?: string;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime: string;
  date: string;
  role: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'swapped';
  breakStart?: string;
  breakEnd?: string;
  overtime?: number;
  notes?: string;
  swappedWith?: string;
  department?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  receiptUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  propertyId?: string;
  vendor?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  price: number;
  supplier: string;
  sku?: string;
  lastRestocked?: string;
  expiryDate?: string;
  location?: string;
  minOrderQuantity?: number;
  notes?: string;
}

export interface ElectricityRecord {
  id: string;
  date: string;
  consumption: number;
  cost: number;
  peakDemand: number;
  zone: string;
}

export interface MaintenanceTicket {
  id?: string;
  roomId?: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  createdAt?: string;
  completedAt?: string;
  propertyId?: string;
  estimatedCost?: number;
  actualCost?: number;
}

// ============================================
// TICKET MANAGEMENT SYSTEM
// ============================================

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  type: 'issue' | 'task' | 'request' | 'incident';
  category: 'front_desk' | 'housekeeping' | 'maintenance' | 'food_beverage' | 'security' | 'it' | 'guest_service' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'cancelled';
  assigneeId?: string;
  assigneeName?: string;
  reporterId?: string;
  reporterName?: string;
  propertyId: string;
  roomId?: string;
  guestId?: string;
  guestName?: string;
  dueDate?: string;
  tags: string[];
  attachments: string[];
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

// ============================================
// ENHANCED FINANCE SYSTEM
// ============================================

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'booking' | 'service' | 'advance' | 'final';
  bookingId?: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  propertyId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'pending' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'refunded';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paidAmount?: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
  category: string;
}

export interface Payment {
  id: string;
  paymentNumber?: string;
  invoiceId?: string;
  bookingId?: string;
  guestId?: string;
  guestName?: string;
  propertyId: string;
  amount: number;
  currency?: string;
  method?: string;
  status?: string;
  reference?: string;
  transactionId?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt?: string;
  transactionDate?: string;
}

export interface AuditLog {
  id?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  timestamp?: string;
}

export interface TaxConfig {
  id: string;
  name: string;
  rate: number;
  type?: 'vat' | 'sales_tax' | 'tourism_levy' | 'city_tax' | 'service_charge';
  included?: boolean;
  applicableTo?: string[];
  validFrom?: string;
  validTo?: string;
  active?: boolean;
}

export interface AiInsight {
  id: string;
  type: 'revenue' | 'occupancy' | 'staffing' | 'maintenance' | 'guest';
  title: string;
  description: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  timestamp: string;
  dismissed?: boolean;
}

export interface Workflow {
  id?: string;
  name?: string;
  trigger?: string;
  actions?: string[];
  status?: string;
  lastRun?: string;
  description?: string;
  createdBy?: string;
  createdAt?: string;
  steps?: number;
  runs?: number;
}

// ============================================
// STORE STATE INTERFACE
// ============================================

export interface AppState {
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Data initialization
  isInitialized: boolean;
  initializeData: (propertyId: string) => Promise<void>;

  // Current user
  user: User | null;
  setUser: (user: User | null) => void;

  // Users CRUD
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Properties CRUD
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  deleteProperty: (id: string) => void;

  // Rooms CRUD
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  // Messages CRUD
  messages: Message[];
  addMessage: (message: Message) => void;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;

  // RFID Tags CRUD
  rfidTags: RfidTag[];
  setRfidTags: (tags: RfidTag[]) => void;
  addRfidTag: (tag: RfidTag) => void;
  updateRfidTag: (id: string, updates: Partial<RfidTag>) => void;
  deleteRfidTag: (id: string) => void;

  // Attendance CRUD
  attendance: AttendanceRecord[];
  addAttendance: (record: AttendanceRecord) => void;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;
  deleteAttendance: (id: string) => void;

  // Shifts CRUD
  shifts: Shift[];
  setShifts: (shifts: Shift[]) => void;
  addShift: (shift: Shift) => void;
  updateShift: (id: string, updates: Partial<Shift>) => void;
  deleteShift: (id: string) => void;

  // Expenses CRUD
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Inventory CRUD
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[]) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventory: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Electricity CRUD
  electricity: ElectricityRecord[];
  addElectricity: (record: ElectricityRecord) => void;
  updateElectricity: (id: string, updates: Partial<ElectricityRecord>) => void;
  deleteElectricity: (id: string) => void;

  // Maintenance Tickets CRUD
  maintenanceTickets: MaintenanceTicket[];
  addMaintenanceTicket: (ticket: MaintenanceTicket) => void;
  updateMaintenanceTicket: (id: string, updates: Partial<MaintenanceTicket>) => void;
  deleteMaintenanceTicket: (id: string) => void;

  // Ticket Management CRUD
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  addTicketComment: (ticketId: string, comment: TicketComment) => void;

  // Invoices CRUD
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Payments CRUD
  payments: Payment[];
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: AuditLog) => void;

  // Tax Configuration CRUD
  taxConfigs: TaxConfig[];
  addTaxConfig: (config: TaxConfig) => void;
  updateTaxConfig: (id: string, updates: Partial<TaxConfig>) => void;
  deleteTaxConfig: (id: string) => void;

  // AI Insights
  aiInsights: AiInsight[];
  addAiInsight: (insight: AiInsight) => void;
  updateAiInsight: (id: string, updates: Partial<AiInsight>) => void;
  deleteAiInsight: (id: string) => void;

  // Workflows CRUD
  workflows: Workflow[];
  setWorkflows: (workflows: Workflow[]) => void;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;

  // Bookings CRUD
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;

  // Guests CRUD
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;

  // Rate Plans CRUD
  ratePlans: RatePlan[];
  addRatePlan: (plan: RatePlan) => void;
  updateRatePlan: (id: string, updates: Partial<RatePlan>) => void;
  deleteRatePlan: (id: string) => void;

  // Integrations CRUD
  integrations: Integration[];
  addIntegration: (integration: Integration) => void;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  deleteIntegration: (id: string) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // UI State
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

// ============================================
// MOCK DATA (REMOVED - Using Supabase instead)
// ============================================
// All mock data has been removed in favor of real data from Supabase
// Use the initializeData() method in the store to load data from the backend

const defaultSettings: AppSettings = {
  checkInTime: '14:00',
  checkOutTime: '11:00',
  currency: 'ZAR',
  vatRate: 15,
  tourismLevy: 1,
  darkMode: true,
  aiSmartRecommendations: true,
  aiAutoResponses: true,
  aiPredictiveAnalytics: true,
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  propertyName: 'Nexus PMS',
  timezone: 'Africa/Johannesburg',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  maintenanceMode: false,
  backupFrequency: 'daily',
};

// ============================================
// STORE CREATION
// ============================================

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Loading and error states
      isLoading: false,
      error: null,
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Data initialization - loads all entities from Backend API
      isInitialized: false,
      initializeData: async (propertyId: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Loading data for property:', propertyId);
          
          // Load all data in parallel for better performance
          const [
            propertiesRes,
            roomsRes,
            bookingsRes,
            guestsRes,
            staffRes,
          ] = await Promise.all([
            api.getProperties(),
            api.getRooms(propertyId),
            api.getBookings(propertyId),
            api.getGuests(propertyId),
            api.getStaff(propertyId),
          ]);

          console.log('API Responses:', { propertiesRes, roomsRes, bookingsRes, guestsRes, staffRes });

          // Extract data from API responses with type casting
          const properties = propertiesRes.success && propertiesRes.data ? propertiesRes.data as unknown as Property[] : [];
          const rooms = roomsRes.success && roomsRes.data ? roomsRes.data as unknown as Room[] : [];
          const bookings = bookingsRes.success && bookingsRes.data ? bookingsRes.data as unknown as Booking[] : [];
          const guests = guestsRes.success && guestsRes.data ? guestsRes.data as unknown as Guest[] : [];
          const users = staffRes.success && staffRes.data ? staffRes.data as unknown as User[] : [];

          console.log('Extracted data:', { properties, rooms, bookings, guests, users });

          set({
            users,
            properties,
            rooms,
            bookings,
            guests,
            invoices: [],
            payments: [],
            expenses: [],
            inventory: [],
            tickets: [],
            attendance: [],
            maintenanceTickets: [],
            isInitialized: true,
            isLoading: false,
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to load data';
          set({ error: errorMsg, isLoading: false });
          console.error('Failed to initialize data:', err);
        }
      },

      // Current user
      user: null,
      setUser: (user) => set({ user }),

      // Users CRUD
      users: [],
      setUsers: (users) => set({ users }),
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, ...updates } : u)
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      })),

      // Properties CRUD
      properties: [],
      setProperties: (properties) => set({ properties }),
      addProperty: (property) => set((state) => ({ properties: [...state.properties, property] })),
      updateProperty: (id, updates) => set((state) => ({
        properties: state.properties.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProperty: (id) => set((state) => ({
        properties: state.properties.filter((p) => p.id !== id)
      })),

      // Rooms CRUD
      rooms: [],
      setRooms: (rooms) => set({ rooms }),
      addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
      updateRoom: (id, updates) => set((state) => ({
        rooms: state.rooms.map((r) => r.id === id ? { ...r, ...updates } : r)
      })),
      deleteRoom: (id) => set((state) => ({
        rooms: state.rooms.filter((r) => r.id !== id)
      })),

      // Messages CRUD
      messages: [],
      addMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
      markMessageRead: (id) => set((state) => ({
        messages: state.messages.map((m) => m.id === id ? { ...m, read: true } : m)
      })),
      deleteMessage: (id) => set((state) => ({
        messages: state.messages.filter((m) => m.id !== id)
      })),

      // RFID Tags CRUD
      rfidTags: [],
      setRfidTags: (rfidTags) => set({ rfidTags }),
      addRfidTag: (tag) => set((state) => ({ rfidTags: [...state.rfidTags, tag] })),
      updateRfidTag: (id, updates) => set((state) => ({
        rfidTags: state.rfidTags.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteRfidTag: (id) => set((state) => ({
        rfidTags: state.rfidTags.filter((t) => t.id !== id)
      })),

      // Attendance CRUD
      attendance: [],
      addAttendance: (record) => set((state) => ({ attendance: [...state.attendance, record] })),
      updateAttendance: (id, updates) => set((state) => ({
        attendance: state.attendance.map((a) => a.id === id ? { ...a, ...updates } : a)
      })),
      deleteAttendance: (id) => set((state) => ({
        attendance: state.attendance.filter((a) => a.id !== id)
      })),

      // Shifts CRUD
      shifts: [],
      setShifts: (shifts) => set({ shifts }),
      addShift: (shift) => set((state) => ({ shifts: [...state.shifts, shift] })),
      updateShift: (id, updates) => set((state) => ({
        shifts: state.shifts.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteShift: (id) => set((state) => ({
        shifts: state.shifts.filter((s) => s.id !== id)
      })),

      // Expenses CRUD
      expenses: [],
      addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map((e) => e.id === id ? { ...e, ...updates } : e)
      })),
      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
      })),

      // Inventory CRUD
      inventory: [],
      setInventory: (inventory) => set({ inventory }),
      addInventoryItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
      updateInventory: (id, updates) => set((state) => ({
        inventory: state.inventory.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteInventoryItem: (id) => set((state) => ({
        inventory: state.inventory.filter((i) => i.id !== id)
      })),

      // Electricity CRUD
      electricity: [],
      addElectricity: (record) => set((state) => ({ electricity: [...state.electricity, record] })),
      updateElectricity: (id, updates) => set((state) => ({
        electricity: state.electricity.map((e) => e.id === id ? { ...e, ...updates } : e)
      })),
      deleteElectricity: (id) => set((state) => ({
        electricity: state.electricity.filter((e) => e.id !== id)
      })),

      // Maintenance Tickets CRUD
      maintenanceTickets: [],
      addMaintenanceTicket: (ticket) => set((state) => ({ maintenanceTickets: [...state.maintenanceTickets, ticket] })),
      updateMaintenanceTicket: (id, updates) => set((state) => ({
        maintenanceTickets: state.maintenanceTickets.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteMaintenanceTicket: (id) => set((state) => ({
        maintenanceTickets: state.maintenanceTickets.filter((t) => t.id !== id)
      })),

      // AI Insights
      aiInsights: [],
      addAiInsight: (insight) => set((state) => ({ aiInsights: [insight, ...state.aiInsights] })),
      updateAiInsight: (id, updates) => set((state) => ({
        aiInsights: state.aiInsights.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteAiInsight: (id) => set((state) => ({
        aiInsights: state.aiInsights.filter((i) => i.id !== id)
      })),

      // Workflows CRUD
      workflows: [],
      setWorkflows: (workflows) => set({ workflows }),
      addWorkflow: (workflow) => set((state) => ({ workflows: [...state.workflows, workflow] })),
      updateWorkflow: (id, updates) => set((state) => ({
        workflows: state.workflows.map((w) => w.id === id ? { ...w, ...updates } : w)
      })),
      deleteWorkflow: (id) => set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id)
      })),

      // UI State
      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      activePage: 'dashboard',
      setActivePage: (activePage) => set({ activePage }),

      // Bookings CRUD
      bookings: [],
      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) => set((state) => ({ bookings: [...state.bookings, booking] })),
      updateBooking: (id, updates) => set((state) => ({
        bookings: state.bookings.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      deleteBooking: (id) => set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== id)
      })),

      // Guests CRUD
      guests: [],
      setGuests: (guests) => set({ guests }),
      addGuest: (guest) => set((state) => ({ guests: [...state.guests, guest] })),
      updateGuest: (id, updates) => set((state) => ({
        guests: state.guests.map((g) => g.id === id ? { ...g, ...updates } : g)
      })),
      deleteGuest: (id) => set((state) => ({
        guests: state.guests.filter((g) => g.id !== id)
      })),

      // Rate Plans CRUD
      ratePlans: [],
      addRatePlan: (plan) => set((state) => ({ ratePlans: [...state.ratePlans, plan] })),
      updateRatePlan: (id, updates) => set((state) => ({
        ratePlans: state.ratePlans.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteRatePlan: (id) => set((state) => ({
        ratePlans: state.ratePlans.filter((p) => p.id !== id)
      })),

      // Integrations CRUD
      integrations: [],
      addIntegration: (integration) => set((state) => ({ integrations: [...state.integrations, integration] })),
      updateIntegration: (id, updates) => set((state) => ({
        integrations: state.integrations.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteIntegration: (id) => set((state) => ({
        integrations: state.integrations.filter((i) => i.id !== id)
      })),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),

      // Tickets CRUD
      tickets: [],
      addTicket: (ticket) => set((state) => ({ tickets: [...state.tickets, ticket] })),
      updateTicket: (id, updates) => set((state) => ({
        tickets: state.tickets.map((t) => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
      })),
      deleteTicket: (id) => set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id)
      })),
      addTicketComment: (ticketId, comment) => set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === ticketId ? { ...t, comments: [...t.comments, comment] } : t
        )
      })),

      // Invoices CRUD
      invoices: [],
      addInvoice: (invoice) => set((state) => ({ invoices: [...state.invoices, invoice] })),
      updateInvoice: (id, updates) => set((state) => ({
        invoices: state.invoices.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),
      deleteInvoice: (id) => set((state) => ({
        invoices: state.invoices.filter((i) => i.id !== id)
      })),

      // Payments CRUD
      payments: [],
      addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
      updatePayment: (id, updates) => set((state) => ({
        payments: state.payments.map((p) => p.id === id ? { ...p, ...updates } : p)
      })),
      deletePayment: (id) => set((state) => ({
        payments: state.payments.filter((p) => p.id !== id)
      })),

      // Audit Logs
      auditLogs: [],
      addAuditLog: (log) => set((state) => ({ auditLogs: [log, ...state.auditLogs] })),

      // Tax Configs CRUD
      taxConfigs: [],
      addTaxConfig: (config) => set((state) => ({ taxConfigs: [...state.taxConfigs, config] })),
      updateTaxConfig: (id, updates) => set((state) => ({
        taxConfigs: state.taxConfigs.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTaxConfig: (id) => set((state) => ({
        taxConfigs: state.taxConfigs.filter((t) => t.id !== id)
      })),
    }),
    {
      name: 'nexus-pms-storage',
      partialize: (state) => ({
        bookings: state.bookings,
        guests: state.guests,
        rooms: state.rooms,
        users: state.users,
        properties: state.properties,
        settings: state.settings,
        integrations: state.integrations,
        ratePlans: state.ratePlans,
        expenses: state.expenses,
        inventory: state.inventory,
        maintenanceTickets: state.maintenanceTickets,
        workflows: state.workflows,
        messages: state.messages,
        sidebarCollapsed: state.sidebarCollapsed,
        tickets: state.tickets,
        invoices: state.invoices,
        payments: state.payments,
        auditLogs: state.auditLogs,
        taxConfigs: state.taxConfigs,
        aiInsights: state.aiInsights,
        rfidTags: state.rfidTags,
        attendance: state.attendance,
        shifts: state.shifts,
        electricity: state.electricity,
      }),
    }
  )
);
