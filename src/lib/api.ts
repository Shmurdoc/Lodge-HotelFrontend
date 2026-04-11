import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001'

// Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: string
  requestId: string
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableStatuses: number[]
  retryableErrors: string[]
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'ECONNABORTED']
}

function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelay
  )
  const jitter = Math.random() * 0.3 * delay
  return delay + jitter
}

function isRetryable(error: unknown, config: RetryConfig): boolean {
  if (error instanceof Response) {
    return config.retryableStatuses.includes(error.status)
  }
  
  if (error instanceof Error) {
    const errorCode = (error as unknown as { code?: string }).code
    if (errorCode && config.retryableErrors.includes(errorCode)) {
      return true
    }
  }
  
  return false
}

// Get JWT token from Supabase session
async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      return { 'Authorization': `Bearer ${session.access_token}` }
    }
    return {}
  } catch (error) {
    console.error('Error getting auth session:', error)
    return {}
  }
}

interface ApiRequestOptions {
  method?: string
  retryConfig?: Partial<RetryConfig>
  body?: Record<string, unknown>
  headers?: Record<string, string>
}

// Main API request function
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { retryConfig, body, method = 'GET', headers, ...restOptions } = options
  const config = { ...defaultRetryConfig, ...retryConfig }
  const requestId = generateRequestId()
  let lastError: unknown

  const requestBody = body ? JSON.stringify(body) : undefined

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      // Get Supabase auth headers
      const authHeaders = await getAuthHeader()

      const response = await fetch(`${API_URL}${url}`, {
        method,
        body: requestBody,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...authHeaders,
          ...headers,
        },
        ...restOptions,
      })

      clearTimeout(timeoutId)

      if (!response.ok && config.retryableStatuses.includes(response.status)) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json() as ApiResponse<T>
      
      return {
        ...data,
        requestId,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      lastError = error

      if (attempt < config.maxRetries && isRetryable(error, config)) {
        const delay = calculateDelay(attempt, config)
        console.warn(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${delay.toFixed(0)}ms`, { url })
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }

      break
    }
  }

  return {
    success: false,
    error: {
      code: 'REQUEST_FAILED',
      message: lastError instanceof Error ? lastError.message : 'Unknown error',
      details: lastError,
    },
    timestamp: new Date().toISOString(),
    requestId,
  }
}

// API Client factory
export function createApiClient(baseUrl?: string) {
  const base = baseUrl || API_URL
  
  return {
    get: <T = unknown>(endpoint: string) =>
      apiRequest<T>(`${base}${endpoint}`),
    post: <T = unknown>(endpoint: string, body?: Record<string, unknown>) =>
      apiRequest<T>(`${base}${endpoint}`, { method: 'POST', body }),
    put: <T = unknown>(endpoint: string, body?: Record<string, unknown>) =>
      apiRequest<T>(`${base}${endpoint}`, { method: 'PUT', body }),
    patch: <T = unknown>(endpoint: string, body?: Record<string, unknown>) =>
      apiRequest<T>(`${base}${endpoint}`, { method: 'PATCH', body }),
    delete: <T = unknown>(endpoint: string) =>
      apiRequest<T>(`${base}${endpoint}`, { method: 'DELETE' }),
  }
}

// Convenience methods for common endpoints
export const api = {
  login: (email: string, password: string) => 
    apiRequest('/api/auth/login', { method: 'POST', body: { email, password } }),
  
  register: (email: string, password: string, firstName: string, lastName: string, phone: string) =>
    apiRequest('/api/auth/register', { method: 'POST', body: { email, password, firstName, lastName, phone } }),
  
  getBookings: (propertyId?: string) => 
    apiRequest(propertyId ? `/api/bookings?propertyId=${propertyId}` : '/api/bookings'),
  
  getBooking: (id: string) => 
    apiRequest(`/api/bookings/${id}`),
  
  createBooking: (booking: Record<string, unknown>) => 
    apiRequest('/api/bookings', { method: 'POST', body: booking }),
  
  updateBooking: (id: string, booking: Record<string, unknown>) => 
    apiRequest(`/api/bookings/${id}`, { method: 'PUT', body: booking }),
  
  cancelBooking: (id: string, reason: string) => 
    apiRequest(`/api/bookings/${id}/cancel`, { method: 'POST', body: { reason } }),
  
  checkIn: (bookingId: string, userId: string) => 
    apiRequest(`/api/bookings/${bookingId}/check-in`, { method: 'POST', body: { userId } }),
  
  checkOut: (bookingId: string, userId: string) => 
    apiRequest(`/api/bookings/${bookingId}/check-out`, { method: 'POST', body: { userId } }),
  
  getGuests: (propertyId?: string) => 
    apiRequest(propertyId ? `/api/guests?propertyId=${propertyId}` : '/api/guests'),
  
  getGuest: (id: string) => 
    apiRequest(`/api/guests/${id}`),
  
  createGuest: (guest: Record<string, unknown>) => 
    apiRequest('/api/guests', { method: 'POST' as const, body: guest }),
  
  updateGuest: (id: string, guest: Record<string, unknown>) => 
    apiRequest(`/api/guests/${id}`, { method: 'PUT' as const, body: guest }),
  
  // Rooms
  getRooms: (propertyId: string) => 
    apiRequest(`/api/rooms?propertyId=${propertyId}`),
  
  getRoom: (id: string) => 
    apiRequest(`/api/rooms/${id}`),
  
  createRoom: (room: Record<string, unknown>) => 
    apiRequest('/api/rooms', { method: 'POST', body: room }),
  
  updateRoom: (id: string, room: Record<string, unknown>) => 
    apiRequest(`/api/rooms/${id}`, { method: 'PUT', body: room }),
  
  updateRoomStatus: (id: string, status: string) => 
    apiRequest(`/api/rooms/${id}/status`, { method: 'PUT', body: { status } }),
  
  getProperties: () => 
    apiRequest('/api/properties'),
  
  getProperty: (id: string) => 
    apiRequest(`/api/properties/${id}`),
  
  createProperty: (property: Record<string, unknown>) => 
    apiRequest('/api/properties', { method: 'POST', body: property }),
  
  updateProperty: (id: string, property: Record<string, unknown>) => 
    apiRequest(`/api/properties/${id}`, { method: 'PUT', body: property }),
  
  getStaff: (propertyId: string) => 
    apiRequest(`/api/staff?propertyId=${propertyId}`),
  
  getStaffMember: (id: string) => 
    apiRequest(`/api/staff/${id}`),
  
  createStaff: (staff: Record<string, unknown>) => 
    apiRequest('/api/staff', { method: 'POST', body: staff }),
  
  updateStaff: (id: string, staff: Record<string, unknown>) => 
    apiRequest(`/api/staff/${id}`, { method: 'PUT', body: staff }),
  
  rfidCheckIn: (cardUid: string, readerId: string) => 
    apiRequest('/api/rfid/check-in', { method: 'POST', body: { cardUid, readerId } }),
  
  rfidCheckOut: (cardUid: string, readerId: string) => 
    apiRequest('/api/rfid/check-out', { method: 'POST', body: { cardUid, readerId } }),
  
  getOccupancyForecast: (propertyId: string, days: number = 90) => 
    apiRequest(`/api/analytics/occupancy-forecast/${propertyId}?days=${days}`),
  
  getRevenueForecast: (propertyId: string, days: number = 90) => 
    apiRequest(`/api/analytics/revenue-forecast/${propertyId}?days=${days}`),
  
  getDashboardMetrics: (propertyId: string) => 
    apiRequest(`/api/analytics/dashboard/${propertyId}`),
  
  getPriceRecommendation: (propertyId: string) => 
    apiRequest(`/api/revenue/price-recommendation/${propertyId}`),
  
  getRevenueAlerts: (propertyId: string) => 
    apiRequest(`/api/revenue/alerts/${propertyId}`),
  
  getInvoices: (propertyId: string) => 
    apiRequest(`/api/invoices?propertyId=${propertyId}`),
  
  getInvoice: (id: string) => 
    apiRequest(`/api/invoices/${id}`),
  
  createInvoice: (invoice: Record<string, unknown>) => 
    apiRequest('/api/invoices', { method: 'POST', body: invoice }),
  
  getPayments: (propertyId: string) => 
    apiRequest(`/api/payments?propertyId=${propertyId}`),
  
  processPayment: (payment: Record<string, unknown>) => 
    apiRequest('/api/payments', { method: 'POST', body: payment }),
  
  getHousekeepingTasks: (propertyId: string) => 
    apiRequest(`/api/housekeeping/tasks?propertyId=${propertyId}`),
  
  createHousekeepingTask: (task: Record<string, unknown>) => 
    apiRequest('/api/housekeeping/tasks', { method: 'POST', body: task }),
  
  updateTaskStatus: (taskId: string, status: string) => 
    apiRequest(`/api/housekeeping/tasks/${taskId}/status`, { method: 'PUT', body: { status } }),
  
  // Charts
  getOccupancyTrend: (propertyId: string, days: number = 30) => 
    apiRequest(`/api/chart/occupancy-trend/${propertyId}?days=${days}`),
  
  getRevenueBreakdown: (propertyId: string, days: number = 30) => 
    apiRequest(`/api/chart/revenue-breakdown/${propertyId}?days=${days}`),
  
  getGuestDemographics: (propertyId: string) => 
    apiRequest(`/api/chart/guest-demographics/${propertyId}`),
  
  // Dashboard
  getKpiSummary: (propertyId: string) => 
    apiRequest(`/api/dashboard/${propertyId}/kpi/summary`),
  
  getDailyKpi: (propertyId: string, date: string) => 
    apiRequest(`/api/dashboard/${propertyId}/kpi/daily?date=${date}`),
  
  // Channels (OTA)
  syncChannels: (propertyId: string) => 
    apiRequest('/api/channels/sync', { method: 'POST', body: { propertyId } }),
  
  getChannelStatus: (channelId: string) => 
    apiRequest(`/api/channels/status/${channelId}`),
}

export default api
