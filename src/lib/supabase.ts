import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wxvtqfttyzlxsueoiwuw.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4dnRxZnR0eXpseHN1ZW9pd3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDg1NTcsImV4cCI6MjA5MTA4NDU1N30.OQu9WSde6Wd7kRpuqFN4JWISGSbwkTq7Vw5rDJ3gxJ8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUp = async (email: string, password: string, userData?: object) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { data, error }
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const onAuthStateChange = (callback: (event: string, session: unknown) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Realtime subscription helpers
export const subscribeToTable = (table: string, callback: (payload: unknown) => void) => {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
}

export const subscribeToBookings = (propertyId: string, callback: (payload: unknown) => void) => {
  return supabase
    .channel('bookings')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'bookings',
      filter: `propertyId=eq.${propertyId}`
    }, callback)
    .subscribe()
}

export const subscribeToRooms = (propertyId: string, callback: (payload: unknown) => void) => {
  return supabase
    .channel('rooms')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'rooms',
      filter: `propertyId=eq.${propertyId}`
    }, callback)
    .subscribe()
}

export default supabase
