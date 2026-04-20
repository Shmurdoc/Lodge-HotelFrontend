import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  } catch (e) {
    console.error('Failed to initialize Supabase:', e)
  }
}

function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export const signIn = async (email: string, password: string) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUp = async (email: string, password: string, userData?: object) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: userData }
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) return { error: new Error('Supabase not configured') }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') }
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { data, error }
}

export const getSession = async () => {
  if (!supabase) return { session: null, error: new Error('Supabase not configured') }
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export const getCurrentUser = async () => {
  if (!supabase) return { user: null, error: new Error('Supabase not configured') }
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const onAuthStateChange = (callback: (event: string, session: unknown) => void) => {
  if (!supabase) {
    callback('SIGNED_OUT', null)
    return () => {}
  }
  return supabase.auth.onAuthStateChange(callback)
}

export const subscribeToTable = (table: string, callback: (payload: unknown) => void) => {
  if (!supabase) return { unsubscribe: () => {} }
  return supabase.channel(`public:${table}`).on('postgres_changes', { event: '*', schema: 'public', table }, callback).subscribe()
}

export const subscribeToBookings = (propertyId: string, callback: (payload: unknown) => void) => {
  if (!supabase) return { unsubscribe: () => {} }
  return supabase.channel('bookings').on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `propertyId=eq.${propertyId}` }, callback).subscribe()
}

export const subscribeToRooms = (propertyId: string, callback: (payload: unknown) => void) => {
  if (!supabase) return { unsubscribe: () => {} }
  return supabase.channel('rooms').on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `propertyId=eq.${propertyId}` }, callback).subscribe()
}

export { supabase, getSupabase }
export default supabase