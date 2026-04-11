import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const result = await response.json()
  return result.data || result
}

// ============================================
// PROPERTY ENDPOINTS
// ============================================
export const propertyApi = {
  getAll: () => fetchApi('/api/properties'),
  getById: (id: string) => fetchApi(`/api/properties/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/properties', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/api/properties/${id}`, { method: 'DELETE' }),
}

// ============================================
// ROOM ENDPOINTS
// ============================================
export const roomApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/rooms${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/rooms/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/rooms', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) => fetchApi(`/api/rooms/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  updateHousekeeping: (id: string, status: string) => fetchApi(`/api/rooms/${id}/housekeeping-status`, { method: 'PUT', body: JSON.stringify({ status }) }),
}

// ============================================
// BOOKING ENDPOINTS
// ============================================
export const bookingApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/bookings${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/bookings/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancel: (id: string, reason: string) => fetchApi(`/api/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  checkIn: (id: string, userId: string) => fetchApi(`/api/bookings/${id}/check-in`, { method: 'POST', body: JSON.stringify({ userId }) }),
  checkOut: (id: string, userId: string) => fetchApi(`/api/bookings/${id}/check-out`, { method: 'POST', body: JSON.stringify({ userId }) }),
}

// ============================================
// GUEST ENDPOINTS
// ============================================
export const guestApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/guests${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/guests/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/guests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/guests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  search: (query: string) => fetchApi(`/api/guests/search?q=${encodeURIComponent(query)}`),
}

// ============================================
// STAFF ENDPOINTS
// ============================================
export const staffApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/staff${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/staff/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/staff', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ============================================
// USER/AUTH ENDPOINTS
// ============================================
export const authApi = {
  getUsers: (propertyId: string, page = 1, pageSize = 20) => fetchApi(`/api/auth/users?propertyId=${propertyId}&page=${page}&pageSize=${pageSize}`),
  register: (data: Record<string, unknown>) => fetchApi('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (email: string, password: string) => fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getRoles: () => fetchApi('/api/auth/roles'),
  assignRole: (userId: string, roleId: string) => fetchApi(`/api/auth/users/${userId}/roles`, { method: 'POST', body: JSON.stringify({ roleId }) }),
}

// ============================================
// INVOICE ENDPOINTS
// ============================================
export const invoiceApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/invoices${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/invoices/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),
  generate: (folioId: string) => fetchApi(`/api/invoices/generate/${folioId}`, { method: 'POST' }),
}

// ============================================
// PAYMENT ENDPOINTS
// ============================================
export const paymentApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/payments${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/payments/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
  process: (data: Record<string, unknown>) => fetchApi('/api/payments/process', { method: 'POST', body: JSON.stringify(data) }),
}

// ============================================
// HOUSEKEEPING ENDPOINTS
// ============================================
export const housekeepingApi = {
  getTasks: (propertyId?: string) => fetchApi(`/api/housekeeping/tasks${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getTaskById: (id: string) => fetchApi(`/api/housekeeping/tasks/detail/${id}`),
  createTask: (data: Record<string, unknown>) => fetchApi('/api/housekeeping/tasks', { method: 'POST', body: JSON.stringify(data) }),
  assignTask: (taskId: string, userId: string) => fetchApi(`/api/housekeeping/tasks/${taskId}/assign`, { method: 'PUT', body: JSON.stringify({ userId }) }),
  startTask: (taskId: string) => fetchApi(`/api/housekeeping/tasks/${taskId}/start`, { method: 'POST' }),
  completeTask: (taskId: string, data: Record<string, unknown>) => fetchApi(`/api/housekeeping/tasks/${taskId}/complete`, { method: 'POST', body: JSON.stringify(data) }),
  inspectTask: (taskId: string, data: Record<string, unknown>) => fetchApi(`/api/housekeeping/tasks/${taskId}/inspect`, { method: 'POST', body: JSON.stringify(data) }),
}

// ============================================
// SETTINGS ENDPOINTS
// ============================================
export const settingsApi = {
  getPropertySettings: (propertyId: string) => fetchApi(`/api/settings/property/${propertyId}`),
  updatePropertySettings: (propertyId: string, data: Record<string, unknown>) => fetchApi(`/api/settings/property/${propertyId}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateOperational: (propertyId: string, data: Record<string, unknown>) => fetchApi(`/api/settings/property/${propertyId}/operational`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ============================================
// RATE ENDPOINTS
// ============================================
export const rateApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/rates${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/rates/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/rates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/rates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ============================================
// RATE PLAN ENDPOINTS
// ============================================
export const ratePlanApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/rate-plans${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/rate-plans/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/rate-plans', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/rate-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ============================================
// AMENITY ENDPOINTS
// ============================================
export const amenityApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/amenities${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/amenities/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/amenities', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/amenities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ============================================
// DASHBOARD ENDPOINTS
// ============================================
export const dashboardApi = {
  getData: (propertyId: string) => fetchApi(`/api/dashboard/${propertyId}`),
  getOccupancy: (propertyId: string) => fetchApi(`/api/dashboard/occupancy/${propertyId}`),
  getRevenue: (propertyId: string) => fetchApi(`/api/dashboard/revenue/${propertyId}`),
  getChartData: (propertyId: string, type: string) => fetchApi(`/api/charts/${propertyId}?type=${type}`),
}

// ============================================
// ANALYTICS ENDPOINTS
// ============================================
export const analyticsApi = {
  getOccupancyForecast: (propertyId: string, days = 90) => fetchApi(`/api/analytics/occupancy-forecast/${propertyId}?days=${days}`),
  getRevenueForecast: (propertyId: string, days = 90) => fetchApi(`/api/analytics/revenue-forecast/${propertyId}?days=${days}`),
  getDashboard: (propertyId: string) => fetchApi(`/api/analytics/dashboard/${propertyId}`),
}

// ============================================
// REVENUE ENDPOINTS
// ============================================
export const revenueApi = {
  getPriceRecommendation: (propertyId: string) => fetchApi(`/api/revenue/price-recommendation/${propertyId}`),
  getAlerts: (propertyId: string) => fetchApi(`/api/revenue/alerts/${propertyId}`),
}

// ============================================
// RFID ENDPOINTS
// ============================================
export const rfidApi = {
  checkIn: (cardUid: string, readerId: string) => fetchApi('/api/rfid/check-in', { method: 'POST', body: JSON.stringify({ cardUid, readerId }) }),
  checkOut: (cardUid: string, readerId: string) => fetchApi('/api/rfid/check-out', { method: 'POST', body: JSON.stringify({ cardUid, readerId }) }),
  getLogs: (propertyId?: string) => fetchApi(`/api/rfid/logs${propertyId ? `?propertyId=${propertyId}` : ''}`),
}

// ============================================
// GUEST FEEDBACK ENDPOINTS
// ============================================
export const feedbackApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/feedback${propertyId ? `?propertyId=${propertyId}` : ''}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
}

// ============================================
// EXPERIENCE ENDPOINTS
// ============================================
export const experienceApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/experiences${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getById: (id: string) => fetchApi(`/api/experiences/${id}`),
  create: (data: Record<string, unknown>) => fetchApi('/api/experiences', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => fetchApi(`/api/experiences/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
}

// ============================================
// GIFT CARD ENDPOINTS
// ============================================
export const giftCardApi = {
  getAll: () => fetchApi('/api/gift-cards'),
  create: (data: Record<string, unknown>) => fetchApi('/api/gift-cards', { method: 'POST', body: JSON.stringify(data) }),
  redeem: (code: string, amount: number) => fetchApi('/api/gift-cards/redeem', { method: 'POST', body: JSON.stringify({ code, amount }) }),
}

// ============================================
// AUDIT LOG ENDPOINTS
// ============================================
export const auditApi = {
  getAll: (propertyId?: string, entityType?: string) => {
    let url = '/api/audit-logs'
    const params = new URLSearchParams()
    if (propertyId) params.append('propertyId', propertyId)
    if (entityType) params.append('entityType', entityType)
    const query = params.toString()
    return fetchApi(query ? `${url}?${query}` : url)
  },
}

// ============================================
// CHANNEL ENDPOINTS (OTA)
// ============================================
export const channelApi = {
  getAll: (propertyId?: string) => fetchApi(`/api/channels${propertyId ? `?propertyId=${propertyId}` : ''}`),
  getConnection: (channelId: string) => fetchApi(`/api/channels/${channelId}/connection`),
  syncBookings: (channelId: string) => fetchApi(`/api/channels/${channelId}/sync`, { method: 'POST' }),
}

// ============================================
// NOTIFICATION ENDPOINTS
// ============================================
export const notificationApi = {
  getAll: (propertyId: string) => fetchApi(`/api/notifications/${propertyId}`),
  markRead: (id: string) => fetchApi(`/api/notifications/${id}/read`, { method: 'PUT' }),
  delete: (id: string) => fetchApi(`/api/notifications/${id}`, { method: 'DELETE' }),
}

// ============================================
// HEALTH CHECK
// ============================================
export const healthApi = {
  check: () => fetchApi('/health/live'),
  checkDetailed: () => fetchApi('/health'),
}

export default {
  property: propertyApi,
  room: roomApi,
  booking: bookingApi,
  guest: guestApi,
  staff: staffApi,
  auth: authApi,
  invoice: invoiceApi,
  payment: paymentApi,
  housekeeping: housekeepingApi,
  settings: settingsApi,
  rate: rateApi,
  ratePlan: ratePlanApi,
  amenity: amenityApi,
  dashboard: dashboardApi,
  analytics: analyticsApi,
  revenue: revenueApi,
  rfid: rfidApi,
  feedback: feedbackApi,
  experience: experienceApi,
  giftCard: giftCardApi,
  audit: auditApi,
  channel: channelApi,
  notification: notificationApi,
  health: healthApi,
}