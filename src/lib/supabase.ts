import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null
let configError: string | null = null

if (!supabaseUrl || !supabaseAnonKey) {
  configError = 'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  console.warn(configError)
} else {
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
    configError = `Failed to initialize Supabase: ${e}`
    console.error(configError)
  }
}

export { supabase, configError }

export const signIn = async (email: string, password: string) => {
  if (!supabase) return { data: null, error: new Error(configError || 'Supabase not initialized') }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUp = async (email: string, password: string, userData?: object) => {
  if (!supabase) return { data: null, error: new Error(configError || 'Supabase not initialized') }
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
  if (!supabase) return { error: new Error(configError || 'Supabase not initialized') }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const resetPassword = async (email: string) => {
  if (!supabase) return { data: null, error: new Error(configError || 'Supabase not initialized') }
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })
  return { data, error }
}

export const getSession = async () => {
  if (!supabase) return { session: null, error: new Error(configError || 'Supabase not initialized') }
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export const getCurrentUser = async () => {
  if (!supabase) return { user: null, error: new Error(configError || 'Supabase not initialized') }
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
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
}

export const subscribeToBookings = (propertyId: string, callback: (payload: unknown) => void) => {
  if (!supabase) return { unsubscribe: () => {} }
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
  if (!supabase) return { unsubscribe: () => {} }
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